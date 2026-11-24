'use client';
import { useEffect, useState } from 'react';
import type { Cabin } from './emissions';
import type { ProjectId } from './data/projects';
import type { Lang } from './i18n';

/** A journey completed on this device. Stored only in this browser (localStorage). No data leaves the device. */
export type JourneyRecord = {
  ref: string;
  createdAt: string;
  name?: string;
  country?: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  travelDate: string;
  cabin: Cabin;
  passengers: number;
  kgPerPassenger: number;
  projectId: ProjectId;
  amountUsd: number;
  lang: Lang;
};

type DemoState = { records: JourneyRecord[]; scans: number; starts: number };
const KEY = 'tgj-demo-v1';
const EVT = 'tgj-demo-change';
const empty: DemoState = { records: [], scans: 0, starts: 0 };

export function loadDemo(): DemoState {
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const s = JSON.parse(raw);
    return { records: Array.isArray(s.records) ? s.records : [], scans: Number(s.scans) || 0, starts: Number(s.starts) || 0 };
  } catch {
    return empty;
  }
}

function save(s: DemoState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export const recordScan = () => { const s = loadDemo(); save({ ...s, scans: s.scans + 1 }); };
export const recordStart = () => { const s = loadDemo(); save({ ...s, starts: s.starts + 1 }); };
export const addRecord = (r: JourneyRecord) => { const s = loadDemo(); save({ ...s, records: [r, ...s.records].slice(0, 200) }); };
export const resetDemo = () => {
  try { localStorage.removeItem(KEY); sessionStorage.removeItem('tgj-journey'); } catch {}
  window.dispatchEvent(new Event(EVT));
};
export const findRecord = (ref: string) => loadDemo().records.find((r) => r.ref === ref);

export function makeRef() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TGJ-DEMO-${ymd}-${rnd}`;
}

export function useDemo() {
  const [state, setState] = useState<DemoState>(empty);
  useEffect(() => {
    const update = () => setState(loadDemo());
    update();
    window.addEventListener(EVT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(EVT, update); window.removeEventListener('storage', update); };
  }, []);
  return state;
}
