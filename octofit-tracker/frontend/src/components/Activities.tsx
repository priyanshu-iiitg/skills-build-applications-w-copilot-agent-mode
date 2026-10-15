import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadActivities = () => getJson<{ activities: { type: string; minutes: number; points: number }[] }>('/api/activities');

export default function Activities() {
  return <CapabilityCard<{ type: string; minutes: number; points: number }>
    title="Activities" description="Track student activity minutes and points."
    load={loadActivities} responseKey="activities" emptyText="No activities yet."
    renderItem={(activity) => <><strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points</>}
  />;
}
