import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadTeams = () => getJson<{ teams: { name: string; members: string[] }[] }>('/api/teams');

export default function Teams() {
  return <CapabilityCard<{ name: string; members: string[] }>
    title="Teams" description="Manage teams and members."
    load={loadTeams} responseKey="teams" emptyText="No teams yet."
    renderItem={(team) => <><strong>{team.name}</strong>: {team.members.length} members</>}
  />;
}
