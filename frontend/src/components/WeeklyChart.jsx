import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/**
 * ChartTooltip — custom Recharts tooltip for weekly bar chart.
 */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      <div className="chart-tooltip__value">{payload[0].value}/7</div>
    </div>
  );
}

/**
 * WeeklyChart — Recharts BarChart wrapper for weekly completions.
 *
 * Props:
 *   chartData — [{ week, completed }]
 */
export default function WeeklyChart({ chartData }) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", padding: "14px 0" }}>
        NO DATA YET — START LOGGING
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        data={chartData}
        margin={{ top: 2, right: 0, left: -28, bottom: 0 }}
        barCategoryGap="35%"
      >
        <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: "var(--muted)", fontSize: 9, fontFamily: "var(--font-mono)" }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 7]}
          tick={{ fill: "var(--muted)", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--accent-dim)" }} />
        <Bar dataKey="completed" radius={[2, 2, 0, 0]} maxBarSize={20}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.completed >= 5 ? "var(--accent)" : "var(--border)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
