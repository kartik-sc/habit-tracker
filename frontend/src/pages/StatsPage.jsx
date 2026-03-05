import React, { useEffect, useState } from "react";
import { getHabits, getAnalytics } from "../api/habits";
import CompletionLineChart from "../components/CompletionLineChart";
import WeeklyChart from "../components/WeeklyChart";
import HeatmapGrid from "../components/HeatmapGrid";

export default function StatsPage() {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMobile = window.innerWidth < 700;

  useEffect(() => {
    setLoading(true);
    getHabits()
      .then(async (habitsData) => {
        setHabits(habitsData);
        // Fetch analytics for each habit
        const analyticsData = {};
        for (const habit of habitsData) {
          try {
            analyticsData[habit.id] = await getAnalytics(habit.id);
          } catch (e) {
            analyticsData[habit.id] = null;
          }
        }
        setAnalytics(analyticsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analytics");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="terminal-panel" style={{marginTop: 48, textAlign: 'center'}}>
      <span className="terminal-blink">Loading analytics...</span>
    </div>
  );
  if (error) return (
    <div className="terminal-panel error" style={{marginTop: 48, textAlign: 'center'}}>
      <span style={{color: 'var(--negative)'}}>{error}</span>
    </div>
  );

  if (!habits.length) {
    return (
      <div className="terminal-panel empty" style={{marginTop: 48, textAlign: 'center', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto'}}>
        <h2 style={{fontFamily: 'IBM Plex Mono, monospace', color: 'var(--muted)', fontWeight: 400, fontSize: 18, marginBottom: 8}}>
          No habits to analyze.
        </h2>
        <div style={{color: 'var(--muted)', fontSize: 15, marginBottom: 24}}>
          Create a habit to see analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid" style={{display: isMobile ? 'block' : 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 32}}>
      {/* Left: Analytics charts */}
      <section className="terminal-panel" style={{padding: 24, borderRadius: 8, background: 'var(--surface)', minHeight: 400}}>
        <h2 style={{fontFamily: 'IBM Plex Serif, serif', fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 18}}>Analytics</h2>
        {habits.map(habit => {
          const a = analytics[habit.id];
          if (!a) return null;
          // Prepare data for charts
          const lineData = a.last_30_days?.map(d => ({ date: d.date, completed: d.completed ? 1 : 0 })) || [];
          const weeklyData = a.weekly_data || [];
          return (
            <div key={habit.id} style={{marginBottom: 40}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',color:'var(--accent)',fontWeight:600,fontSize:15,marginBottom:8}}>
                {habit.name}
              </div>
              <div style={{marginBottom:12}}>
                <span style={{color:'var(--muted)',fontSize:13}}>Current streak:</span> {a.current_streak} &nbsp;|
                <span style={{color:'var(--muted)',fontSize:13}}> Longest streak:</span> {a.longest_streak} &nbsp;|
                <span style={{color:'var(--muted)',fontSize:13}}> 30-day rate:</span> {a.completion_rate_30d}%
              </div>
              <div style={{marginBottom:18}}>
                <div className="section-label">WEEKLY COMPLETIONS</div>
                <WeeklyChart chartData={weeklyData} />
              </div>
              <div style={{marginBottom:18}}>
                <div className="section-label">STREAK LINE (LAST 30 DAYS)</div>
                <CompletionLineChart data={lineData} />
              </div>
              <div>
                <div className="section-label">ACTIVITY MAP — LAST 70 DAYS</div>
                <HeatmapGrid />
              </div>
            </div>
          );
        })}
      </section>
      {/* Right: Habit performance panels */}
      {!isMobile && (
        <aside className="terminal-panel" style={{padding: 24, borderRadius: 8, background: 'var(--surface-2)', minHeight: 400}}>
          <div style={{color: 'var(--muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 15}}>
            {habits.map(habit => {
              const a = analytics[habit.id];
              if (!a) return null;
              return (
                <div key={habit.id} style={{marginBottom: 32}}>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',color:'var(--accent)',fontWeight:600,fontSize:15,marginBottom:8}}>
                    {habit.name}
                  </div>
                  <div style={{marginBottom:8}}>
                    <span style={{color:'var(--muted)',fontSize:13}}>Current streak:</span> {a.current_streak} &nbsp;|
                    <span style={{color:'var(--muted)',fontSize:13}}>Longest streak:</span> {a.longest_streak} &nbsp;|
                    <span style={{color:'var(--muted)',fontSize:13}}>30-day rate:</span> {a.completion_rate_30d}%
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
