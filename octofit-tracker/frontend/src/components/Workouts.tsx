import { CapabilityCard } from './CapabilityCard.js';
export default function Workouts() {
  return <CapabilityCard<{ title: string; reason: string }>
    title="Workout suggestions" description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    responseKey="suggestions" emptyText="No workout suggestions yet."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>}
  />;
}
