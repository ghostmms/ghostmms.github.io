'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, ChevronDown, Coins, Download, FileText, Globe2, Home, Leaf, ListOrdered, Map as MapIcon, RefreshCw, RotateCcw, Search, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Ribbon } from '../ui/Ribbon';
import { Button } from '../ui/Button';
import { Counter } from '../ui/Counter';
import { DemoBadge } from '../ui/DemoBadge';
import { Photo } from '../ui/Photo';
import { MapExplorer } from '../map/MapExplorer';
import { HBars, Panel, TimeChart, VBars } from './Charts';
import { TxnTable } from './TxnTable';
import { useDashboard, type Filters, type Range } from './useDashboard';
import { resetDemo, useDemo } from '@/lib/demoStore';
import { PROJECTS, projectById, type ProjectId } from '@/lib/data/projects';
import { REGION_OF } from '@/lib/dashboardData';
import { fmtInt, fmtPct, fmtUsd, fmtUsdShort } from '@/lib/format';

const NAV = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'geography', label: 'Geography', icon: MapIcon },
  { id: 'conservation', label: 'Conservation', icon: Leaf },
  { id: 'tourism', label: 'Tourism', icon: Globe2 },
  { id: 'finance', label: 'Financial', icon: Coins },
  { id: 'transactions', label: 'Transactions', icon: ListOrdered },
];
const REGIONS = [...new Set(PROJECTS.map((p) => p.region))];
const RANGES: [Range, string][] = [['30d', '30 days'], ['90d', '90 days'], ['12m', '12 months'], ['custom', 'Custom']];
const INDICATORS = [
  { k: 'Native seedlings planted (forest sites)', v: 'forest', unit: 'seedlings', status: 'On track' },
  { k: 'Mangrove propagules planted', v: 'mangrove', unit: 'propagules', status: 'On track' },
  { k: 'Wildlife monitoring days funded', v: 'wildlife', unit: 'days', status: 'In progress' },
  { k: 'Household seedlings distributed', v: 'community', unit: 'seedlings', status: 'On track' },
  { k: 'Reef and seagrass monitoring days', v: 'biodiversity', unit: 'days', status: 'Baseline' },
];

export function Dashboard() {
  const reduce = useReducedMotion();
  const demo = useDemo();
  const [f, setF] = useState<Filters>({ range: '12m', from: '', to: '', project: 'all', region: 'all' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [mapSel, setMapSel] = useState<string | null>(null);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [active, setActive] = useState('overview');
  const d = useDashboard(demo.records, f, refreshKey);
  useEffect(() => { setRefreshedAt(new Date()); }, []);
  useEffect(() => {
    const obs = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-30% 0px -60% 0px' });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const filterLabel = `${f.project === 'all' ? 'All initiatives' : projectById(f.project)?.name} · ${f.region === 'all' ? 'All regions' : f.region}`;
  const rangeLabel = `${d.start} to ${d.end}`;
  const refresh = () => { setRefreshing(true); setTimeout(() => { setRefreshKey((k) => k + 1); setRefreshedAt(new Date()); setRefreshing(false); }, 900); };
  const exportCsv = () => {
    const head = 'reference,date,hour,arrival_airport,visitor_origin,language,initiative,region,amount_usd_simulated,cabin,source';
    const rows = d.txns.map((t) => [t.ref, t.date.toISOString().slice(0, 10), t.hour, t.airport, `"${t.origin}"`, t.lang, `"${projectById(t.projectId)?.name}"`, REGION_OF[t.projectId], t.amount, `"${t.cabin}"`, t.source].join(','));
    const csv = ['# Tanzania Green Journey - ILLUSTRATIVE DEMONSTRATION DATA - simulated, not official statistics', `# Range ${rangeLabel}; ${filterLabel}`, head, ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `TGJ-demo-transactions-${d.end}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  const exportPdf = async () => {
    setExporting(true);
    try {
      const { dashboardPdf } = await import('@/lib/pdf');
      await dashboardPdf({
        rangeLabel, filters: filterLabel,
        kpis: [['Visitors (demo)', fmtInt(d.visitors)], ['QR scans', fmtInt(d.scans)], ['Completions', fmtInt(d.completions)], ['Participation', fmtPct(d.rate)], ['Simulated total', fmtUsdShort(d.total)], ['Average', fmtUsd(d.avg, 2)]],
        byProject: d.byProject.map((p) => [p.name, fmtInt(p.count), fmtUsd(p.amount)]),
        origins: d.origins.map((o) => [o.name, fmtInt(o.value)]),
        airports: d.airports.map((o) => [o.name, fmtInt(o.value)]),
      });
    } finally { setExporting(false); }
  };

  const kpis = [
    { label: 'Demonstration visitors', value: d.visitors, fmt: fmtInt, note: 'QR scans plus manual opens' },
    { label: 'QR scans', value: d.scans, fmt: fmtInt, note: 'All airports' },
    { label: 'Journey completions', value: d.completions, fmt: fmtInt, note: 'With a simulated contribution' },
    { label: f.project === 'all' && f.region === 'all' ? 'Participation rate' : 'Share of visitors', value: d.rate * 100, fmt: (n: number) => `${n.toFixed(1)}%`, note: f.project === 'all' && f.region === 'all' ? 'Completions ÷ visitors' : 'Filtered completions ÷ all visitors' },
    { label: 'Simulated contributions', value: d.total, fmt: (n: number) => fmtUsdShort(n), note: 'No money collected' },
    { label: 'Average contribution', value: d.avg, fmt: (n: number) => fmtUsd(n, 2), note: 'Per completed journey' },
    { label: 'Participating initiatives', value: f.project === 'all' ? PROJECTS.filter((p) => f.region === 'all' || p.region === f.region).length : 1, fmt: fmtInt, note: 'Demonstration projects' },
  ];
  const mapPoints = useMemo(() => {
    const max = Math.max(1, ...d.byProject.map((p) => p.amount));
    return PROJECTS.map((p) => {
      const s = d.byProject.find((x) => x.id === p.id)!;
      return { id: p.id, label: p.name, sub: `${p.place} · ${p.region}`, lat: p.lat, lon: p.lon, color: p.color, radius: 14 + 26 * Math.sqrt(s.amount / max) };
    });
  }, [d.byProject]);

  const sel = 'focus-ring h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold';
  return (
    <div className="flex min-h-screen bg-[#F3F2EE]">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink px-4 py-6 text-white lg:flex">
        <Ribbon height={5} className="-mx-4 -mt-6 mb-6" />
        <div className="px-2"><Logo light href="/" /></div>
        <p className="mt-2 px-2 text-[11px] text-white/60">National overview · demonstration</p>
        <nav aria-label="Dashboard sections" className="mt-8 flex flex-col gap-1">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'true' : undefined}
              className={`focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${active === n.id ? 'bg-white/12 font-bold text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'}`}>
              <n.icon className="h-4 w-4" aria-hidden="true" />{n.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-3 px-2 text-[11px] leading-relaxed text-white/60">
          <div className="grid h-12 w-12 place-items-center rounded border border-dashed border-white/30 text-center text-[7px] leading-tight text-white/50">MARK<br />RESERVED</div>
          <p>Design concept. Not an official government system. No official mark has been designed.</p>
          <Link href="/journey/" className="focus-ring inline-block rounded font-bold text-white underline">Open visitor journey</Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="z-20 border-b border-line bg-white/95 backdrop-blur no-print lg:sticky lg:top-0">
          <Ribbon height={4} className="lg:hidden" />
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
            <div className="lg:hidden"><Logo href="/" /></div>
            <div className="hidden lg:block"><h1 className="font-display text-2xl font-bold">National overview</h1><p className="text-xs text-muted">Tanzania Green Journey · {rangeLabel}</p></div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <DemoBadge />
              <Button size="sm" variant="secondary" loading={refreshing} iconLeft={<RefreshCw className="h-4 w-4" />} onClick={refresh}>Refresh</Button>
              <Button size="sm" variant="secondary" iconLeft={<Download className="h-4 w-4" />} onClick={exportCsv}>CSV</Button>
              <Button size="sm" loading={exporting} iconLeft={<FileText className="h-4 w-4" />} onClick={exportPdf}>PDF report</Button>
            </div>
          </div>
          <nav aria-label="Dashboard sections" className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="focus-ring shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold">{n.label}</a>)}
          </nav>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5 sm:px-6" role="group" aria-label="Filters">
            <div className="inline-flex rounded-md border border-line bg-white p-0.5" role="group" aria-label="Date range">
              {RANGES.map(([r, l]) => (
                <button key={r} type="button" aria-pressed={f.range === r} onClick={() => setF((x) => ({ ...x, range: r, from: x.from || d.start, to: x.to || d.end }))}
                  className={`focus-ring h-9 rounded px-3 text-xs font-bold ${f.range === r ? 'bg-green text-white' : 'hover:bg-green-50'}`}>{l}</button>
              ))}
            </div>
            {f.range === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs">
                <label className="sr-only" htmlFor="df">From</label><input id="df" type="date" min={d.minDate} max={d.maxDate} value={f.from} onChange={(e) => setF((x) => ({ ...x, from: e.target.value }))} className={sel} />
                <span>to</span>
                <label className="sr-only" htmlFor="dt">To</label><input id="dt" type="date" min={d.minDate} max={d.maxDate} value={f.to} onChange={(e) => setF((x) => ({ ...x, to: e.target.value }))} className={sel} />
              </div>
            )}
            <label className="sr-only" htmlFor="fp">Initiative</label>
            <select id="fp" className={sel} value={f.project} onChange={(e) => setF((x) => ({ ...x, project: e.target.value as 'all' | ProjectId }))}>
              <option value="all">All initiatives</option>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label className="sr-only" htmlFor="fr">Region</label>
            <select id="fr" className={sel} value={f.region} onChange={(e) => setF((x) => ({ ...x, region: e.target.value }))}>
              <option value="all">All regions</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {(f.project !== 'all' || f.region !== 'all' || f.range !== '12m') && (
              <button type="button" onClick={() => setF({ range: '12m', from: '', to: '', project: 'all', region: 'all' })} className="focus-ring inline-flex h-9 items-center gap-1 rounded px-2 text-xs font-bold text-green hover:bg-green-50"><X className="h-3.5 w-3.5" />Clear</button>
            )}
            <span className="ml-auto text-[11px] text-muted" aria-live="polite">{refreshedAt ? `Refreshed ${refreshedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}</span>
          </div>
        </header>

        <main id="main" className="space-y-6 px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-[#FFF6CF] px-4 py-3 text-sm text-[#4F4100]">
            <strong>Illustrative demonstration data.</strong>
            <span>Figures are simulated. They are not government statistics, real visitor activity or verified conservation outcomes.</span>
            {d.deviceCount > 0 && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold">Includes {d.deviceCount} journey{d.deviceCount > 1 ? 's' : ''} from this device</span>}
          </div>

          <section id="overview" aria-labelledby="ov-h" className="scroll-mt-40">
            <h2 id="ov-h" className="sr-only">Overview</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              {kpis.map((k, i) => (
                <motion.div key={k.label} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
                  <p className="text-xs text-muted">{k.label}</p>
                  <p className="mt-2 text-2xl font-bold leading-none"><Counter key={`${k.label}-${refreshKey}`} value={k.value} format={k.fmt} /></p>
                  <p className="mt-2 text-[11px] text-muted">{k.note}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6"><Panel title="Participation over time" sub={`${d.bucket === 7 ? 'Weekly' : 'Daily'} · simulated · QR scans are not attributed to an initiative`}><TimeChart data={d.series} /></Panel></div>
          </section>

          <section id="geography" aria-labelledby="geo-h" className="scroll-mt-40">
            <h2 id="geo-h" className="mb-3 font-display text-xl font-bold">Geographic intelligence</h2>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <Panel title="Initiative locations" sub="Circle size shows simulated contributions in the selected period">
                <MapExplorer className="h-[440px]" bubbles points={mapPoints} selected={mapSel} onSelect={setMapSel}
                  renderPopover={(p) => { const s = d.byProject.find((x) => x.id === p.id)!; return (<><p className="font-bold">{p.label}</p><p className="text-xs text-muted">{p.sub}</p><p className="mt-2 text-xs"><span className="num font-bold">{fmtInt(s.count)}</span> journeys · <span className="num font-bold">{fmtUsd(s.amount)}</span> simulated</p><button type="button" className="focus-ring mt-2 rounded text-xs font-bold text-green underline" onClick={() => { setF((x) => ({ ...x, project: p.id as ProjectId })); setMapSel(null); }}>Filter dashboard to this initiative</button></>); }} />
              </Panel>
              <div className="space-y-6">
                <Panel title="Regional participation" sub="Completed journeys by initiative region"><HBars data={d.regions} color="#0F4D32" /></Panel>
                <Panel title="Project distribution" sub="Share of completed journeys">
                  <div className="flex h-4 overflow-hidden rounded" role="img" aria-label="Share of journeys by initiative">
                    {d.byProject.filter((p) => p.count).map((p) => <div key={p.id} title={`${p.name}: ${fmtPct(p.count / Math.max(1, d.completions))}`} style={{ flex: p.count, background: p.color }} className="border-r-2 border-white last:border-0" />)}
                  </div>
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                    {d.byProject.map((p) => <li key={p.id} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} /><span className="flex-1">{p.name}</span><span className="num font-semibold">{fmtPct(p.count / Math.max(1, d.completions))}</span></li>)}
                  </ul>
                </Panel>
              </div>
            </div>
          </section>

          <section id="conservation" aria-labelledby="con-h" className="scroll-mt-40">
            <h2 id="con-h" className="mb-3 font-display text-xl font-bold">Conservation analytics</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {d.byProject.map((s) => {
                const p = projectById(s.id)!; const open = openProject === s.id;
                return (
                  <article key={s.id} className="card overflow-hidden">
                    <Photo src={p.image.replace('.jpg', '-sm.jpg')} alt="" className="h-24 w-full" />
                    <div className="p-4">
                      <p className="flex items-center gap-2 text-xs font-bold"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />{p.region}</p>
                      <h3 className="mt-1 font-display font-bold leading-snug">{p.name}</h3>
                      <p className="num mt-2 text-xl font-bold">{fmtInt(s.count)} <span className="text-xs font-normal text-muted">journeys</span></p>
                      <p className="num text-sm">{fmtUsd(s.amount)} <span className="text-xs text-muted">simulated</span></p>
                      <button type="button" aria-expanded={open} onClick={() => setOpenProject(open ? null : s.id)} className="focus-ring mt-2 inline-flex items-center gap-1 rounded text-xs font-bold text-green">Details<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} /></button>
                      {open && (
                        <div className="mt-2 space-y-1.5 border-t border-line pt-2 text-xs leading-relaxed">
                          <p><strong>Location:</strong> {p.place}</p>
                          <p><strong>Objective:</strong> {p.objective}</p>
                          <p><strong>Average:</strong> <span className="num">{fmtUsd(s.avg, 2)}</span></p>
                          <p><strong>Illustrative output:</strong> <span className="num">{fmtInt(s.units)}</span> {s.unitLabel}</p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <Panel title="Engagement by initiative" sub="Completed journeys"><HBars data={d.byProject.map((p) => ({ name: p.name, value: p.count }))} colors={d.byProject.map((p) => p.color)} /></Panel>
              <Panel title="Illustrative environmental indicators" sub="Derived from simulated contributions using illustrative unit costs · not verified outcomes">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[11px] uppercase tracking-[0.08em] text-muted"><th className="pb-2 font-semibold">Indicator</th><th className="pb-2 text-right font-semibold">Value</th><th className="pb-2 pl-3 font-semibold">Status</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {INDICATORS.map((ind) => { const s = d.byProject.find((p) => p.id === ind.v)!; return (
                      <tr key={ind.k}><td className="py-2.5 pr-2">{ind.k}</td><td className="num py-2.5 text-right font-bold">{fmtInt(s.units)}</td><td className="py-2.5 pl-3 text-xs text-muted">{ind.status} (demo)</td></tr>
                    ); })}
                    <tr><td className="py-2.5 pr-2">Independent verification</td><td className="py-2.5 text-right">—</td><td className="py-2.5 pl-3 text-xs text-muted">To be appointed</td></tr>
                  </tbody>
                </table>
              </Panel>
            </div>
          </section>

          <section id="tourism" aria-labelledby="tour-h" className="scroll-mt-40">
            <h2 id="tour-h" className="mb-3 font-display text-xl font-bold">Tourism analytics</h2>
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title="Visitor origin" sub="Country of residence (top 10, simulated)"><HBars data={d.origins.slice(0, 10)} color="#0B6E99" /></Panel>
              <div className="space-y-6">
                <Panel title="Airport participation" sub="Completed journeys by arrival airport"><HBars data={d.airports.map((a) => ({ name: { DAR: 'Dar es Salaam (DAR)', JRO: 'Kilimanjaro (JRO)', ZNZ: 'Zanzibar (ZNZ)' }[a.name] ?? a.name, value: a.value }))} color="#0F4D32" height={140} /></Panel>
                <Panel title="Language selection" sub="Language used to complete the journey">
                  {d.langs.map((l) => { const pct = l.value / Math.max(1, d.completions); return (
                    <div key={l.name} className="mb-2.5"><div className="mb-1 flex justify-between text-sm"><span>{l.name}</span><span className="num font-semibold">{fmtPct(pct)}</span></div><div className="h-2.5 rounded-full bg-line"><div className="h-full rounded-full bg-green" style={{ width: `${pct * 100}%` }} /></div></div>
                  ); })}
                </Panel>
              </div>
              <Panel title="Footprint awareness" sub="Estimated flight footprint of participating visitors · per passenger, whole trip · illustrative method" className="xl:col-span-2">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-lg bg-sand p-4"><p className="text-xs text-muted">Estimated emissions of participants</p><p className="num mt-1 text-2xl font-bold">{fmtInt(d.kgTotal / 1000)} t CO₂e</p></div>
                    <div className="rounded-lg bg-sand p-4"><p className="text-xs text-muted">Average per participating visitor</p><p className="num mt-1 text-2xl font-bold">{(d.kgAvg / 1000).toFixed(2)} t</p></div>
                    <div className="rounded-lg bg-sand p-4"><p className="text-xs text-muted">Simulated contributions per estimated tonne</p><p className="num mt-1 text-2xl font-bold">{fmtUsd(d.usdPerT, 2)}</p><p className="mt-1 text-[11px] text-muted">An awareness ratio, not an offset price</p></div>
                  </div>
                  <div><p className="mb-2 text-xs font-semibold text-muted">Average estimated footprint by visitor origin (t CO₂e per visitor)</p><HBars data={d.footprintByOrigin} color="#111111" fmt={(n) => n.toFixed(2)} /></div>
                </div>
              </Panel>
              <Panel title="Arrival patterns" sub="Journeys started by hour of day (local time)" className="xl:col-span-2"><VBars data={d.hours} color="#0B6E99" height={200} name="Journeys" /></Panel>
            </div>
          </section>

          <section id="finance" aria-labelledby="fin-h" className="scroll-mt-40">
            <h2 id="fin-h" className="mb-3 font-display text-xl font-bold">Financial demonstration</h2>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <Panel title="Simulated contributions by initiative" sub="US$ · no money collected"><HBars data={d.byProject.map((p) => ({ name: p.name, value: p.amount }))} colors={d.byProject.map((p) => p.color)} fmt={fmtUsdShort} /></Panel>
              <Panel title="Monthly simulated totals" sub="US$"><VBars data={d.monthly} fmt={fmtUsdShort} height={230} name="Simulated total" /></Panel>
            </div>
          </section>

          <section id="transactions" aria-labelledby="tx-h" className="scroll-mt-40">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <h2 id="tx-h" className="font-display text-xl font-bold">Transaction demonstration history</h2>
              <div className="flex items-center gap-2">
                {confirmReset ? (
                  <span className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs shadow-card" role="alert">Remove all journeys stored on this device?
                    <button type="button" className="focus-ring rounded bg-[#A3261B] px-2 py-1 font-bold text-white" onClick={() => { resetDemo(); setConfirmReset(false); setRefreshKey((k) => k + 1); }}>Reset</button>
                    <button type="button" className="focus-ring rounded px-2 py-1 font-bold" onClick={() => setConfirmReset(false)}>Cancel</button></span>
                ) : (
                  <Button size="sm" variant="ghost" iconLeft={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>Reset demo data</Button>
                )}
              </div>
            </div>
            <TxnTable txns={d.txns} />
          </section>
          <p className="pb-4 text-center text-[11px] text-muted"><BarChart3 className="mr-1 inline h-3 w-3" aria-hidden="true" />All metrics are illustrative or simulated. No government endorsement, partnership or official mark is implied.</p>
        </main>
      </div>
    </div>
  );
}
