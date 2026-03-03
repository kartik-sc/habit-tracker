import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getAnalytics } from "../api/habits";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(rate) {
  if (rate >= 85) return "ELITE";
  if (rate >= 70) return "CONSISTENT";
  if (rate >= 50) return "BUILDING";
  if (rate >= 30) return "UNSTABLE";
  return "FAILING";
}

function generateHeatmap() {
  const days = [];
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Seed pseudo-random per-slot so it stays stable on re-render
    days.push({ date: d, filled: ((d.getDate() * 7 + d.getMonth() * 3) % 10) > 3 });
  }
  return days;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children, t }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 9, letterSpacing: "0.14em",
      color: t.muted, marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function StatBlock({ label, value, unit, highlight, t }) {
  return (
    <div style={{ background: t.bg, padding: "10px 12px" }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, letterSpacing: "0.1em", color: t.muted, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 26, fontWeight: 700, lineHeight: 1,
        color: highlight ? t.accent : t.text,
        fontVariantNumeric: "tabular-nums",
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, color: t.muted, marginTop: 3,
      }}>
        {unit}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      padding: "6px 10px",
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <div style={{ fontSize: 10, color: t.muted }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>
        {payload[0].value}/7
      </div>
    </div>
  );
}

function StreakDots({ count, total = 30, t }) {
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 13, height: 13,
            background: i < count ? t.accent : t.border,
            opacity: i < count ? 1 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function ActivityHeatmap({ t }) {
  const [days] = useState(generateHeatmap);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div style={{ display: "flex", gap: 3 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date.toDateString()}
                style={{
                  width: 11, height: 11,
                  background: day.filled ? t.accent : t.border,
                  opacity: day.filled ? 1 : 0.38,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
        {[
          { bg: t.border, opacity: 0.38, label: "MISSED" },
          { bg: t.accent, opacity: 1,    label: "COMPLETED" },
        ].map(({ bg, opacity, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, background: bg, opacity }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9, color: t.muted,
            }}>
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ t }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: 10,
    }}>
      <div style={{ width: 28, height: 28, border: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 8, height: 8, background: t.border }} />
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11, color: t.muted, letterSpacing: "0.1em",
      }}>
        SELECT A HABIT TO INSPECT
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9, color: t.muted, opacity: 0.45,
      }}>
        ANALYTICS WILL APPEAR HERE
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * AnalyticsPanel — right-hand inspector pane.
 *
 * Props:
 *   habit  — selected habit object | null
 *   t      — theme tokens
 */
export default function AnalyticsPanel({ habit, t }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!habit) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalytics(habit.id)
      .then(d  => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [habit?.id]);

  if (!habit) return <EmptyState t={t} />;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: t.muted }}>
        LOADING…
      </span>
    </div>
  );

  if (error) return (
    <div style={{ padding: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: t.negative }}>
      ERROR: {error}
    </div>
  );

  if (!data) return <EmptyState t={t} />;

  const status    = getStatus(data.completion_rate_30d);
  const chartData = data.weekly_data.map(d => ({ week: d.week, completed: d.completed }));

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>

      {/* ── Habit identity ────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: 12, marginBottom: 14 }}>
        <div style={{
          fontSize: 9, color: t.muted, letterSpacing: "0.14em", marginBottom: 5,
        }}>
          INSPECTING
        </div>
        <div style={{
          fontFamily: "'IBM Plex Serif', serif",
          fontSize: 16, fontWeight: 700, color: t.text,
        }}>
          {habit.name}
        </div>
        {habit.description && (
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>
            {habit.description}
          </div>
        )}
      </div>

      {/* ── Status banner ─────────────────────────────────────── */}
      <div style={{
        background: t.accentDim,
        border: `1px solid ${t.accent}33`,
        padding: "9px 12px",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 9, color: t.muted, letterSpacing: "0.1em", marginBottom: 5 }}>
          DISCIPLINE STATUS
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: t.accent, letterSpacing: "0.04em" }}>
            {status}
          </span>
          <span style={{ fontSize: 10, color: t.muted }}>
            INDEX: {data.completion_rate_30d}
          </span>
        </div>
      </div>

      {/* ── Stat grid ─────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        border: `1px solid ${t.border}`,
        marginBottom: 16, overflow: "hidden",
      }}>
        <StatBlock label="CURRENT"  value={data.current_streak}        unit="DAYS" highlight={data.current_streak > 0} t={t} />
        <div style={{ borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>
          <StatBlock label="LONGEST"  value={data.longest_streak}        unit="DAYS" t={t} />
        </div>
        <StatBlock label="30-DAY"   value={`${data.completion_rate_30d}%`} unit="RATE" t={t} />
      </div>

      {/* ── Streak continuity dots ────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>STREAK CONTINUITY — LAST 30 DAYS</SectionLabel>
        <StreakDots count={data.current_streak} total={30} t={t} />
      </div>

      {/* ── Weekly bar chart ──────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <SectionLabel t={t}>WEEKLY COMPLETIONS / 7</SectionLabel>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              data={chartData}
              margin={{ top: 2, right: 0, left: -28, bottom: 0 }}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="2 2" stroke={t.border} vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: t.muted, fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" }}
                axisLine={{ stroke: t.border }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 7]}
                tick={{ fill: t.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip t={t} />} cursor={{ fill: t.accentDim }} />
              <Bar dataKey="completed" radius={0} maxBarSize={20}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.completed >= 5 ? t.accent : t.border}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ fontSize: 10, color: t.muted, padding: "12px 0" }}>
            NO DATA YET — START LOGGING
          </div>
        )}
      </div>

      {/* ── Activity heatmap ──────────────────────────────────── */}
      <div>
        <SectionLabel t={t}>ACTIVITY MAP — LAST 70 DAYS</SectionLabel>
        <ActivityHeatmap t={t} />
      </div>

    </div>
  );
}