'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Box, Map as MapIcon } from 'lucide-react';
import { TanzaniaMap, type MapPoint } from './TanzaniaMap';

const Tanzania3D = dynamic(() => import('../three/Tanzania3D'), {
  ssr: false,
  loading: () => <div className="grid h-full w-full place-items-center text-sm text-muted">Loading 3D view…</div>,
});

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

/** 2D interactive map with an optional 3D view. 3D is off by default on small or low-power devices. */
export function MapExplorer({ points, selected, onSelect, renderPopover, className = 'h-[460px]', bubbles = false, default3D = false }:
  { points: MapPoint[]; selected?: string | null; onSelect: (id: string | null) => void; renderPopover?: (p: MapPoint) => ReactNode; className?: string; bubbles?: boolean; default3D?: boolean }) {
  const reduce = useReducedMotion();
  const [can3D, setCan3D] = useState(false);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  useEffect(() => {
    const ok = webglOk();
    setCan3D(ok);
    const strong = window.innerWidth >= 900 && (navigator.hardwareConcurrency ?? 4) >= 4;
    if (ok && default3D && strong && !reduce) setMode('3d');
  }, [default3D, reduce]);
  const sel = points.find((p) => p.id === selected);
  return (
    <div className={`relative ${className}`}>
      {mode === '3d' ? (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#EAF2F5_70%)]">
          <Tanzania3D points={points} selected={selected} onSelect={onSelect} still={!!reduce} />
          {sel && renderPopover && <div className="absolute bottom-3 left-3 z-10 w-72 rounded-lg bg-white p-4 text-sm shadow-card" role="dialog" aria-label={sel.label}>{renderPopover(sel)}</div>}
          <p className="pointer-events-none absolute right-3 top-3 rounded bg-white/85 px-2 py-1 text-[10px] text-muted">Drag to rotate · scroll to zoom · schematic</p>
        </div>
      ) : (
        <TanzaniaMap className="h-full w-full" points={points} selected={selected} onSelect={onSelect} renderPopover={renderPopover} bubbles={bubbles} />
      )}
      {can3D && (
        <div role="group" aria-label="Map view" className="absolute left-3 top-3 z-10 inline-flex rounded-md border border-line bg-white p-1 shadow-sm">
          {([['2d', 'Map', MapIcon], ['3d', '3D', Box]] as const).map(([m, label, Icon]) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
              className={`focus-ring inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-bold ${mode === m ? 'bg-green text-white' : 'text-ink hover:bg-green-50'}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
