import { useState, useEffect, useCallback } from "react";
import HabitCard        from "../components/HabitCard.jsx";
import AddHabitModal    from "../components/AddHabitModal.jsx";
import AnalyticsPanel   from "../components/AnalyticsPanel.jsx";
import {
  getHabits, createHabit, updateHabit,
  deleteHabit, logHabit, getAnalytics,
} from "../api/habits.js";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0E0F11", surface: "#16181C", border: "#2A2E35",
  text: "#E6E8EB", muted: "#8B9098", accent: "#0F766E",
  accentDim: "#0F766E1A", negative: "#C0392B", rowHover: "#1C1E22",
};
const LIGHT = {
  bg: "#F7F7F5", surface: "#FFFFFF", border: "#D8D8D8",
  text: "#111111", muted: "#555555", accent: "#0F766E",
  accentDim: "#0F766E12", negative: "#C0392B", rowHover: "#F0F0EE",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeDisciplineIndex(analyticsMap) {
  const values = Object.values(analyticsMap);
  if (!values.length) return "0.0";
  const avg = values.reduce((s, a) => s + a.completion_rate_30d, 0) / values.length;
  return avg.toFixed(1);
}

function computeMaxStreak(analyticsMap) {
  return Math.max(0, ...Object.values(analyticsMap).map(a => a.current_streak));
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel, t }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",
        justifyContent:"center",background:"rgba(0,0,0,0.82)" }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, width:340, maxWidth:"calc(100vw - 32px)" }}>
        <div style={{ padding:"11px 16px",borderBottom:`1px solid ${t.border}` }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,color:t.text,letterSpacing:"0.1em" }}>
            CONFIRM ACTION
          </span>
        </div>
        <div style={{ padding:"14px 16px" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:t.muted,marginBottom:16 }}>
            {message}
          </div>
          <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
            <button onClick={onCancel} style={{ padding:"7px 14px",background:"transparent",border:`1px solid ${t.border}`,color:t.muted,cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,borderRadius:0 }}>
              CANCEL
            </button>
            <button onClick={onConfirm} style={{ padding:"7px 16px",background:t.negative,border:`1px solid ${t.negative}`,color:"#fff",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,borderRadius:0 }}>
              CONFIRM DELETE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table column template (shared across header + rows) ──────────────────────
const COL_TEMPLATE = "26px 1fr 54px 56px 80px 52px";

// ─── Dashboard page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("dt_theme");
    return saved ? saved === "dark" : true;
  });
  const t = dark ? DARK : LIGHT;

  useEffect(() => { localStorage.setItem("dt_theme", dark ? "dark" : "light"); }, [dark]);

  // ── Responsive ────────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [habits,       setHabits]       = useState([]);
  const [analyticsMap, setAnalyticsMap] = useState({});  // id → AnalyticsResponse
  const [loading,      setLoading]      = useState(true);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selected,    setSelected]    = useState(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editHabit,   setEditHabit]   = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const [mobileTab,   setMobileTab]   = useState("habits");

  // ── Load all habits + their analytics in parallel ─────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getHabits();
      setHabits(list);

      // Parallel analytics fetch — avoids N sequential awaits
      const entries = await Promise.all(
        list.map(async h => {
          const a = await getAnalytics(h.id).catch(() => null);
          return [h.id, a];
        })
      );
      setAnalyticsMap(Object.fromEntries(entries.filter(([, a]) => a)));

      // Auto-select first habit on initial load
      setSelected(prev => prev ?? list[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (habit) => {
    // Optimistic update
    setHabits(prev =>
      prev.map(h => h.id === habit.id ? { ...h, completed_today: !h.completed_today } : h)
    );
    setSelected(prev =>
      prev?.id === habit.id ? { ...prev, completed_today: !prev.completed_today } : prev
    );
    await logHabit(habit.id);
  }, []);

  const handleCreate = useCallback(async (data) => {
    await createHabit(data);
    setShowAdd(false);
    await loadAll();
  }, [loadAll]);

  const handleUpdate = useCallback(async (data) => {
    await updateHabit(editHabit.id, data);
    setEditHabit(null);
    await loadAll();
  }, [editHabit, loadAll]);

  const handleDelete = useCallback(async () => {
    await deleteHabit(confirmId);
    setHabits(prev => prev.filter(h => h.id !== confirmId));
    if (selected?.id === confirmId) setSelected(null);
    setConfirmId(null);
  }, [confirmId, selected]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const done       = habits.filter(h => h.completed_today).length;
  const total      = habits.length;
  const pct        = total > 0 ? ((done / total) * 100).toFixed(1) : "0.0";
  const discIndex  = computeDisciplineIndex(analyticsMap);
  const maxStreak  = computeMaxStreak(analyticsMap);
  const todayStr   = new Date()
    .toLocaleDateString("en-US", { weekday:"short", year:"numeric", month:"2-digit", day:"2-digit" })
    .toUpperCase();

  // ── Global font injection ─────────────────────────────────────────────────
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Serif:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${t.bg}; color: ${t.text}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${t.bg}; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; }
    input::placeholder { color: ${t.muted}; opacity: 0.45; }
    ::selection { background: ${t.accent}33; }
  `;

  // ─────────────────────────────────────────────────────────────────────────
  // ── Render ───────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <style>{globalStyles}</style>

      {/* ════════════════════════════════════════════════════════
          TOP NAV
      ════════════════════════════════════════════════════════ */}
      <nav
        style={{
          height: 44,
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
          display: "flex",
          alignItems: "stretch",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          borderRight: `1px solid ${t.border}`,
          paddingRight: 16, marginRight: 16, flexShrink: 0,
        }}>
          <div style={{ width: 7, height: 7, background: t.accent }} />
          <span style={{
            fontFamily: "'IBM Plex Serif', serif",
            fontSize: 14, fontWeight: 700, color: t.text,
            letterSpacing: "-0.01em", whiteSpace: "nowrap",
          }}>
            Discipline Terminal
          </span>
        </div>

        {/* Nav links (desktop only) */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {["DASHBOARD", "HABITS", "STATS"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "0 14px", display: "flex", alignItems: "center",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10, letterSpacing: "0.1em",
                  color: i === 0 ? t.accent : t.muted,
                  borderBottom: i === 0 ? `2px solid ${t.accent}` : "2px solid transparent",
                  borderRight: `1px solid ${t.border}`,
                  cursor: "default",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Right: live metrics + theme toggle */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "stretch" }}>
          {!isMobile && [
            { l: "INDEX",  v: discIndex },
            { l: "STREAK", v: `${maxStreak}D` },
            { l: "TODAY",  v: `${done}/${total}` },
            { l: todayStr, v: null },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderLeft: `1px solid ${t.border}`,
                padding: "0 12px",
              }}
            >
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, color: t.muted, letterSpacing: "0.1em",
              }}>
                {s.l}
              </span>
              {s.v && (
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, fontWeight: 700,
                  color: t.accent, fontVariantNumeric: "tabular-nums",
                }}>
                  {s.v}
                </span>
              )}
            </div>
          ))}

          <div style={{ borderLeft: `1px solid ${t.border}`, padding: "0 12px",
            display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Toggle theme"
              style={{
                background: "none", border: `1px solid ${t.border}`,
                color: t.muted, cursor: "pointer",
                padding: "4px 10px",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, letterSpacing: "0.08em",
                borderRadius: "50px",
              }}
            >
              {dark ? "☀ LIGHT" : "◑ DARK"}
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          MOBILE TABS
      ════════════════════════════════════════════════════════ */}
      {isMobile && (
        <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, background: t.surface }}>
          {["HABITS", "ANALYTICS"].map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab.toLowerCase())}
              style={{
                flex: 1, padding: "10px",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: mobileTab === tab.toLowerCase() ? t.accent : t.muted,
                borderBottom: mobileTab === tab.toLowerCase()
                  ? `2px solid ${t.accent}` : "2px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════════ */}
      <div style={
        isMobile
          ? {}
          : { display: "grid", gridTemplateColumns: "1fr 330px",
              height: "calc(100vh - 44px)", overflow: "hidden" }
      }>

        {/* ── LEFT / MOBILE HABITS TAB ────────────────────────── */}
        {(!isMobile || mobileTab === "habits") && (
          <div style={{
            borderRight: isMobile ? "none" : `1px solid ${t.border}`,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            ...(isMobile ? {} : { height: "100%" }),
          }}>

            {/* Table column headers */}
            <div style={{
              borderBottom: `1px solid ${t.border}`,
              display: "grid", gridTemplateColumns: COL_TEMPLATE,
              alignItems: "center", height: 32, padding: "0 14px",
              background: t.surface, flexShrink: 0,
            }}>
              {["", "HABIT", "STREAK", "30D %", "STATUS", ""].map((h, i) => (
                <div key={i} style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, color: t.muted, letterSpacing: "0.12em",
                  fontWeight: 700, paddingLeft: i > 1 ? 4 : 0,
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Sub-header: count + add button */}
            <div style={{
              borderBottom: `1px solid ${t.border}`,
              padding: "0 14px", height: 36,
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              background: t.surface, flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, color: t.muted, letterSpacing: "0.08em",
              }}>
                {total} HABITS · {done} DONE · {pct}% COMPLETE
              </span>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: "none", border: `1px solid ${t.accent}`,
                  color: t.accent, cursor: "pointer",
                  padding: "3px 10px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                  borderRadius: 0,
                }}
              >
                + NEW HABIT
              </button>
            </div>

            {/* Habit rows */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                  height: 160, fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11, color: t.muted }}>
                  LOADING…
                </div>
              ) : habits.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", height: 180, gap: 8 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11, color: t.muted }}>NO HABITS TRACKED</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9, color: t.muted, opacity: 0.45 }}>
                    PRESS + NEW HABIT TO BEGIN
                  </div>
                </div>
              ) : habits.map(h => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  analytics={analyticsMap[h.id] ?? null}
                  isSelected={selected?.id === h.id}
                  t={t}
                  onSelect={() => {
                    setSelected(h);
                    if (isMobile) setMobileTab("analytics");
                  }}
                  onToggle={() => handleToggle(h)}
                  onEdit={() => setEditHabit(h)}
                  onDelete={() => setConfirmId(h.id)}
                />
              ))}
            </div>

            {/* Terminal status footer */}
            <div style={{
              borderTop: `1px solid ${t.border}`,
              padding: "7px 14px",
              background: t.surface, flexShrink: 0,
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9, color: t.muted, letterSpacing: "0.06em",
              }}>
                <span style={{ color: t.accent }}>▶</span>
                &nbsp;&nbsp;
                STREAK: {maxStreak}D MAX
                &nbsp;·&nbsp;
                DISCIPLINE INDEX: {discIndex}
                &nbsp;·&nbsp;
                STATUS: {
                  Number(discIndex) >= 70 ? "CONSISTENT"
                  : Number(discIndex) >= 50 ? "BUILDING"
                  : "NEEDS WORK"
                }
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT / MOBILE ANALYTICS TAB ──────────────────── */}
        {(!isMobile || mobileTab === "analytics") && (
          <div style={{
            overflowY: "auto",
            padding: 16,
            ...(isMobile ? {} : { height: "100%" }),
          }}>
            <AnalyticsPanel habit={selected} t={t} />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════════ */}
      {showAdd && (
        <AddHabitModal
          t={t}
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editHabit && (
        <AddHabitModal
          initial={editHabit}
          t={t}
          onSubmit={handleUpdate}
          onCancel={() => setEditHabit(null)}
        />
      )}
      {confirmId && (
        <ConfirmModal
          message="DELETE THIS HABIT? ALL LOG DATA WILL BE PERMANENTLY REMOVED."
          t={t}
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}