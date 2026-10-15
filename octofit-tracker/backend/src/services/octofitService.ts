import { Activity, Team, User, Workout } from '../models/index.js';
import { Types } from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    !Types.ObjectId.isValid(userId) ||
    !Types.ObjectId.isValid(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity details are invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team details are required'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !Types.ObjectId.isValid(member))
  ) {
    throw Object.assign(new Error('Team details are invalid'), { status: 400 });
  }

  const memberIds = members as string[];
  if (memberIds.length > 0) {
    const memberCount = await User.countDocuments({ _id: { $in: memberIds } });
    if (memberCount !== new Set(memberIds).size) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    {
      $lookup: {
        from: Team.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);

  return totals.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    running: 'endurance',
    cycle: 'endurance',
    cycling: 'endurance',
    strength: 'strength',
  };
  const preferredFocus = recentActivity
    ? activityFocus[recentActivity.type.toLowerCase()] ?? user.fitnessGoal.toLowerCase()
    : user.fitnessGoal.toLowerCase();

  const goalFocus = user.fitnessGoal.toLowerCase();
  let workouts = await Workout.find({ focus: preferredFocus }).lean();
  let reason = recentActivity
    ? `Recommended based on your recent ${recentActivity.type} activity and ${preferredFocus} focus.`
    : `Recommended for your ${user.fitnessGoal} goal.`;

  if (workouts.length === 0 && preferredFocus !== goalFocus) {
    workouts = await Workout.find({ focus: goalFocus }).lean();
    if (workouts.length > 0) {
      reason = `Recommended for your ${user.fitnessGoal} goal, based on your recent ${recentActivity?.type} activity.`;
    }
  }
  if (workouts.length === 0) {
    workouts = await Workout.find().limit(1).lean();
    reason = recentActivity
      ? `Recommended because no workout matched your recent ${recentActivity.type} activity.`
      : `Recommended because no workout matched your ${user.fitnessGoal} goal.`;
  }

  return workouts.map((workout) => ({
    ...workout,
    reason,
  }));
}

export { User };
