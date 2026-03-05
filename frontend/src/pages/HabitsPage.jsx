import React, { useEffect, useState } from "react";
import { getHabits, logHabit } from "../api/habits";
import HabitCard from "../components/HabitCard";
import HabitList from "../components/HabitList";
import AnalyticsPanel from "../components/AnalyticsPanel";
import CreateHabitModal from "../components/CreateHabitModal";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchHabits = () => {
    setLoading(true);
    getHabits()
      .then(data => {
        setHabits(data);
        setLoading(false);
        if (data.length && !selectedHabit) setSelectedHabit(data[0]);
      })
      .catch(err => {
        setError(err.message || "Failed to load habits");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHabits();
    // eslint-disable-next-line
  }, []);

  const handleLog = async (habitId) => {
    try {
      await logHabit(habitId);
      fetchHabits();
    } catch (err) {
      setError(err.message || "Failed to log habit");
    }
  };

  // Responsive: stack on mobile, grid on desktop
  const isMobile = window.innerWidth < 700;

  const handleCreateHabit = async (data) => {
    try {
      // Remove times_per_week if daily
      const payload = { ...data };
      if (payload.frequency === "daily") delete payload.times_per_week;
      await import("../api/habits").then(mod => mod.createHabit(payload));
      setShowCreate(false);
      fetchHabits();
    } catch (err) {
      setError(err.message || "Failed to create habit");
    }
  };

  if (loading) return (
    <div className="terminal-panel" style={{marginTop: 48, textAlign: 'center'}}>
      <span className="terminal-blink">Loading habits...</span>
    </div>
  );
  if (error) return (
    <div className="terminal-panel error" style={{marginTop: 48, textAlign: 'center'}}>
      <span style={{color: 'var(--negative)'}}>{error}</span>
    </div>
  );

  if (!habits.length) {
    return (
      <>
        <div className="terminal-panel empty" style={{marginTop: 48, textAlign: 'center', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto'}}>
          <h2 style={{fontFamily: 'IBM Plex Mono, monospace', color: 'var(--muted)', fontWeight: 400, fontSize: 18, marginBottom: 8}}>
            No habits created yet.
          </h2>
          <div style={{color: 'var(--muted)', fontSize: 15, marginBottom: 24}}>
            Start by creating your first habit.
          </div>
          <button className="terminal-btn" onClick={() => setShowCreate(true)}>
            + Create Habit
          </button>
        </div>
        <CreateHabitModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateHabit} />
      </>
    );
  }

  return (
    <>
      <div className="dashboard-grid" style={{display: isMobile ? 'block' : 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 32}}>
        {/* Left: Habit List */}
        <section className="terminal-panel" style={{padding: 24, borderRadius: 8, background: 'var(--surface)', minHeight: 400}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18}}>
            <h2 style={{fontFamily: 'IBM Plex Serif, serif', fontWeight: 700, fontSize: 22, color: 'var(--text)'}}>Habits</h2>
            <button className="terminal-btn" onClick={() => setShowCreate(true)}>
              + Create
            </button>
          </div>
          <HabitList
            habits={habits}
            selectedHabit={selectedHabit}
            onSelect={setSelectedHabit}
            onLog={handleLog}
          />
        </section>
        {/* Right: Analytics summary */}
        {!isMobile && (
          <aside className="terminal-panel" style={{padding: 24, borderRadius: 8, background: 'var(--surface-2)', minHeight: 400}}>
            <AnalyticsPanel habit={selectedHabit} />
          </aside>
        )}
      </div>
      <CreateHabitModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreateHabit} />
    </>
  );
}
