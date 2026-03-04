import { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar.jsx";
import HabitTable from "../../components/HabitTable.jsx";
import AnalyticsPanel from "../../components/AnalyticsPanel.jsx";
import HabitModal from "../../components/HabitModal.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import HeatmapGrid from "../../components/HeatmapGrid.jsx";
import {
  getHabits, createHabit, updateHabit,
  deleteHabit, logHabit, getAnalytics,
} from "../habits.js";

// ── Helpers ───────────────────────────────────────────────────────────────
function computeDisciplineIndex(analyticsMap) {
  const values = Object.values(analyticsMap);
  if (!values.length) return "0.0";
  return (values.reduce((s, a) => s + a.completion_rate_30d, 0) / values.length).toFixed(1);
}

function computeMaxStreak(analyticsMap) {
  return Math.max(0, ...Object.values(analyticsMap).map(a => a.current_streak));
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  // ── Theme ──────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("dt_theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("dt_theme", dark ? "dark" : "light");
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, []);

  // ── Responsive ─────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // ── Data ───────────────────────────────────────────────────────────────
  const [habits, setHabits] = useState([]);
  const [analyticsMap, setAnalyticsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [mobileTab, setMobileTab] = useState("habits");

  // ── Load all habits + analytics in parallel ────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getHabits();
      setHabits(list);

      const entries = await Promise.all(
        list.map(async h => {
          const a = await getAnalytics(h.id).catch(() => null);
          return [h.id, a];
        })
      );
      setAnalyticsMap(Object.fromEntries(entries.filter(([, a]) => a)));
      setSelected(prev => prev ?? list[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Actions ────────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (habit) => {
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

  // ── Derived stats ──────────────────────────────────────────────────────
  const done = habits.filter(h => h.completed_today).length;
  const total = habits.length;
  const pct = total > 0 ? ((done / total) * 100).toFixed(1) : "0.0";
  const discIndex = computeDisciplineIndex(analyticsMap);
  const maxStreak = computeMaxStreak(analyticsMap);
  const todayStr = new Date()
    .toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "2-digit", day: "2-digit" })
    .toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      {/* Top nav */}
      <Navbar
        discIndex={discIndex}
        maxStreak={maxStreak}
        done={done}
        total={total}
        todayStr={todayStr}
        dark={dark}
        onToggleTheme={() => setDark(d => !d)}
        isMobile={isMobile}
      />

      {/* Mobile tabs */}
      {isMobile && (
        <div className="mobile-tabs" style={{ display: "flex" }}>
          {["HABITS", "ANALYTICS", "ACTIVITY"].map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab.toLowerCase())}
              className={`mobile-tabs__btn ${mobileTab === tab.toLowerCase() ? "mobile-tabs__btn--active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="main-grid">
        {/* Left: habit table */}
        {(!isMobile || mobileTab === "habits") && (
          <HabitTable
            habits={habits}
            analyticsMap={analyticsMap}
            selected={selected}
            loading={loading}
            done={done}
            total={total}
            pct={pct}
            discIndex={discIndex}
            maxStreak={maxStreak}
            onSelect={setSelected}
            onToggle={handleToggle}
            onEdit={setEditHabit}
            onDelete={setConfirmId}
            onAdd={() => setShowAdd(true)}
            isMobile={isMobile}
            setMobileTab={setMobileTab}
          />
        )}

        {/* Right: analytics panel */}
        {(!isMobile || mobileTab === "analytics") && (
          <div className="analytics-panel">
            <AnalyticsPanel habit={selected} />
          </div>
        )}

        {/* Mobile: activity tab */}
        {isMobile && mobileTab === "activity" && (
          <div style={{ padding: 18 }}>
            <div className="section-label">ACTIVITY MAP — LAST 70 DAYS</div>
            <HeatmapGrid />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <HabitModal
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editHabit && (
        <HabitModal
          initial={editHabit}
          onSubmit={handleUpdate}
          onCancel={() => setEditHabit(null)}
        />
      )}
      {confirmId && (
        <ConfirmModal
          message="DELETE THIS HABIT? ALL LOG DATA WILL BE PERMANENTLY REMOVED."
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}