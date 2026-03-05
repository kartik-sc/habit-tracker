
export default function HabitCard({ habit, onLog }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <h3>{habit.name}</h3>
      <p>{habit.description}</p>
      <div>Current streak: {habit.current_streak ?? 0}</div>
      <div>Longest streak: {habit.longest_streak ?? 0}</div>
      <div>Today: {habit.completed_today ? "✅" : "❌"}</div>
      <button onClick={() => onLog(habit.id)} style={{ marginTop: 8 }}>
        {habit.completed_today ? "Undo" : "Mark as done"}
      </button>
    </div>
  );
}