import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(rate) {
  if (rate >= 85) return "ELITE";
  if (rate >= 70) return "CONSISTENT";
  if (rate >= 50) return "BUILDING";
  if (rate >= 30) return "UNSTABLE";
  return "FAILING";
}

function statusColor(rate, t) {
  if (rate >= 70) return t.accent;
  if (rate >= 40) return t.text;
  return t.muted;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HabitCard — one row in the habit table.
 *
 * Props:
 *   habit       — habit object { id, name, description, completed_today }
 *   analytics   — analytics object { current_streak, completion_rate_30d } | null
 *   isSelected  — bool, highlights row in emerald tint
 *   t           — theme tokens object
 *   onSelect    — () => void
 *   onToggle    — () => void  (mark complete / undo)
 *   onEdit      — () => void
 *   onDelete    — () => void
 */
export default function HabitCard({
  habit,
  analytics,
  isSelected,
  t,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
}) {
  const [hovered, setHovered] = useState(false);

  const status    = analytics ? getStatus(analytics.completion_rate_30d) : null;
  const rateColor = analytics ? statusColor(analytics.completion_rate_30d, t) : t.muted;
  const isElite   = status === "ELITE" || status === "CONSISTENT";

  const rowBg = isSelected
    ? t.accentDim
    : hovered
    ? t.rowHover
    : "transparent";

  return (
    <div
      role="row"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "26px 1fr 54px 56px 80px 52px",
        alignItems: "center",
        minHeight: 44,
        padding: "0 14px",
        borderBottom: `1px solid ${t.border}`,
        borderLeft: isSelected ? `2px solid ${t.accent}` : "2px solid transparent",
        background: rowBg,
        cursor: "pointer",
        transition: "background 0.08s",
        userSelect: "none",
      }}
    >
      {/* ── Checkbox ──────────────────────────────────────────── */}
      <button
        aria-label={habit.completed_today ? "Mark incomplete" : "Mark complete"}
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{
          width: 18,
          height: 18,
          flexShrink: 0,
          background: habit.completed_today ? t.accent : "transparent",
          border: `1px solid ${habit.completed_today ? t.accent : t.border}`,
          borderRadius: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          transition: "background 0.12s, border-color 0.12s",
        }}
      >
        {habit.completed_today && (
          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>
            ✓
          </span>
        )}
      </button>

      {/* ── Name + description ────────────────────────────────── */}
      <div style={{ minWidth: 0, paddingRight: 8 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Serif', serif",
            fontSize: 13,
            fontWeight: 700,
            color: t.text,
            textDecoration: habit.completed_today ? "line-through" : "none",
            textDecorationColor: t.muted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {habit.name}
        </div>
        {habit.description && (
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: t.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 1,
            }}
          >
            {habit.description}
          </div>
        )}
      </div>

      {/* ── Current streak ────────────────────────────────────── */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          color: analytics?.current_streak > 0 ? t.accent : t.muted,
          fontVariantNumeric: "tabular-nums",
          paddingLeft: 4,
        }}
      >
        {analytics ? `${analytics.current_streak}d` : "—"}
      </div>

      {/* ── 30-day completion % ───────────────────────────────── */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: rateColor,
          fontVariantNumeric: "tabular-nums",
          paddingLeft: 4,
        }}
      >
        {analytics ? `${analytics.completion_rate_30d}%` : "—"}
      </div>

      {/* ── Status label ─────────────────────────────────────── */}
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.04em",
          color: isElite ? t.accent : t.muted,
          paddingLeft: 4,
        }}
      >
        {status ?? "—"}
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <ActionButtons t={t} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

// ─── Action buttons (isolated to avoid re-rendering the whole row on hover) ──
function ActionButtons({ t, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
      <IconBtn
        label="Edit habit"
        icon="✏"
        hoverColor={t.text}
        t={t}
        onClick={onEdit}
      />
      <IconBtn
        label="Delete habit"
        icon="✕"
        hoverColor={t.negative}
        t={t}
        onClick={onDelete}
      />
    </div>
  );
}

function IconBtn({ label, icon, hoverColor, t, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      aria-label={label}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none",
        border: "none",
        color: hov ? hoverColor : t.muted,
        cursor: "pointer",
        padding: "4px 5px",
        fontSize: 11,
        fontFamily: "'IBM Plex Mono', monospace",
        lineHeight: 1,
        transition: "color 0.1s",
      }}
    >
      {icon}
    </button>
  );
}