'use client';
import { useMemo } from 'react';
import { simulated, withDevice, REGION_OF, type Txn } from '@/lib/dashboardData';
import { PROJECTS, type ProjectId } from '@/lib/data/projects';
import type { JourneyRecord } from '@/lib/demoStore';

export type Range = '30d' | '90d' | '12m' | 'custom';
export type Filters = { range: Range; from: string; to: string; project: 'all' | ProjectId; region: 'all' | string };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useDashboard(records: JourneyRecord[], f: Filters, refreshKey: number) {
  return useMemo(() => {
    const ds = withDevice(simulated(), records);
    const last = ds.days.length - 1;
    let a = 0, b = last;
    if (f.range === '30d') a = last - 29;
    else if (f.range === '90d') a = last - 89;
    else if (f.range === '12m') a = last - 364;
    else if (f.range === 'custom' && f.from && f.to) {
      const toIdx = (s: string) => Math.round((new Date(s + 'T00:00:00').getTime() - ds.start.getTime()) / 864e5);
      a = Math.max(0, Math.min(last, toIdx(f.from))); b = Math.max(0, Math.min(last, toIdx(f.to)));
      if (a > b) [a, b] = [b, a];
    }
    const days = ds.days.slice(a, b + 1);
    const seriesDays = b === last && ds.days[last].scans === 0 ? days.slice(0, -1) : days;
    const inRange = (t: Txn) => t.day >= a && t.day <= b;
    const match = (t: Txn) => (f.project === 'all' || t.projectId === f.project) && (f.region === 'all' || REGION_OF[t.projectId] === f.region);
    const txns = ds.txns.filter((t) => inRange(t) && match(t));
    const scans = days.reduce((s, d) => s + d.scans, 0);
    const manual = Math.round(scans * 0.12);
    const visitors = scans + manual;
    const completions = txns.length;
    const total = txns.reduce((s, t) => s + t.amount, 0);
    const kgTotal = txns.reduce((s, t) => s + t.kg, 0);
    const byOriginKg = new Map<string, { kg: number; n: number }>();
    txns.forEach((t) => { const o = byOriginKg.get(t.origin) ?? { kg: 0, n: 0 }; o.kg += t.kg; o.n++; byOriginKg.set(t.origin, o); });
    const footprintByOrigin = [...byOriginKg.entries()].filter(([k]) => k !== 'Other').map(([name, o]) => ({ name, value: o.kg / o.n / 1000 })).sort((x, y) => y.value - x.value).slice(0, 8);
    const byProject = PROJECTS.map((p) => {
      const ts = txns.filter((t) => t.projectId === p.id);
      const amt = ts.reduce((s, t) => s + t.amount, 0);
      return { id: p.id, name: p.name, color: p.color, count: ts.length, amount: amt, avg: ts.length ? amt / ts.length : 0, units: amt * p.unitsPerUsd, unitLabel: p.unitLabel };
    });
    const count = <K extends string>(key: (t: Txn) => K) => {
      const m = new Map<K, number>(); txns.forEach((t) => m.set(key(t), (m.get(key(t)) ?? 0) + 1));
      return [...m.entries()].map(([name, value]) => ({ name, value })).sort((x, y) => y.value - x.value);
    };
    const origins = count((t) => t.origin);
    const airports = count((t) => t.airport);
    const langs = count((t) => (t.lang === 'sw' ? 'Kiswahili' : 'English'));
    const regions = count((t) => REGION_OF[t.projectId]);
    const hours = Array.from({ length: 24 }, (_, h) => ({ name: String(h).padStart(2, '0'), value: 0 }));
    txns.forEach((t) => { hours[t.hour].value++; });
    // time series: daily for <= 92 days, weekly otherwise
    const span = b - a + 1;
    const bucket = span > 92 ? 7 : 1;
    const series: { label: string; scans: number; completions: number; amount: number }[] = [];
    for (let i = seriesDays.length % bucket; i < seriesDays.length; i += bucket) {
      const chunk = seriesDays.slice(i, i + bucket);
      const d0 = chunk[0].date;
      const di0 = a + i, di1 = a + i + chunk.length - 1;
      const ct = txns.filter((t) => t.day >= di0 && t.day <= di1);
      series.push({
        label: d0.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        scans: chunk.reduce((s, d) => s + d.scans, 0),
        completions: ct.length,
        amount: ct.reduce((s, t) => s + t.amount, 0),
      });
    }
    const monthly = new Map<string, number>();
    txns.forEach((t) => { const k = t.date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }); monthly.set(k, (monthly.get(k) ?? 0) + t.amount); });
    return {
      start: iso(ds.days[a].date), end: iso(ds.days[b].date), minDate: iso(ds.start), maxDate: iso(ds.days[last].date),
      visitors, scans, completions, total, kgTotal, kgAvg: completions ? kgTotal / completions : 0, usdPerT: kgTotal ? total / (kgTotal / 1000) : 0, footprintByOrigin, avg: completions ? total / completions : 0, rate: visitors ? completions / visitors : 0,
      byProject, origins, airports, langs, regions, hours, series, bucket,
      monthly: [...monthly.entries()].map(([name, value]) => ({ name, value })),
      txns, deviceCount: txns.filter((t) => t.source === 'this device').length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, f.range, f.from, f.to, f.project, f.region, refreshKey]);
}
export type DashData = ReturnType<typeof useDashboard>;
