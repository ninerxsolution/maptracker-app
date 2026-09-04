"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisStyle = { fontSize: 11, fill: "var(--color-faint)" };

function TooltipBox({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs shadow-lg">
      <p className="text-faint">{label}</p>
      <p className="font-semibold text-fg">
        {payload[0].value}
        {suffix ? ` ${suffix}` : ""}
      </p>
    </div>
  );
}

export function SignupsAreaChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            content={<TooltipBox suffix="ใหม่" />}
            cursor={{ stroke: "var(--color-border-strong)" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#signups)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MagnitudeBarChart({
  data,
}: {
  data: { label: string; count: number; color: string }[];
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            content={<TooltipBox suffix="เหตุการณ์" />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
