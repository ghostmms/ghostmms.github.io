'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { LANDMARKS, TZ_ISLANDS, TZ_LAKES, TZ_OUTLINE, project, toPath } from '@/lib/geo';

export type MapPoint = { id: string; label: string; lat: number; lon: number; color?: string; radius?: number; sub?: string; badge?: string };
type VB = { x: number; y: number; w: number; h: number };
const FULL: VB = { x: -60, y: -60, w: 1300, h: 1260 };

export function TanzaniaMap({ points, selected, onSelect, renderPopover, bubbles = false, landmarks = true, className = '', ariaLabel = 'Interactive map of Tanzania' }:
  { points: MapPoint[]; selected?: string | null; onSelect?: (id: string | null) => void; renderPopover?: (p: MapPoint) => ReactNode; bubbles?: boolean; landmarks?: boolean; className?: string; ariaLabel?: string }) {
  const [vb, setVb] = useState<VB>(FULL);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; vb: VB; moved: boolean } | null>(null);
  const zoomBy = useCallback((f: number, cx?: number, cy?: number) => {
    setVb((v) => {
      const w = Math.max(220, Math.min(FULL.w, v.w * f));
      const h = (w / FULL.w) * FULL.h;
      const px = cx ?? v.x + v.w / 2, py = cy ?? v.y + v.h / 2;
      const x = px - ((px - v.x) / v.w) * w, y = py - ((py - v.y) / v.h) * h;
      return { x, y, w, h };
    });
  }, []);
  useEffect(() => {
    const el = svg.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setVb((v) => {
        const cx = v.x + ((e.clientX - r.left) / r.width) * v.w, cy = v.y + ((e.clientY - r.top) / r.height) * v.h;
        const f = e.deltaY > 0 ? 1.15 : 1 / 1.15;
        const w = Math.max(220, Math.min(FULL.w, v.w * f)); const h = (w / FULL.w) * FULL.h;
        return { x: cx - ((cx - v.x) / v.w) * w, y: cy - ((cy - v.y) / v.h) * h, w, h };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  const k = vb.w / FULL.w; // scale factor so marks keep screen size
  const sel = points.find((p) => p.id === selected);
  const pct = (lat: number, lon: number) => { const [x, y] = project(lat, lon); return { left: `${((x - vb.x) / vb.w) * 100}%`, top: `${((y - vb.y) / vb.h) * 100}%` }; };
  return (
    <div className={`relative select-none overflow-hidden rounded-lg bg-[#EAF2F5] ${className}`}>
      <svg ref={svg} role="group" aria-label={ariaLabel} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="h-full w-full touch-none"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, vb, moved: false }; }}
        onPointerMove={(e) => {
          const d = drag.current; if (!d || !svg.current) return;
          const r = svg.current.getBoundingClientRect();
          const dx = ((e.clientX - d.x) / r.width) * d.vb.w, dy = ((e.clientY - d.y) / r.height) * d.vb.h;
          if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
          setVb({ ...d.vb, x: d.vb.x - dx, y: d.vb.y - dy });
        }}
        onPointerUp={(e) => { const d = drag.current; drag.current = null; if (d && !d.moved && (e.target as Element).tagName === 'svg') onSelect?.(null); }}>
        <path d={toPath(TZ_OUTLINE)} fill="#E6EBE3" stroke="#0F4D32" strokeWidth={3 * k} strokeLinejoin="round" />
        {TZ_LAKES.map((l, i) => <path key={i} d={toPath(l)} fill="#BFD9E5" />)}
        {TZ_ISLANDS.map((l, i) => <path key={i} d={toPath(l)} fill="#E6EBE3" stroke="#0F4D32" strokeWidth={2.5 * k} />)}
        <text x={1030} y={700} fontSize={26 * Math.max(k, 0.6)} fill="#0B6E99" fontStyle="italic" textAnchor="middle">Indian Ocean</text>
        {landmarks && LANDMARKS.map((m) => {
          const [x, y] = project(m.lat, m.lon);
          return (
            <g key={m.name} aria-hidden="true">
              {m.kind === 'peak' ? <path d={`M${x - 11 * k} ${y + 8 * k} L${x} ${y - 10 * k} L${x + 11 * k} ${y + 8 * k}Z`} fill="#55565A" />
                : <circle cx={x} cy={y} r={(m.kind === 'capital' ? 7 : 5) * k} fill={m.kind === 'capital' ? '#fff' : '#55565A'} stroke="#55565A" strokeWidth={2.5 * k} />}
              <text x={x + 14 * k} y={y + 7 * k} fontSize={22 * k} fill="#55565A">{m.name}</text>
            </g>
          );
        })}
        {points.map((p) => {
          const [x, y] = project(p.lat, p.lon);
          const isSel = p.id === selected;
          const r = (p.radius ?? 22) * (bubbles ? 1 : k);
          return (
            <g key={p.id} role="button" tabIndex={0} aria-label={`${p.label}${p.sub ? ', ' + p.sub : ''}`} aria-pressed={isSel}
              className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-[#0B6E99]"
              onPointerDown={(e) => e.stopPropagation()} onClick={() => onSelect?.(isSel ? null : p.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(isSel ? null : p.id); } }}>
              {isSel && <circle cx={x} cy={y} r={r + 12 * k} fill="none" stroke={p.color ?? '#0F4D32'} strokeWidth={3 * k} opacity={0.5}><animate attributeName="r" values={`${r + 6 * k};${r + 18 * k};${r + 6 * k}`} dur="2s" repeatCount="indefinite" /></circle>}
              <circle cx={x} cy={y} r={r} fill={p.color ?? '#0F4D32'} fillOpacity={bubbles ? 0.75 : 1} stroke="#fff" strokeWidth={4 * k} />
              {p.badge && <text x={x} y={y + 8 * k} textAnchor="middle" fontSize={22 * k} fontWeight={700} fill="#fff">{p.badge}</text>}
            </g>
          );
        })}
      </svg>
      {sel && renderPopover && (
        <div className="pointer-events-auto absolute z-10 w-64 -translate-x-1/2 translate-y-4 rounded-lg bg-white p-4 text-sm shadow-card" style={pct(sel.lat, sel.lon)} role="dialog" aria-label={sel.label}>
          {renderPopover(sel)}
        </div>
      )}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-md border border-line bg-white shadow-sm">
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1 / 1.4)} className="focus-ring grid h-10 w-10 place-items-center hover:bg-green-50"><Plus className="h-4 w-4" /></button>
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1.4)} className="focus-ring grid h-10 w-10 place-items-center border-t border-line hover:bg-green-50"><Minus className="h-4 w-4" /></button>
        <button type="button" aria-label="Reset map view" onClick={() => setVb(FULL)} className="focus-ring grid h-10 w-10 place-items-center border-t border-line hover:bg-green-50"><RotateCcw className="h-4 w-4" /></button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] text-muted">Schematic map · not an authoritative boundary map · drag to pan, use buttons or Ctrl + scroll to zoom</p>
    </div>
  );
}
