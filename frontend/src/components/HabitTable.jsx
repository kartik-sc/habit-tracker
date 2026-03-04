import HabitRow from "./HabitRow.jsx";

/**
 * HabitTable — habit list panel with column headers, rows, and footer.
 *
 * Props:
 *   habits       — array of habit objects
 *   analyticsMap — { id: analyticsObj }
 *   selected     — currently selected habit | null
 *   loading      — boolean
 *   done         — number of completed habits today
 *   total        — total number of habits
 *   pct          — completion percentage string
 *   discIndex    — discipline index string
 *   maxStreak    — max current streak number
 *   onSelect     — (habit) => void
 *   onToggle     — (habit) => void
 *   onEdit       — (habit) => void
 *   onDelete     — (habitId) => void
 *   onAdd        — () => void
 *   isMobile     — boolean
 *   setMobileTab — (tab) => void
 */
export default function HabitTable({
  habits, analyticsMap, selected, loading,
  done, total, pct, discIndex, maxStreak,
  onSelect, onToggle, onEdit, onDelete, onAdd,
  isMobile, setMobileTab,
}) {
  const statusLabel =
    Number(discIndex) >= 70 ? "CONSISTENT"
      : Number(discIndex) >= 50 ? "BUILDING"
        : "NEEDS WORK";

  return (
    <div className="habit-panel">
      {/* Column headers */}
      <div className="habit-table__header">
        {["", "HABIT", "STREAK", "30D %", "STATUS", ""].map((h, i) => (
          <div key={i} className="habit-table__col-label" style={{ paddingLeft: i > 1 ? 4 : 0 }}>
            {h}
          </div>
        ))}
      </div>

      {/* Sub-header */}
      <div className="habit-table__subheader">
        <span className="habit-table__summary">
          {total} HABITS · {done} DONE · {pct}% COMPLETE
        </span>
        <button onClick={onAdd} className="btn btn--outline" style={{ padding: "3px 10px" }}>
          + NEW HABIT
        </button>
      </div>

      {/* Rows */}
      <div className="habit-table__rows">
        {loading ? (
          <div className="habit-table__loading">LOADING…</div>
        ) : habits.length === 0 ? (
          <div className="habit-table__empty">
            <div className="habit-table__empty-icon">
              <div style={{ width: 8, height: 8, background: "var(--border)" }} />
            </div>
            <div className="habit-table__empty-text">NO HABITS TRACKED</div>
            <div className="habit-table__empty-sub">PRESS + NEW HABIT TO BEGIN</div>
          </div>
        ) : habits.map(h => (
          <HabitRow
            key={h.id}
            habit={h}
            analytics={analyticsMap[h.id] ?? null}
            isSelected={selected?.id === h.id}
            onSelect={() => {
              onSelect(h);
              if (isMobile) setMobileTab("analytics");
            }}
            onToggle={() => onToggle(h)}
            onEdit={() => onEdit(h)}
            onDelete={() => onDelete(h.id)}
          />
        ))}
      </div>

      {/* Terminal-style footer */}
      {!isMobile && (
        <div className="habit-table__footer">
          <span className="accent">▶</span>
          &nbsp;&nbsp;
          STREAK: {maxStreak}D MAX
          &nbsp;·&nbsp;
          DISCIPLINE INDEX: {discIndex}
          &nbsp;·&nbsp;
          STATUS: {statusLabel}
        </div>
      )}
    </div>
  );
}
