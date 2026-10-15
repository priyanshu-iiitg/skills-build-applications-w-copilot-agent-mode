import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard<{ teamName: string; totalPoints: number; rank: number }>
    title="Leaderboard" description="Compare team point totals."
    path="/api/leaderboard" responseKey="leaderboard" emptyText="No rankings yet."
    renderItem={(entry) => <>Rank {entry.rank}: <strong>{entry.teamName}</strong>, {entry.totalPoints} points</>}
  />;
}
