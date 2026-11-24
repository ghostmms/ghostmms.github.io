'use client';
import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Airport } from '@/lib/data/airports';
import { greatCirclePoints } from '@/lib/emissions';
import { TZ_OUTLINE } from '@/lib/geo';

const K = 10; // px per degree
type L = { from: Airport; to: Airport };

/** Animated great-circle route map for one or more legs, with Tanzania outlined. */
export function RouteMap({ from, to, legs, className = '' }: { from?: Airport; to?: Airport; legs?: L[]; className?: string }) {
  const reduce = useReducedMotion();
  const all: L[] = useMemo(() => (legs && legs.length ? legs : from && to ? [{ from, to }] : []), [legs, from, to]);
  const paths = useMemo(() => all.map((l) => greatCirclePoints(l.from, l.to, 80)), [all]);
  if (!all.length) return null;
  const xy = (lat: number, lon: number) => [lon * K, -lat * K] as const;
  const pts = paths.flat();
  const lats = [...pts.map((p) => p.lat), -11.8, -1], lons = [...pts.map((p) => p.lon), 29.3, 40.5];
  const pad = 6;
  let minLon = Math.min(...lons) - pad, maxLon = Math.max(...lons) + pad, minLat = Math.min(...lats) - pad, maxLat = Math.max(...lats) + pad;
  // keep a pleasant aspect ratio (no taller than 1.3 : 1)
  const wDeg = maxLon - minLon, hDeg = maxLat - minLat;
  if (hDeg > wDeg * 1.3) { const add = (hDeg / 1.3 - wDeg) / 2; minLon -= add; maxLon += add; }
  if (wDeg > hDeg * 2.2) { const add = (wDeg / 2.2 - hDeg) / 2; minLat -= add; maxLat += add; }
  const vb = { x: minLon * K, y: -maxLat * K, w: (maxLon - minLon) * K, h: (maxLat - minLat) * K };
  const fs = vb.w / 42;
  const ds = paths.map((ps) => 'M' + ps.map((p) => xy(p.lat, p.lon).map((v) => v.toFixed(1)).join(' ')).join(' L'));
  const tz = 'M' + TZ_OUTLINE.map(([la, lo]) => xy(la, lo).join(' ')).join(' L') + 'Z';
  const grid: { k: string; d: string; label: string; y: number; eq: boolean }[] = [];
  for (let la = Math.ceil(minLat / 10) * 10; la <= maxLat; la += 10) grid.push({ k: `la${la}`, d: `M${vb.x} ${-la * K} H${vb.x + vb.w}`, label: la === 0 ? 'Equator' : `${Math.abs(la)}°${la > 0 ? 'N' : 'S'}`, y: -la * K, eq: la === 0 });
  const vgrid: { k: string; d: string }[] = [];
  for (let lo = Math.ceil(minLon / 10) * 10; lo <= maxLon; lo += 10) vgrid.push({ k: `lo${lo}`, d: `M${lo * K} ${vb.y} V${vb.y + vb.h}` });
  const stops = new Map<string, Airport>();
  all.forEach((l) => { stops.set(l.from.code, l.from); stops.set(l.to.code, l.to); });
  const origin = all[0].from.code;
  const dur = 2 / Math.max(1, all.length / 1.5);
  const label = `Route: ${all.map((l) => l.from.code).concat(all[all.length - 1].to.code).join(' to ')}`;
  return (
    <svg role="img" aria-label={label} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className={`block h-auto w-full ${className}`}>
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="#EAF2F5" />
      {vgrid.map((g) => <path key={g.k} d={g.d} stroke="#cddde4" strokeWidth={fs / 10} />)}
      {grid.map((g) => (
        <g key={g.k}>
          <path d={g.d} stroke={g.eq ? '#0B6E99' : '#cddde4'} strokeWidth={fs / (g.eq ? 8 : 10)} strokeDasharray={g.eq ? `${fs / 2} ${fs / 3}` : undefined} />
          <text x={vb.x + fs * 0.6} y={g.y - fs * 0.35} fontSize={fs * 0.8} fill={g.eq ? '#0B6E99' : '#55565A'}>{g.label}</text>
        </g>
      ))}
      <path d={tz} fill="#0F4D32" fillOpacity={0.14} stroke="#0F4D32" strokeWidth={fs / 8} />
      <text x={32.6 * K} y={6.6 * K} fontSize={fs * 0.8} fill="#0F4D32" fontWeight={700}>TANZANIA</text>
      <defs>
        {ds.map((d, i) => (
          <mask key={i} id={`route-reveal-${i}`} maskUnits="userSpaceOnUse" x={vb.x} y={vb.y} width={vb.w} height={vb.h}>
            <motion.path d={d} fill="none" stroke="#fff" strokeWidth={fs} strokeLinecap="round"
              {...({ initial: reduce ? false : { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: dur, delay: reduce ? 0 : i * dur, ease: 'easeInOut' } } as any)} />
          </mask>
        ))}
      </defs>
      {ds.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={all[i] && (all[i] as L & { returnLeg?: boolean }).returnLeg ? '#0B6E99' : '#111111'} strokeWidth={fs / 5} strokeLinecap="round" strokeDasharray={`${fs / 2.2} ${fs / 3}`} mask={`url(#route-reveal-${i})`} />
      ))}
      {[...stops.values()].map((a) => {
        const [x, y] = xy(a.lat, a.lon);
        const tzStop = a.country === 'Tanzania';
        return (
          <g key={a.code}>
            <circle cx={x} cy={y} r={fs * 0.42} fill={a.code === origin ? '#fff' : tzStop ? '#0F4D32' : '#111'} stroke={a.code === origin ? '#111' : '#fff'} strokeWidth={fs / 7} />
            <text x={x + fs * 0.7} y={y - fs * 0.45} fontSize={fs * 0.95} fontWeight={700} fill={tzStop ? '#0F4D32' : '#111'}>{a.code}</text>
          </g>
        );
      })}
    </svg>
  );
}
