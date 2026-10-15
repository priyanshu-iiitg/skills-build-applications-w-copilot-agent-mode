import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadLeaderboard = () => getJson<{ leaderboard: { teamName: string; totalPoints: number; rank: number }[] }>('/api/leaderboard');

export default function Leaderboard() {
  return <CapabilityCard<{ teamName: string; totalPoints: number; rank: number }>
    title="Leaderboard" description="Compare team point totals."
    load={loadLeaderboard} responseKey="leaderboard" emptyText="No rankings yet."
    renderItem={(entry) => <>Rank {entry.rank}: <strong>{entry.teamName}</strong>, {entry.totalPoints} points</>}
  />;
}
