'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import type { Airport } from '@/lib/data/airports';
import { inputCls } from './Field';

export function AirportCombobox({ id, airports, value, onChange, placeholder, error, describedBy, compact }:
  { id: string; airports: Airport[]; value: string; onChange: (code: string) => void; placeholder: string; error?: string; describedBy?: string; compact?: boolean }) {
  const listId = useId();
  const selected = airports.find((a) => a.code === value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return airports;
    return airports.filter((a) => [a.code, a.city, a.name, a.country].some((s) => s.toLowerCase().includes(q)));
  }, [airports, query]);
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const choose = (a: Airport) => { onChange(a.code); setQuery(''); setOpen(false); };
  return (
    <div ref={wrap} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input id={id} role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" autoComplete="off"
          aria-invalid={!!error} aria-describedby={describedBy}
          aria-activedescendant={open && results[active] ? `${listId}-${results[active].code}` : undefined}
          className={`${inputCls(error)} pl-10 pr-10`} placeholder={selected ? `${selected.city} (${selected.code})` : placeholder}
          value={open ? query : selected ? `${selected.city} · ${selected.code}` : query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); choose(results[active]); }
            else if (e.key === 'Escape') setOpen(false);
          }} />
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </div>
      {open && (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-md border border-line bg-white py-1 shadow-card">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">No airport matches “{query}”.</li>}
          {results.map((a, i) => (
            <li key={a.code} id={`${listId}-${a.code}`} role="option" aria-selected={a.code === value}
              onMouseDown={(e) => { e.preventDefault(); choose(a); }} onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? 'bg-green-50' : ''}`}>
              <span className="num w-11 shrink-0 font-bold">{a.code}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{a.city}</span><span className="block truncate text-xs text-muted">{a.name} · {a.country}</span></span>
              {a.code === value && <Check className="h-4 w-4 text-green" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
      {selected && !open && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted"><MapPin className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{compact ? `${selected.name}, ${selected.country}` : <>{selected.name}, {selected.country} · {Math.abs(selected.lat).toFixed(2)}°{selected.lat < 0 ? 'S' : 'N'} {Math.abs(selected.lon).toFixed(2)}°{selected.lon < 0 ? 'W' : 'E'}{selected.note ? ` — ${selected.note}` : ''}</>}</span></p>
      )}
    </div>
  );
}
