import Dashboard from "./pages/Dashboard.jsx";
export default function App() { return <Dashboard />; }

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const MOCK_HABITS_DATA = [
  {
    id: 1,
    name: "Morning Run",
    description: "30 min",
    completed_today: true,
    is_active: true,
  },
  {
    id: 2,
    name: "Read 20 Pages",
    description: "Non-fiction",
    completed_today: false,
    is_active: true,
  },
  {
    id: 3,
    name: "Meditate",
    description: "10 min",
    completed_today: true,
    is_active: true,
  },
  {
    id: 4,
    name: "No Sugar",
    description: "Refined sugar",
    completed_today: false,
    is_active: true,
  },
  {
    id: 5,
    name: "Cold Shower",
    description: "2 min min",
    completed_today: true,
    is_active: true,
  },
];

const MOCK_ANALYTICS = {
  1: {
    current_streak: 7,
    longest_streak: 21,
    completion_rate_30d: 73.3,
    weekly_data: [
      { w: "01/06", c: 4 },
      { w: "01/13", c: 5 },
      { w: "01/20", c: 6 },
      { w: "01/27", c: 7 },
      { w: "02/03", c: 5 },
      { w: "02/10", c: 7 },
      { w: "02/17", c: 7 },
    ],
  },
  2: {
    current_streak: 3,
    longest_streak: 14,
    completion_rate_30d: 56.7,
    weekly_data: [
      { w: "01/06", c: 3 },
      { w: "01/13", c: 4 },
      { w: "01/20", c: 4 },
      { w: "01/27", c: 5 },
      { w: "02/03", c: 3 },
      { w: "02/10", c: 4 },
      { w: "02/17", c: 3 },
    ],
  },
  3: {
    current_streak: 12,
    longest_streak: 30,
    completion_rate_30d: 86.7,
    weekly_data: [
      { w: "01/06", c: 6 },
      { w: "01/13", c: 7 },
      { w: "01/20", c: 6 },
      { w: "01/27", c: 7 },
      { w: "02/03", c: 6 },
      { w: "02/10", c: 7 },
      { w: "02/17", c: 7 },
    ],
  },
  4: {
    current_streak: 0,
    longest_streak: 8,
    completion_rate_30d: 43.3,
    weekly_data: [
      { w: "01/06", c: 2 },
      { w: "01/13", c: 3 },
      { w: "01/20", c: 4 },
      { w: "01/27", c: 3 },
      { w: "02/03", c: 2 },
      { w: "02/10", c: 3 },
      { w: "02/17", c: 1 },
    ],
  },
  5: {
    current_streak: 5,
    longest_streak: 12,
    completion_rate_30d: 66.7,
    weekly_data: [
      { w: "01/06", c: 5 },
      { w: "01/13", c: 4 },
      { w: "01/20", c: 5 },
      { w: "01/27", c: 6 },
      { w: "02/03", c: 4 },
      { w: "02/10", c: 5 },
      { w: "02/17", c: 5 },
    ],
  },
};

const mockState = { habits: MOCK_HABITS_DATA.map((h) => ({ ...h })) };
const api = {
  async getHabits() {
    return mockState.habits.filter((h) => h.is_active);
  },
  async createHabit(d) {
    const id = Date.now();
    const h = { id, ...d, completed_today: false, is_active: true };
    mockState.habits.push(h);
    MOCK_ANALYTICS[id] = {
      current_streak: 0,
      longest_streak: 0,
      completion_rate_30d: 0,
      weekly_data: [],
    };
    return h;
  },
  async updateHabit(id, d) {
    const h = mockState.habits.find((h) => h.id === id);
    if (h) Object.assign(h, d);
    return h;
  },
  async deleteHabit(id) {
    const h = mockState.habits.find((h) => h.id === id);
    if (h) h.is_active = false;
  },
  async logHabit(id) {
    const h = mockState.habits.find((h) => h.id === id);
    if (h) h.completed_today = !h.completed_today;
    return { created: true };
  },
};

const DARK = {
  bg: "#0E0F11",
  surface: "#16181C",
  border: "#2A2E35",
  text: "#E6E8EB",
  muted: "#8B9098",
  accent: "#0F766E",
  accentDim: "#0F766E1A",
  negative: "#C0392B",
  rowHover: "#1C1E22",
};
const LIGHT = {
  bg: "#F7F7F5",
  surface: "#FFFFFF",
  border: "#D8D8D8",
  text: "#111111",
  muted: "#555555",
  accent: "#0F766E",
  accentDim: "#0F766E12",
  negative: "#C0392B",
  rowHover: "#F0F0EE",
};

function getStatus(r) {
  if (r >= 85) return "ELITE";
  if (r >= 70) return "CONSISTENT";
  if (r >= 50) return "BUILDING";
  if (r >= 30) return "UNSTABLE";
  return "FAILING";
}

function generateHeatmap() {
  const days = [];
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d, filled: Math.random() > 0.38 });
  }
  return days;
}

function CustomTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        padding: "6px 10px",
        fontFamily: "'IBM Plex Mono',monospace",
      }}
    >
      <div style={{ fontSize: 10, color: t.muted }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>
        {payload[0].value}/7
      </div>
    </div>
  );
}

function Heatmap({ t }) {
  const [days] = useState(generateHeatmap);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div>
      <div style={{ display: "flex", gap: 3 }}>
        {weeks.map((wk, wi) => (
          <div
            key={wi}
            style={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {wk.map((d, di) => (
              <div
                key={di}
                title={d.date.toDateString()}
                style={{
                  width: 11,
                  height: 11,
                  background: d.filled ? t.accent : t.border,
                  opacity: d.filled ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{ display: "flex", gap: 12, marginTop: 7, alignItems: "center" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 10,
              height: 10,
              background: t.border,
              opacity: 0.5,
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9,
              color: t.muted,
            }}
          >
            MISSED
          </span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, background: t.accent }} />
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9,
              color: t.muted,
            }}
          >
            COMPLETED
          </span>
        </span>
      </div>
    </div>
  );
}

function AnalyticsPanel({ habit, t }) {
  const data = habit ? MOCK_ANALYTICS[habit.id] : null;
  if (!habit || !data)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: t.muted,
            letterSpacing: "0.08em",
          }}
        >
          SELECT A HABIT TO INSPECT
        </div>
        <div style={{ width: 32, height: 1, background: t.border }} />
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10,
            color: t.muted,
            opacity: 0.5,
          }}
        >
          ANALYTICS WILL APPEAR HERE
        </div>
      </div>
    );

  const status = getStatus(data.completion_rate_30d);
  const chartData = data.weekly_data.map((d) => ({
    week: d.w,
    completed: d.c,
  }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono',monospace" }}>
      {/* Habit ID header */}
      <div
        style={{
          borderBottom: `1px solid ${t.border}`,
          paddingBottom: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: t.muted,
            letterSpacing: "0.14em",
            marginBottom: 5,
          }}
        >
          INSPECTING HABIT
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Serif',serif",
            fontSize: 16,
            fontWeight: 700,
            color: t.text,
          }}
        >
          {habit.name}
        </div>
        {habit.description && (
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
            {habit.description}
          </div>
        )}
      </div>

      {/* Terminal status block */}
      <div
        style={{
          background: t.accentDim,
          border: `1px solid ${t.accent}33`,
          padding: "10px 12px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: t.muted,
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          DISCIPLINE STATUS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: "0.04em",
            }}
          >
            {status}
          </span>
          <span style={{ fontSize: 10, color: t.muted }}>
            INDEX: {data.completion_rate_30d}
          </span>
        </div>
      </div>

      {/* Stats 3-col */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          border: `1px solid ${t.border}`,
          marginBottom: 14,
        }}
      >
        {[
          ["CURRENT", `${data.current_streak}`, "DAYS"],
          ["LONGEST", `${data.longest_streak}`, "DAYS"],
          ["30-DAY", `${data.completion_rate_30d}`, "%"],
        ].map(([l, v, u], i) => (
          <div
            key={i}
            style={{
              padding: "10px 10px",
              borderRight: i < 2 ? `1px solid ${t.border}` : "none",
              background: t.surface,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: t.muted,
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {l}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: i === 0 && data.current_streak > 0 ? t.accent : t.text,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {v}
            </div>
            <div style={{ fontSize: 9, color: t.muted, marginTop: 3 }}>{u}</div>
          </div>
        ))}
      </div>

      {/* Streak dots */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 9,
            color: t.muted,
            letterSpacing: "0.1em",
            marginBottom: 7,
          }}
        >
          STREAK CONTINUITY — LAST 30 DAYS
        </div>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                background: i < data.current_streak ? t.accent : t.border,
                opacity: i < data.current_streak ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      </div>

      {/* Weekly bar chart */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 9,
            color: t.muted,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          WEEKLY COMPLETIONS / 7
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart
            data={chartData}
            margin={{ top: 2, right: 0, left: -28, bottom: 0 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              strokeDasharray="2 2"
              stroke={t.border}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{
                fill: t.muted,
                fontSize: 9,
                fontFamily: "'IBM Plex Mono',monospace",
              }}
              axisLine={{ stroke: t.border }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 7]}
              tick={{ fill: t.muted, fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip t={t} />}
              cursor={{ fill: t.accentDim }}
            />
            <Bar dataKey="completed" radius={0} maxBarSize={18}>
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.completed >= 5 ? t.accent : t.border} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity heatmap */}
      <div>
        <div
          style={{
            fontSize: 9,
            color: t.muted,
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          ACTIVITY MAP — LAST 70 DAYS
        </div>
        <Heatmap t={t} />
      </div>
    </div>
  );
}

function Modal({ title, onClose, t, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          width: 380,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <div
          style={{
            padding: "11px 16px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              color: t.text,
              letterSpacing: "0.1em",
              fontWeight: 700,
            }}
          >
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: t.muted,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function HabitModal({ initial = {}, onSubmit, onCancel, t }) {
  const [name, setName] = useState(initial.name || "");
  const [desc, setDesc] = useState(initial.description || "");
  const iS = {
    width: "100%",
    padding: "8px 10px",
    background: t.bg,
    border: `1px solid ${t.border}`,
    color: t.text,
    fontSize: 13,
    fontFamily: "'IBM Plex Mono',monospace",
    outline: "none",
    boxSizing: "border-box",
    borderRadius: 0,
  };
  const lS = {
    display: "block",
    fontSize: 9,
    color: t.muted,
    letterSpacing: "0.12em",
    fontFamily: "'IBM Plex Mono',monospace",
    marginBottom: 5,
    marginTop: 12,
  };
  return (
    <Modal
      title={initial.name ? "EDIT HABIT" : "NEW HABIT"}
      onClose={onCancel}
      t={t}
    >
      <div style={{ padding: "0 16px 16px" }}>
        <label style={lS}>HABIT NAME *</label>
        <input
          style={iS}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Run"
          autoFocus
          maxLength={255}
        />
        <label style={lS}>DESCRIPTION</label>
        <input
          style={iS}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Optional"
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 18,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "7px 14px",
              background: "transparent",
              border: `1px solid ${t.border}`,
              color: t.muted,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              borderRadius: 0,
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() =>
              name.trim() &&
              onSubmit({ name: name.trim(), description: desc.trim() || null })
            }
            style={{
              padding: "7px 16px",
              background: t.accent,
              border: `1px solid ${t.accent}`,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmModal({ onConfirm, onCancel, t }) {
  return (
    <Modal title="CONFIRM DELETE" onClose={onCancel} t={t}>
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 12,
            color: t.muted,
            marginBottom: 16,
          }}
        >
          THIS ACTION CANNOT BE UNDONE.
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "7px 14px",
              background: "transparent",
              border: `1px solid ${t.border}`,
              color: t.muted,
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              borderRadius: 0,
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "7px 16px",
              background: t.negative,
              border: `1px solid ${t.negative}`,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 0,
            }}
          >
            DELETE
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function App() {
  const [dark, setDark] = useState(true);
  const t = dark ? DARK : LIGHT;
  const [habits, setHabits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileTab, setMobileTab] = useState("habits");

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  const load = useCallback(async () => {
    const d = await api.getHabits();
    setHabits(d);
    if (d.length > 0 && !selected) setSelected(d[0]);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (h) => {
    setHabits((p) =>
      p.map((x) =>
        x.id === h.id ? { ...x, completed_today: !x.completed_today } : x,
      ),
    );
    if (selected?.id === h.id)
      setSelected((s) => ({ ...s, completed_today: !s.completed_today }));
    await api.logHabit(h.id);
  };
  const handleCreate = async (d) => {
    await api.createHabit(d);
    setShowAdd(false);
    await load();
  };
  const handleUpdate = async (d) => {
    await api.updateHabit(editHabit.id, d);
    setEditHabit(null);
    await load();
  };
  const handleDelete = async () => {
    await api.deleteHabit(confirmDel);
    setHabits((p) => p.filter((h) => h.id !== confirmDel));
    if (selected?.id === confirmDel) setSelected(null);
    setConfirmDel(null);
  };

  const done = habits.filter((h) => h.completed_today).length,
    total = habits.length;
  const pct = total > 0 ? ((done / total) * 100).toFixed(1) : "0.0";
  const allAnalytics = habits.map((h) => MOCK_ANALYTICS[h.id]).filter(Boolean);
  const discIndex =
    allAnalytics.length > 0
      ? (
          allAnalytics.reduce((s, a) => s + a.completion_rate_30d, 0) /
          allAnalytics.length
        ).toFixed(1)
      : "0.0";
  const maxStreak =
    habits.length > 0
      ? Math.max(
          ...habits.map((h) => MOCK_ANALYTICS[h.id]?.current_streak || 0),
        )
      : 0;
  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .toUpperCase();

  const TABLE_COLS = "26px 1fr 54px 56px 72px 52px";

  const HabitRow = ({ h }) => {
    const [hov, setHov] = useState(false);
    const a = MOCK_ANALYTICS[h.id];
    const isSel = selected?.id === h.id;
    return (
      <div
        onClick={() => {
          setSelected(h);
          if (isMobile) setMobileTab("analytics");
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "grid",
          gridTemplateColumns: TABLE_COLS,
          alignItems: "center",
          borderBottom: `1px solid ${t.border}`,
          minHeight: 44,
          padding: "0 14px",
          background: isSel ? t.accentDim : hov ? t.rowHover : "transparent",
          borderLeft: isSel ? `2px solid ${t.accent}` : "2px solid transparent",
          cursor: "pointer",
          transition: "background 0.08s",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(h);
          }}
          style={{
            width: 18,
            height: 18,
            background: h.completed_today ? t.accent : "transparent",
            border: `1px solid ${h.completed_today ? t.accent : t.border}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 0,
            padding: 0,
            flexShrink: 0,
          }}
        >
          {h.completed_today && (
            <span
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ✓
            </span>
          )}
        </button>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Serif',serif",
              fontSize: 13,
              fontWeight: 700,
              color: t.text,
              textDecoration: h.completed_today ? "line-through" : "none",
              textDecorationColor: t.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {h.name}
          </div>
          {h.description && (
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                color: t.muted,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {h.description}
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 13,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: a?.current_streak > 0 ? t.accent : t.muted,
            paddingLeft: 6,
          }}
        >
          {a ? `${a.current_streak}d` : "—"}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 12,
            fontVariantNumeric: "tabular-nums",
            color:
              a?.completion_rate_30d >= 70
                ? t.accent
                : a?.completion_rate_30d >= 40
                  ? t.text
                  : t.muted,
            paddingLeft: 6,
          }}
        >
          {a ? `${a.completion_rate_30d}` : "—"}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 9,
            letterSpacing: "0.04em",
            fontWeight: 700,
            color: ["ELITE", "CONSISTENT"].includes(
              a ? getStatus(a.completion_rate_30d) : "",
            )
              ? t.accent
              : t.muted,
            paddingLeft: 6,
          }}
        >
          {a ? getStatus(a.completion_rate_30d) : "—"}
        </div>
        <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          {[
            [`✏`, () => setEditHabit(h)],
            [`✕`, () => setConfirmDel(h.id)],
          ].map(([icon, fn], i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                fn();
              }}
              style={{
                background: "none",
                border: "none",
                color: t.muted,
                cursor: "pointer",
                padding: "4px 5px",
                fontSize: 11,
                fontFamily: "'IBM Plex Mono',monospace",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = i === 1 ? t.negative : t.text)
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = t.muted)}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=IBM+Plex+Serif:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${t.bg}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:${t.bg}}
        ::-webkit-scrollbar-thumb{background:${t.border}}
        input::placeholder{color:${t.muted};opacity:0.45}
      `}</style>

      {/* ── Nav ── */}
      <div
        style={{
          height: 44,
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
          display: "flex",
          alignItems: "stretch",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRight: `1px solid ${t.border}`,
            paddingRight: 16,
            marginRight: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ width: 7, height: 7, background: t.accent }} />
          <span
            style={{
              fontFamily: "'IBM Plex Serif',serif",
              fontSize: 14,
              fontWeight: 700,
              color: t.text,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Discipline Terminal
          </span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {["DASHBOARD", "HABITS", "STATS"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "0 14px",
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: i === 0 ? t.accent : t.muted,
                  borderBottom:
                    i === 0 ? `2px solid ${t.accent}` : "2px solid transparent",
                  borderRight: `1px solid ${t.border}`,
                  cursor: "default",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {!isMobile &&
            [
              { l: "INDEX", v: discIndex },
              { l: `STREAK`, v: `${maxStreak}D` },
              { l: "TODAY", v: `${done}/${total}` },
              { l: today, v: null },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderLeft: `1px solid ${t.border}`,
                  padding: "0 12px",
                  height: "100%",
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    color: t.muted,
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.l}
                </span>
                {s.v && (
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: t.accent,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s.v}
                  </span>
                )}
              </div>
            ))}
          <div
            style={{
              borderLeft: `1px solid ${t.border}`,
              padding: "0 12px",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                background: "none",
                border: `1px solid ${t.border}`,
                color: t.muted,
                cursor: "pointer",
                padding: "4px 10px",
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.08em",
                borderRadius: "50px",
              }}
            >
              {dark ? "☀ LIGHT" : "◑ DARK"}
            </button>
          </div>
        </div>
      </div>

      {isMobile ? (
        /* ── Mobile ── */
        <div>
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${t.border}`,
              background: t.surface,
            }}
          >
            {["HABITS", "ANALYTICS"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab.toLowerCase())}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  color: mobileTab === tab.toLowerCase() ? t.accent : t.muted,
                  borderBottom:
                    mobileTab === tab.toLowerCase()
                      ? `2px solid ${t.accent}`
                      : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          {mobileTab === "habits" && (
            <div>
              <div
                style={{
                  padding: "9px 14px",
                  borderBottom: `1px solid ${t.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: t.surface,
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    color: t.muted,
                    letterSpacing: "0.1em",
                  }}
                >
                  HABITS ({total}) · {done} DONE · INDEX {discIndex}
                </span>
                <button
                  onClick={() => setShowAdd(true)}
                  style={{
                    background: t.accent,
                    border: "none",
                    color: "#fff",
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 0,
                  }}
                >
                  + NEW
                </button>
              </div>
              {habits.map((h) => (
                <HabitRow key={h.id} h={h} />
              ))}
            </div>
          )}
          {mobileTab === "analytics" && (
            <div style={{ padding: 14 }}>
              <AnalyticsPanel habit={selected} t={t} />
            </div>
          )}
        </div>
      ) : (
        /* ── Desktop ── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 330px",
            height: "calc(100vh - 44px)",
            overflow: "hidden",
          }}
        >
          {/* Left: table */}
          <div
            style={{
              borderRight: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Table head */}
            <div
              style={{
                borderBottom: `1px solid ${t.border}`,
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                alignItems: "center",
                height: 32,
                padding: "0 14px",
                background: t.surface,
                flexShrink: 0,
              }}
            >
              {["", "HABIT", "STREAK", "30D %", "STATUS", ""].map((h, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    color: t.muted,
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                    paddingLeft: i > 1 ? "6px" : 0,
                  }}
                >
                  {h}
                </div>
              ))}
            </div>
            {/* Sub-header */}
            <div
              style={{
                borderBottom: `1px solid ${t.border}`,
                padding: "0 14px",
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: t.surface,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  color: t.muted,
                  letterSpacing: "0.08em",
                }}
              >
                {total} HABITS · {done} DONE · {pct}% COMPLETE
              </span>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: "none",
                  border: `1px solid ${t.accent}`,
                  color: t.accent,
                  cursor: "pointer",
                  padding: "3px 10px",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  borderRadius: 0,
                }}
              >
                + NEW HABIT
              </button>
            </div>
            {/* Rows */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {habits.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 180,
                    color: t.muted,
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 11,
                    gap: 6,
                  }}
                >
                  <div>NO HABITS TRACKED</div>
                  <div style={{ fontSize: 9, opacity: 0.5 }}>
                    PRESS + NEW HABIT TO BEGIN
                  </div>
                </div>
              ) : (
                habits.map((h) => <HabitRow key={h.id} h={h} />)
              )}
            </div>
            {/* Footer terminal bar */}
            <div
              style={{
                borderTop: `1px solid ${t.border}`,
                padding: "7px 14px",
                background: t.surface,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  color: t.muted,
                  letterSpacing: "0.06em",
                }}
              >
                <span style={{ color: t.accent }}>▶</span>&nbsp;&nbsp; STREAK:{" "}
                {maxStreak}D MAX &nbsp;·&nbsp; DISCIPLINE INDEX: {discIndex}{" "}
                &nbsp;·&nbsp; STATUS:{" "}
                {Number(discIndex) >= 70
                  ? "CONSISTENT"
                  : Number(discIndex) >= 50
                    ? "BUILDING"
                    : "NEEDS WORK"}
              </div>
            </div>
          </div>

          {/* Right: analytics */}
          <div style={{ overflowY: "auto", padding: 16 }}>
            <AnalyticsPanel habit={selected} t={t} />
          </div>
        </div>
      )}

      {showAdd && (
        <HabitModal
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          t={t}
        />
      )}
      {editHabit && (
        <HabitModal
          initial={editHabit}
          onSubmit={handleUpdate}
          onCancel={() => setEditHabit(null)}
          t={t}
        />
      )}
      {confirmDel && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
          t={t}
        />
      )}
    </div>
  );
}
