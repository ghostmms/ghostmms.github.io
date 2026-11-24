'use client';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ReactNode } from 'react';

const axis = { fontSize: 11, fill: '#55565A' };
export const GRID = '#ECEAE4';

function Tip({ active, payload, label, fmt }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string; fmt?: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-card">
      {label && <p className="mb-1 font-bold">{label}</p>}
      {payload.map((p) => <p key={p.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />{p.name}: <span className="num font-semibold">{fmt ? fmt(p.value) : p.value.toLocaleString('en-GB')}</span></p>)}
    </div>
  );
}

export function Panel({ title, sub, children, action, className = '', id }: { title: string; sub?: string; children: ReactNode; action?: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card min-w-0 p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="font-display text-[17px] font-bold">{title}</h3>{sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}</div>{action}
      </div>
      {children}
    </section>
  );
}

export function TimeChart({ data }: { data: { label: string; scans: number; completions: number }[] }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gScans" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B6E99" stopOpacity={0.18} /><stop offset="1" stopColor="#0B6E99" stopOpacity={0} /></linearGradient>
            <linearGradient id="gComp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F4D32" stopOpacity={0.28} /><stop offset="1" stopColor="#0F4D32" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={24} />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={46} />
          <Tooltip content={<Tip />} />
          <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="scans" name="QR scans" stroke="#0B6E99" strokeWidth={2} fill="url(#gScans)" />
          <Area type="monotone" dataKey="completions" name="Journey completions" stroke="#0F4D32" strokeWidth={2} fill="url(#gComp)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBars({ data, color = '#0F4D32', fmt, height, colors }: { data: { name: string; value: number }[]; color?: string; fmt?: (n: number) => string; height?: number; colors?: string[] }) {
  const h = height ?? Math.max(160, data.length * 32 + 20);
  return (
    <div style={{ height: h }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap={6}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={axis} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <YAxis type="category" dataKey="name" tick={{ ...axis, fill: '#111' }} tickLine={false} axisLine={false} width={150} />
          <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: '#F0F5F1' }} />
          <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, fill: '#111', formatter: (v: number) => (fmt ? fmt(v) : v.toLocaleString('en-GB')) }}>
            {data.map((d, i) => <Cell key={d.name} fill={colors?.[i] ?? color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VBars({ data, color = '#0F4D32', fmt, height = 220, name = 'Value' }: { data: { name: string; value: number }[]; color?: string; fmt?: (n: number) => string; height?: number; name?: string }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
          <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={fmt} width={52} />
          <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: '#F0F5F1' }} />
          <Bar dataKey="value" name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
