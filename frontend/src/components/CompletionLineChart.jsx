import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CompletionLineChart({ data }) {
  if (!data || !data.length) return <div style={{color:'var(--muted)',fontFamily:'IBM Plex Mono,monospace'}}>No data</div>;
  return (
    <div style={{width:'100%',height:180}}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
          <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={{background:'var(--surface-2)',border:'1px solid var(--border)',color:'var(--text)'}} />
          <Line type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2} dot={{r:3}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
