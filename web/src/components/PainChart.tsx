"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function PainChart({ data }: { data: { date: string; level: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="pain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2a78d6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#888" }}
            tickFormatter={(d: string) => d.slice(5)}
            minTickGap={40}
          />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#888" }} width={30} />
          <Tooltip
            formatter={(v) => [`${v}/10`, "Pain"] as [string, string]}
            labelStyle={{ color: "#555" }}
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke="#2a78d6"
            strokeWidth={2}
            fill="url(#pain)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
