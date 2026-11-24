'use client';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Txn } from '@/lib/dashboardData';
import { projectById } from '@/lib/data/projects';
import { fmtUsd } from '@/lib/format';

type Key = 'date' | 'ref' | 'projectId' | 'origin' | 'airport' | 'amount';
const COLS: [Key, string][] = [['date', 'Date'], ['ref', 'Reference'], ['projectId', 'Initiative'], ['origin', 'Visitor origin'], ['airport', 'Airport'], ['amount', 'Amount (simulated)']];
const PAGE = 12;

export function TxnTable({ txns }: { txns: Txn[] }) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ k: Key; dir: 1 | -1 }>({ k: 'date', dir: -1 });
  const [page, setPage] = useState(0);
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = s ? txns.filter((t) => [t.ref, t.origin, t.airport, projectById(t.projectId)?.name ?? '', t.source].some((v) => v.toLowerCase().includes(s))) : txns;
    const val = (t: Txn) => (sort.k === 'date' ? t.date.getTime() * 100 + t.hour : sort.k === 'projectId' ? projectById(t.projectId)?.name ?? '' : t[sort.k]);
    return [...f].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir; });
  }, [txns, q, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages - 1);
  const view = rows.slice(p * PAGE, p * PAGE + PAGE);
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="txq" className="sr-only">Search transactions</label>
          <input id="txq" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search reference, initiative, country or airport"
            className="focus-ring h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm" />
        </div>
        <p className="text-xs text-muted"><span className="num font-semibold text-ink">{rows.length.toLocaleString('en-GB')}</span> records · no personal data shown</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-sand">
            <tr>
              {COLS.map(([k, l]) => (
                <th key={k} scope="col" aria-sort={sort.k === k ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-muted ${k === 'amount' ? 'text-right' : ''}`}>
                  <button type="button" className="focus-ring inline-flex items-center gap-1 rounded hover:text-ink" onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : k === 'date' || k === 'amount' ? -1 : 1 }))}>
                    {l}{sort.k === k && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {view.map((t) => (
              <tr key={t.ref} className="hover:bg-green-50/60">
                <td className="num whitespace-nowrap px-4 py-2.5">{t.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} <span className="text-muted">{String(t.hour).padStart(2, '0')}:00</span></td>
                <td className="num px-4 py-2.5 text-xs">{t.ref}{t.source === 'this device' && <span className="ml-2 rounded-full bg-flag-gold px-2 py-0.5 text-[10px] font-bold">This device</span>}</td>
                <td className="px-4 py-2.5"><span className="mr-2 inline-block h-2 w-2 rounded-sm" style={{ background: projectById(t.projectId)?.color }} />{projectById(t.projectId)?.name}</td>
                <td className="px-4 py-2.5">{t.origin}</td>
                <td className="num px-4 py-2.5">{t.airport}</td>
                <td className="num px-4 py-2.5 text-right font-semibold">{fmtUsd(t.amount, t.amount % 1 ? 2 : 0)}</td>
              </tr>
            ))}
            {!view.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">No records match your search.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs">
        <span className="text-muted">Page {p + 1} of {pages}</span>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous page" disabled={p === 0} onClick={() => setPage(p - 1)} className="focus-ring grid h-8 w-8 place-items-center rounded border border-line disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Next page" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="focus-ring grid h-8 w-8 place-items-center rounded border border-line disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
