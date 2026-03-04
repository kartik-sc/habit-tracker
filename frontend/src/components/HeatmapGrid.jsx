import { useState } from "react";

/**
 * HeatmapGrid — GitHub-style activity heatmap for the last 70 days.
 */

function generateHeatmap() {
  const days = [];
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Deterministic pseudo-random fill per day (stable across re-renders)
    days.push({
      date: d,
      filled: ((d.getDate() * 7 + d.getMonth() * 3) % 10) > 3,
    });
  }
  return days;
}

export default function HeatmapGrid() {
  const [days] = useState(generateHeatmap);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div className="heatmap">
      <div className="heatmap__grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap__col">
            {week.map((day, di) => (
              <div
                key={di}
                className={`heatmap__cell ${day.filled ? "heatmap__cell--filled" : "heatmap__cell--empty"}`}
                data-tooltip={`${day.date.toDateString()} · ${day.filled ? "COMPLETED" : "MISSED"}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap__legend">
        <span className="heatmap__legend-item">
          <div className="heatmap__legend-dot" style={{ background: "var(--border)", opacity: 0.38 }} />
          <span className="heatmap__legend-label">MISSED</span>
        </span>
        <span className="heatmap__legend-item">
          <div className="heatmap__legend-dot" style={{ background: "var(--accent)" }} />
          <span className="heatmap__legend-label">COMPLETED</span>
        </span>
      </div>
    </div>
  );
}
