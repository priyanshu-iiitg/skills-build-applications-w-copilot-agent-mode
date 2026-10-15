import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadWorkouts = () => getJson<{ suggestions: { title: string; reason: string }[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);

export default function Workouts() {
  return <CapabilityCard<{ title: string; reason: string }>
    title="Workout suggestions" description="Recommend workouts from activity patterns."
    load={loadWorkouts}
    responseKey="suggestions" emptyText="No workout suggestions yet."
    renderItem={(workout) => <><strong>{workout.title}</strong>: {workout.reason}</>}
  />;
}
