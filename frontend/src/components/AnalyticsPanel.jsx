import { useState, useEffect } from "react";
import { getAnalytics } from "../api/habits.js";
import WeeklyChart from "./WeeklyChart.jsx";
import HeatmapGrid from "./HeatmapGrid.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────
function getStatus(rate) {
  if (rate >= 85) return "ELITE";
  if (rate >= 70) return "CONSISTENT";
  if (rate >= 50) return "BUILDING";
  if (rate >= 30) return "UNSTABLE";
  return "FAILING";
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="analytics-panel__empty">
      <div className="analytics-panel__empty-icon">
        <div style={{ width: 8, height: 8, background: "var(--border)" }} />
      </div>
      <div className="analytics-panel__empty-text">SELECT A HABIT TO INSPECT</div>
      <div className="analytics-panel__empty-sub">ANALYTICS WILL APPEAR HERE</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * AnalyticsPanel — right-hand inspector pane.
 *
 * Props:
 *   habit — selected habit object | null
 */
export default function AnalyticsPanel({ habit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!habit) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalytics(habit.id)
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [habit?.id]);

  if (!habit) return <EmptyState />;

  if (loading) return (
    <div className="analytics-panel__empty">
      <span className="analytics-panel__empty-text" style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
        LOADING…
      </span>
    </div>
  );

  if (error) return (
    <div style={{ padding: 18, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--negative)" }}>
      ERROR: {error}
    </div>
  );

  if (!data) return <EmptyState />;

  const status = getStatus(data.completion_rate_30d);
  const chartData = data.weekly_data.map(d => ({ week: d.week, completed: d.completed }));

  return (
    <div className="analytics-panel" style={{ fontFamily: "var(--font-mono)" }}>

      {/* ── Habit identity ─────────────────────────────────────── */}
      <div className="analytics__header">
        <div className="analytics__label">INSPECTING</div>
        <div className="analytics__habit-name">{habit.name}</div>
        {habit.description && (
          <div className="analytics__habit-desc">{habit.description}</div>
        )}
      </div>

      {/* ── Status banner ──────────────────────────────────────── */}
      <div className="analytics__status-banner">
        <div className="analytics__status-label">DISCIPLINE STATUS</div>
        <div className="analytics__status-row">
          <span className="analytics__status-value">{status}</span>
          <span className="analytics__status-index">INDEX: {data.completion_rate_30d}</span>
        </div>
      </div>

      {/* ── Stat grid ──────────────────────────────────────────── */}
      <div className="analytics__stat-grid">
        <div className="analytics__stat">
          <div className="analytics__stat-label">CURRENT</div>
          <div className={`analytics__stat-value ${data.current_streak > 0 ? "analytics__stat-value--highlight" : ""}`}>
            {data.current_streak}
          </div>
          <div className="analytics__stat-unit">DAYS</div>
        </div>
        <div className="analytics__stat">
          <div className="analytics__stat-label">LONGEST</div>
          <div className="analytics__stat-value">{data.longest_streak}</div>
          <div className="analytics__stat-unit">DAYS</div>
        </div>
        <div className="analytics__stat">
          <div className="analytics__stat-label">30-DAY</div>
          <div className="analytics__stat-value">{data.completion_rate_30d}%</div>
          <div className="analytics__stat-unit">RATE</div>
        </div>
      </div>

      {/* ── Streak continuity dots ─────────────────────────────── */}
      <div>
        <div className="section-label">STREAK CONTINUITY — LAST 30 DAYS</div>
        <div className="streak-dots">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`streak-dot ${i < data.current_streak ? "streak-dot--active" : "streak-dot--inactive"}`}
            />
          ))}
        </div>
      </div>

      {/* ── Weekly bar chart ───────────────────────────────────── */}
      <div style={{ marginBottom: 18 }}>
        <div className="section-label">WEEKLY COMPLETIONS / 7</div>
        <WeeklyChart chartData={chartData} />
      </div>

      {/* ── Activity heatmap ───────────────────────────────────── */}
      <div>
        <div className="section-label">ACTIVITY MAP — LAST 70 DAYS</div>
        <HeatmapGrid />
      </div>
    </div>
  );
}