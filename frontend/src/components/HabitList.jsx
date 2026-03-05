import React from "react";
import HabitCard from "./HabitCard";

export default function HabitList({ habits, selectedHabit, onSelect, onLog }) {
  if (!habits.length) return null;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {habits.map(habit => (
        <div key={habit.id} onClick={() => onSelect(habit)} style={{cursor: 'pointer'}}>
          <HabitCard
            habit={habit}
            onLog={onLog}
            selected={selectedHabit && selectedHabit.id === habit.id}
          />
        </div>
      ))}
    </div>
  );
}
