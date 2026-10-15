import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return <CapabilityCard<{ type: string; minutes: number; points: number }>
    title="Activities" description="Track student activity minutes and points."
    path="/api/activities" responseKey="activities" emptyText="No activities yet."
    renderItem={(activity) => <><strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points</>}
  />;
}
