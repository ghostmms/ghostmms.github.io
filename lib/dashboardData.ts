import { PROJECTS, type ProjectId } from './data/projects';
import type { JourneyRecord } from './demoStore';
import { airportByCode } from './data/airports';
import { estimate, type Cabin } from './emissions';

/**
 * SIMULATED DATA. Every number produced here is generated for demonstration and does not
 * represent real visitors, contributions, government statistics or conservation outcomes.
 */
export type Txn = {
  ref: string;
  date: Date;
  day: number; // index from start
  hour: number;
  airport: 'DAR' | 'JRO' | 'ZNZ';
  origin: string;
  lang: 'en' | 'sw';
  projectId: ProjectId;
  amount: number;
  cabin: string;
  /** Estimated flight footprint per passenger for the whole trip (kg CO2e, illustrative) */
  kg: number;
  source: 'simulated' | 'this device';
};

export type DayStat = { date: Date; scans: number; completions: number };

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick<T>(r: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of items) { if ((x -= w) <= 0) return v; }
  return items[items.length - 1][0];
}

export const ORIGINS: [string, number][] = [
  ['United Kingdom', 14], ['United States', 13], ['Germany', 10], ['Italy', 8], ['France', 7], ['Kenya', 6], ['Netherlands', 5],
  ['India', 5], ['China', 4], ['United Arab Emirates', 4], ['South Africa', 4], ['Spain', 3], ['Switzerland', 3], ['Canada', 3], ['Other', 11],
];
const SEASON = [0.95, 0.9, 0.7, 0.55, 0.55, 0.85, 1.2, 1.25, 1.05, 0.95, 0.8, 1.1];
const HOURS: [number, number][] = Array.from({ length: 24 }, (_, h) => [h, h < 5 ? 1 : h < 9 ? 6 : h < 12 ? 4 : h < 15 ? 5 : h < 19 ? 6 : h < 23 ? 8 : 3]);
const AMOUNTS: [number, number][] = [[10, 30], [25, 38], [50, 18], [100, 7], [15, 2], [20, 3], [40, 1], [75, 1]];

const ORIGIN_AIRPORT: Record<string, string> = { 'United Kingdom': 'LHR', 'United States': 'JFK', Germany: 'FRA', Italy: 'FCO', France: 'CDG', Kenya: 'NBO', Netherlands: 'AMS', India: 'BOM', China: 'PEK', 'United Arab Emirates': 'DXB', 'South Africa': 'JNB', Spain: 'MAD', Switzerland: 'ZRH', Canada: 'YYZ', Other: 'IST' };
const CABIN_ID: Record<string, Cabin> = { Economy: 'economy', 'Premium economy': 'premium', Business: 'business', First: 'first' };
const kgCache = new Map<string, number>();
function tripKg(origin: string, airport: string, cabin: string, ret: boolean) {
  const key = `${origin}|${airport}|${cabin}|${ret}`;
  let v = kgCache.get(key);
  if (v === undefined) {
    const a = airportByCode(ORIGIN_AIRPORT[origin] ?? 'IST')!, b = airportByCode(airport)!;
    v = estimate(a, b, CABIN_ID[cabin] ?? 'economy', 1).perPassengerKg * (ret ? 2 : 1);
    kgCache.set(key, v);
  }
  return v;
}

export type Dataset = { start: Date; days: DayStat[]; txns: Txn[] };

let cache: { key: string; data: Dataset } | null = null;

/** 365 days of simulated activity ending yesterday, plus today (device journeys only), deterministic for a given end date. */
export function simulated(end = new Date()): Dataset {
  // Simulated history ends yesterday; today shows only journeys completed on this device.
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
  const key = endDay.toISOString();
  if (cache?.key === key) return cache.data;
  const r = mulberry32(20261123);
  const start = new Date(endDay); start.setDate(start.getDate() - 364);
  const days: DayStat[] = [];
  const txns: Txn[] = [];
  for (let i = 0; i < 365; i++) {
    const date = new Date(start); date.setDate(start.getDate() + i);
    const growth = 0.75 + 0.35 * (i / 364);
    const weekday = [1.12, 0.92, 0.9, 0.95, 1.0, 1.08, 1.15][date.getDay()];
    const scans = Math.round(150 * SEASON[date.getMonth()] * growth * weekday * (0.85 + r() * 0.3));
    const rate = 0.36 + r() * 0.1;
    const completions = Math.round(scans * rate);
    days.push({ date, scans, completions });
    for (let k = 0; k < completions; k++) {
      const projectId = pick<ProjectId>(r, [['mangrove', 27], ['forest', 22], ['wildlife', 24], ['community', 13], ['biodiversity', 14]]);
      const airport = pick<'DAR' | 'JRO' | 'ZNZ'>(r, [['DAR', 44], ['JRO', 31], ['ZNZ', 25]]);
      const origin = pick(r, ORIGINS);
      const cabin = pick(r, [['Economy', 78], ['Premium economy', 8], ['Business', 12], ['First', 2]]);
      txns.push({
        ref: `SIM-${String(i).padStart(3, '0')}-${String(k).padStart(3, '0')}`,
        date, day: i, hour: pick(r, HOURS), airport, origin,
        lang: r() < 0.09 ? 'sw' : 'en', projectId, amount: pick(r, AMOUNTS),
        cabin, kg: tripKg(origin, airport, cabin, r() < 0.82), source: 'simulated',
      });
    }
  }
  const today = new Date(endDay); today.setDate(endDay.getDate() + 1);
  days.push({ date: today, scans: 0, completions: 0 });
  cache = { key, data: { start, days, txns } };
  return cache.data;
}

export function withDevice(ds: Dataset, records: JourneyRecord[]): Dataset {
  if (!records.length) return ds;
  const extra: Txn[] = records.map((rec) => {
    const date = new Date(rec.createdAt);
    const day = Math.max(0, Math.min(ds.days.length - 1, Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - ds.start.getTime()) / 86400000)));
    const ap = (['DAR', 'JRO', 'ZNZ'].includes(rec.to) ? rec.to : 'DAR') as Txn['airport'];
    return {
      ref: rec.ref, date, day, hour: date.getHours(), airport: ap, origin: rec.country || airportByCode(rec.from)?.country || 'Other',
      lang: rec.lang, projectId: rec.projectId, amount: rec.amountUsd, cabin: rec.cabin, kg: rec.kgPerPassenger, source: 'this device',
    };
  });
  const days = ds.days.map((d, i) => {
    const n = extra.filter((e) => e.day === i).length;
    return n ? { ...d, scans: d.scans + n, completions: d.completions + n } : d;
  });
  return { start: ds.start, days, txns: [...extra, ...ds.txns] };
}

export const REGION_OF: Record<ProjectId, string> = Object.fromEntries(PROJECTS.map((p) => [p.id, p.region])) as Record<ProjectId, string>;
