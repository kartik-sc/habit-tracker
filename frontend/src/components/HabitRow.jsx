import { useState } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────
function getStatus(rate) {
  if (rate >= 85) return "ELITE";
  if (rate >= 70) return "CONSISTENT";
  if (rate >= 50) return "BUILDING";
  if (rate >= 30) return "UNSTABLE";
  return "FAILING";
}

function streakColor(streak) {
  return streak > 0 ? "var(--accent)" : "var(--muted)";
}

function rateColor(rate) {
  if (rate >= 70) return "var(--accent)";
  if (rate >= 40) return "var(--text)";
  return "var(--muted)";
}

function statusColor(rate) {
  const s = getStatus(rate);
  return (s === "ELITE" || s === "CONSISTENT") ? "var(--accent)" : "var(--muted)";
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * HabitRow — one row in the habit table.
 *
 * Props:
 *   habit       — habit object { id, name, description, completed_today }
 *   analytics   — analytics object { current_streak, completion_rate_30d } | null
 *   isSelected  — highlights row in accent tint
 *   onSelect    — () => void
 *   onToggle    — () => void
 *   onEdit      — () => void
 *   onDelete    — () => void
 */
export default function HabitRow({
  habit, analytics, isSelected,
  onSelect, onToggle, onEdit, onDelete,
}) {
  const status = analytics ? getStatus(analytics.completion_rate_30d) : null;

  const rowClasses = [
    "habit-row",
    isSelected && "habit-row--selected",
  ].filter(Boolean).join(" ");

  return (
    <div
      role="row"
      aria-selected={isSelected}
      onClick={onSelect}
      className={rowClasses}
    >
      {/* Checkbox */}
      <button
        aria-label={habit.completed_today ? "Mark incomplete" : "Mark complete"}
        onClick={e => { e.stopPropagation(); onToggle(); }}
        className={`habit-row__check ${habit.completed_today ? "habit-row__check--done" : ""}`}
      >
        {habit.completed_today && <span className="habit-row__check-mark">✓</span>}
      </button>

      {/* Name + description */}
      <div style={{ minWidth: 0, paddingRight: 8 }}>
        <div className={`habit-row__name ${habit.completed_today ? "habit-row__name--done" : ""}`}>
          {habit.name}
        </div>
        {habit.description && (
          <div className="habit-row__desc">{habit.description}</div>
        )}
      </div>

      {/* Current streak */}
      <div
        className="habit-row__streak"
        style={{ color: streakColor(analytics?.current_streak ?? 0) }}
      >
        {analytics ? `${analytics.current_streak}d` : "—"}
      </div>

      {/* 30-day completion % */}
      <div
        className="habit-row__rate"
        style={{ color: analytics ? rateColor(analytics.completion_rate_30d) : "var(--muted)" }}
      >
        {analytics ? `${analytics.completion_rate_30d}%` : "—"}
      </div>

      {/* Status label */}
      <div
        className="habit-row__status"
        style={{ color: analytics ? statusColor(analytics.completion_rate_30d) : "var(--muted)" }}
      >
        {status ?? "—"}
      </div>

      {/* Actions */}
      <div className="habit-row__actions">
        <IconBtn label="Edit habit" icon="✏" className="" onClick={onEdit} />
        <IconBtn label="Delete habit" icon="✕" className="icon-btn--danger" onClick={onDelete} />
      </div>
    </div>
  );
}

// ── Icon button ───────────────────────────────────────────────────────────
function IconBtn({ label, icon, className = "", onClick }) {
  return (
    <button
      aria-label={label}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`icon-btn ${className}`}
    >
      {icon}
    </button>
  );
}
