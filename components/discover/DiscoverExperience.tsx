'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, HandHeart, MapPin } from 'lucide-react';
import { DESTINATIONS } from '@/lib/data/destinations';
import { projectById } from '@/lib/data/projects';
import { MapExplorer } from '../map/MapExplorer';
import { Photo } from '../ui/Photo';
import { Button } from '../ui/Button';
import { Ribbon } from '../ui/Ribbon';

export function DiscoverExperience({ onSupport, default3D = false }: { onSupport?: (projectId: string) => void; default3D?: boolean }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(DESTINATIONS[0].id);
  const [open, setOpen] = useState(false);
  const d = DESTINATIONS.find((x) => x.id === sel)!;
  const project = d.projectId ? projectById(d.projectId) : undefined;
  const choose = (id: string | null) => { if (id) { setSel(id); setOpen(false); } };
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="card overflow-hidden" aria-live="polite">
          <div className="relative h-[300px] sm:h-[380px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={d.id} className="absolute inset-0" initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                <Photo src={d.image} alt={d.name} cut="soft" className="h-full w-full" credit={d.credit} priority />
              </motion.div>
            </AnimatePresence>
            <span className="absolute left-4 top-4 rounded bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">{d.kicker}</span>
          </div>
          <div className="p-5 sm:p-6">
            <Ribbon className="w-16" height={4} />
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{d.name}</h2>
            <p className="font-display text-sm italic text-muted">{d.sw}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{d.region}</p>
            <p className="mt-3 text-[15px] leading-relaxed">{d.summary}</p>
            <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded text-sm font-bold text-green">
              {open ? 'Show less' : 'Facts and conservation story'}<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <ul className="mt-3 space-y-2">{d.facts.map((f) => <li key={f} className="flex gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />{f}</li>)}</ul>
                  <blockquote className="mt-4 border-t border-line pt-4 font-display text-[17px] italic leading-relaxed">{d.story}</blockquote>
                </motion.div>
              )}
            </AnimatePresence>
            {project && onSupport && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-lg bg-green-50 p-3">
                <HandHeart className="h-5 w-5 text-green" aria-hidden="true" />
                <span className="flex-1 text-sm">Related demonstration initiative: <strong>{project.name}</strong>, {project.place}</span>
                <Button size="sm" onClick={() => onSupport(project.id)}>Support this</Button>
              </div>
            )}
          </div>
        </article>
        <MapExplorer className="h-[380px] lg:h-auto lg:min-h-[520px]" default3D={default3D}
          points={DESTINATIONS.map((x) => ({ id: x.id, label: x.name, lat: x.lat, lon: x.lon, color: x.id === sel ? '#0F4D32' : '#0B6E99', radius: 16, sub: x.kicker }))}
          selected={sel} onSelect={choose}
          renderPopover={(p) => <><p className="font-bold">{p.label}</p><p className="text-xs text-muted">{p.sub}</p></>} />
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0" role="listbox" aria-label="Destinations">
        <div className="flex snap-x snap-mandatory gap-3">
          {DESTINATIONS.map((x) => (
            <button key={x.id} type="button" role="option" aria-selected={x.id === sel} onClick={() => choose(x.id)}
              className={`focus-ring group w-[200px] shrink-0 snap-start overflow-hidden rounded-lg bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 ${x.id === sel ? 'ring-2 ring-green' : ''}`}>
              <div className="h-28 overflow-hidden"><Photo src={x.image.replace('.jpg', '-sm.jpg')} alt="" className="h-full w-full" imgClassName="transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{x.kicker}</p><p className="mt-0.5 text-sm font-bold leading-snug">{x.name}</p></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
