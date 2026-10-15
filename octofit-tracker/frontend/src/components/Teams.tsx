import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard<{ name: string; members: string[] }>
    title="Teams" description="Manage teams and members."
    path="/api/teams" responseKey="teams" emptyText="No teams yet."
    renderItem={(team) => <><strong>{team.name}</strong>: {team.members.length} members</>}
  />;
}
