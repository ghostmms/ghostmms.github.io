'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeftRight, ArrowRight, Car, ChevronDown, Clock, Download, Globe2, HandHeart, Leaf, Minus, Plane, Plus, Share2, Train, Trash2, Luggage, Repeat, CalendarDays, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Counter } from '../ui/Counter';
import { Ribbon } from '../ui/Ribbon';
import { Photo } from '../ui/Photo';
import { AirportCombobox } from '../ui/AirportCombobox';
import { RouteMap } from '../journey/RouteMap';
import { AIRPORTS, airportByCode } from '@/lib/data/airports';
import { PROJECTS } from '@/lib/data/projects';
import { CABINS, GUIDE_USD_PER_T, HAULS, METHOD, REF, equivalents, estimateTrip, fromDistance, hoursToKm, suggestedContribution, type Cabin } from '@/lib/emissions';
import { emptyDraft } from '../journey/types';
import { fmtInt, fmtUsd } from '@/lib/format';
import { useI18n } from '@/lib/i18n';
import { recordStart } from '@/lib/demoStore';

type LegIn = { from: string; to: string };
const TIERS = [
  { id: 'short', label: 'Short-haul', hint: '1–3 hours', hours: 2 },
  { id: 'medium', label: 'Medium-haul', hint: '3–6 hours', hours: 4.5 },
  { id: 'long', label: 'Long-haul', hint: '6–12 hours', hours: 9 },
  { id: 'ultra', label: 'Ultra-long-haul', hint: '12+ hours', hours: 14 },
];
const fmtT = (kg: number) => (kg / 1000).toFixed(kg < 10000 ? 2 : 1);
const nice = (n: number) => (n >= 100 ? fmtInt(n) : n >= 10 ? n.toFixed(0) : n.toFixed(1));

const FAQ: [string, string][] = [
  ['Is a contribution an offset?', 'No. Tanzania Green Journey invites a voluntary contribution to conservation in Tanzania. It does not cancel, neutralise or offset your flight, and you will never see “carbon neutral” claims here. The estimate helps you understand your impact; the contribution helps protect places you came to see.'],
  ['How is the estimate calculated?', 'Great-circle distance between airports, plus 8% for indirect routing and holding, multiplied by a per-passenger-kilometre factor that depends on the flight length and the cabin class (a business seat takes about 2.9 times the space of an economy seat). The structure follows the UK Government greenhouse-gas conversion-factor method. The factors here are illustrative and must be replaced with a methodology agreed with national authorities before public use.'],
  ['Why are non-CO₂ effects optional?', 'Contrails and nitrogen oxides at altitude add warming, but scientists still debate how much. We show them as an optional ×1.7 sensitivity so you can see the range rather than a single number.'],
  ['What does the suggested contribution mean?', `It is a simple guide for travellers who like to give in proportion to their travel: an illustrative US$${GUIDE_USD_PER_T} per estimated tonne, rounded. You can give any amount, or nothing at all.`],
  ['Is my information stored?', 'The calculator runs entirely in your browser. Nothing you enter here is sent anywhere.'],
  ['Can I travel lower-carbon inside Tanzania?', 'Yes. The electric Standard Gauge Railway (SGR) connects Dar es Salaam with Morogoro and Dodoma, and the journey from Dar es Salaam to Dodoma takes about three and a half hours.'],
];
const TIPS = [
  { icon: Plane, t: 'Fly direct when you can', d: 'Take-off and climb use the most fuel, so fewer connections usually means fewer emissions.' },
  { icon: Repeat, t: 'Choose economy', d: 'An economy seat carries a fraction of the footprint of a business or first-class seat.' },
  { icon: CalendarDays, t: 'Stay longer, fly less often', d: 'One longer visit has a lower footprint than several short ones.' },
  { icon: Luggage, t: 'Pack light', d: 'Less weight on board means less fuel burned.' },
  { icon: Train, t: 'Go overland in Tanzania', d: 'Use the electric SGR train between Dar es Salaam, Morogoro and Dodoma instead of a domestic flight.' },
];

export function Calculator() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { lang } = useI18n();
  const [mode, setMode] = useState<'airports' | 'time'>('airports');
  const [isReturn, setReturn] = useState(true);
  const [legs, setLegs] = useState<LegIn[]>([{ from: 'LHR', to: 'DAR' }]);
  const [hours, setHours] = useState(9);
  const [cabin, setCabin] = useState<Cabin>('economy');
  const [pax, setPax] = useState(1);
  const [nonCo2, setNonCo2] = useState(false);
  const [view, setView] = useState<'per' | 'all'>('per');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get('from'), t = q.get('to');
    if (f && t && airportByCode(f) && airportByCode(t)) setLegs([{ from: f, to: t }]);
    const c = q.get('cabin') as Cabin | null; if (c && c in METHOD.cabinMultiplier) setCabin(c);
    const p = Number(q.get('pax')); if (p >= 1 && p <= 9) setPax(p);
    if (q.get('trip') === 'oneway') setReturn(false);
  }, []);

  const validLegs = legs.map((l) => ({ from: airportByCode(l.from), to: airportByCode(l.to) })).filter((l): l is { from: NonNullable<typeof l.from>; to: NonNullable<typeof l.to> } => !!l.from && !!l.to && l.from.code !== l.to.code);
  const result = useMemo(() => {
    if (mode === 'airports') {
      if (!validLegs.length) return null;
      const tr = estimateTrip(validLegs, cabin, pax, isReturn);
      return { per: tr.perPassengerKg, km: tr.km, legs: tr.legs.map((l) => ({ label: `${l.from.code} → ${l.to.code}`, sub: `${l.est.haul.label} · ${fmtInt(l.est.routedKm)} km${l.returnLeg ? ' · return' : ''}`, kg: l.est.perPassengerKg })) };
    }
    const e = fromDistance(hoursToKm(hours), cabin, pax);
    const n = isReturn ? 2 : 1;
    return { per: e.perPassengerKg * n, km: e.routedKm * n, legs: Array.from({ length: n }, (_, i) => ({ label: i ? 'Return flight' : 'Outbound flight', sub: `${e.haul.label} · about ${hours} h · ${fmtInt(e.routedKm)} km`, kg: e.perPassengerKg })) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, JSON.stringify(legs), hours, cabin, pax, isReturn]);

  const mult = nonCo2 ? METHOD.nonCo2Multiplier : 1;
  const perKg = (result?.per ?? 0) * mult;
  const shownKg = view === 'per' ? perKg : perKg * pax;
  const eq = equivalents(perKg);
  const suggestion = suggestedContribution(perKg * pax);
  const maxBar = Math.max(perKg, REF.globalPerCapitaT * 1000);
  const routeLegs = mode === 'airports' ? estimateTrip(validLegs, cabin, pax, isReturn).legs.map((l) => ({ from: l.from, to: l.to, returnLeg: l.returnLeg })) : [];

  const setLeg = (i: number, p: Partial<LegIn>) => setLegs((ls) => ls.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const summary = `My ${isReturn ? 'return' : 'one-way'} trip to Tanzania: about ${fmtT(perKg)} t CO₂e per passenger (estimate, Tanzania Green Journey calculator).`;
  const share = async () => {
    try { if (navigator.share) { await navigator.share({ title: 'My travel footprint', text: summary, url: window.location.href }); return; } await navigator.clipboard.writeText(`${summary} ${window.location.href}`); setMsg('Summary copied'); setTimeout(() => setMsg(''), 1800); } catch {}
  };
  const pdf = async () => {
    const { footprintPdf } = await import('@/lib/pdf');
    await footprintPdf({ summary, perKg, pax, isReturn, cabin: CABINS.find((c) => c.id === cabin)!.label, nonCo2, legs: result?.legs ?? [], eq, suggestion });
  };
  const support = () => {
    const firstTzIntl = validLegs.find((l) => l.to.tanzania && !l.to.domestic)?.to.code ?? 'DAR';
    const origin = validLegs.find((l) => !l.from.tanzania)?.from.code ?? 'LHR';
    const draft = { ...emptyDraft(), airline: 'OTHER', flightNumber: '', from: mode === 'airports' ? origin : 'LHR', to: mode === 'airports' ? firstTzIntl : 'DAR', cabin, passengers: pax, tripType: isReturn ? 'return' : 'oneway', amount: suggestion, fromCalculator: true, calcKgPerPassenger: perKg / mult };
    try { sessionStorage.setItem('tgj-journey', JSON.stringify({ draft, step: 'project' })); recordStart(); } catch {}
    router.push('/journey/#project');
  };

  const seg = (on: boolean) => `focus-ring h-10 flex-1 rounded-md px-3 text-sm font-bold transition-colors ${on ? 'bg-green text-white shadow-[0_2px_0_#06301F]' : 'text-ink hover:bg-green-50'}`;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ---------- inputs ---------- */}
      <section aria-labelledby="calc-in" className="card h-fit min-w-0 p-5 sm:p-6">
        <h2 id="calc-in" className="font-display text-xl font-bold">Your trip</h2>
        <div className="mt-4 flex gap-1 rounded-lg border border-line bg-sand p-1" role="group" aria-label="How do you want to estimate?">
          <button type="button" aria-pressed={mode === 'airports'} className={seg(mode === 'airports')} onClick={() => setMode('airports')}><Plane className="mr-1.5 inline h-4 w-4" aria-hidden="true" />By airports</button>
          <button type="button" aria-pressed={mode === 'time'} className={seg(mode === 'time')} onClick={() => setMode('time')}><Clock className="mr-1.5 inline h-4 w-4" aria-hidden="true" />By flight time</button>
        </div>
        <div className="mt-4 flex gap-1 rounded-lg border border-line bg-white p-1" role="group" aria-label="Trip type">
          <button type="button" aria-pressed={!isReturn} className={seg(!isReturn)} onClick={() => setReturn(false)}>One way</button>
          <button type="button" aria-pressed={isReturn} className={seg(isReturn)} onClick={() => setReturn(true)}><ArrowLeftRight className="mr-1.5 inline h-4 w-4" aria-hidden="true" />Return</button>
        </div>

        {mode === 'airports' ? (
          <div className="mt-5 space-y-3">
            <AnimatePresence initial={false}>
              {legs.map((l, i) => (
                <motion.div key={i} layout initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="rounded-lg border border-line bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label">{legs.length > 1 ? `Flight ${i + 1}` : 'Flight'}</span>
                    {legs.length > 1 && <button type="button" aria-label={`Remove flight ${i + 1}`} onClick={() => setLegs((ls) => ls.filter((_, k) => k !== i))} className="focus-ring rounded p-1 text-muted hover:bg-black/5"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                    <div><label htmlFor={`cf-${i}`} className="sr-only">From</label><AirportCombobox id={`cf-${i}`} airports={AIRPORTS} value={l.from} onChange={(c) => setLeg(i, { from: c })} placeholder="From" compact /></div>
                    <button type="button" aria-label="Swap airports" onClick={() => setLeg(i, { from: l.to, to: l.from })} className="focus-ring mx-auto mt-1 grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-green-50"><ArrowLeftRight className="h-4 w-4" /></button>
                    <div><label htmlFor={`ct-${i}`} className="sr-only">To</label><AirportCombobox id={`ct-${i}`} airports={AIRPORTS} value={l.to} onChange={(c) => setLeg(i, { to: c })} placeholder="To" compact /></div>
                  </div>
                  {l.from && l.to && l.from === l.to && <p className="mt-1 text-xs font-semibold text-[#A3261B]">Choose two different airports.</p>}
                </motion.div>
              ))}
            </AnimatePresence>
            {legs.length < 4 && (
              <Button type="button" variant="ghost" size="sm" iconLeft={<Plus className="h-4 w-4" />} onClick={() => setLegs((ls) => [...ls, { from: ls[ls.length - 1].to, to: '' }])}>Add a connecting flight</Button>
            )}
            <p className="text-xs text-muted">Includes Tanzania’s domestic airports (Arusha, Mwanza, Dodoma, Seronera, Mafia) for safari and island hops.</p>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-muted">Don’t know the airports? Pick a flight length or set the hours.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TIERS.map((tier) => (
                <button key={tier.id} type="button" aria-pressed={hours === tier.hours} onClick={() => setHours(tier.hours)}
                  className={`focus-ring rounded-lg border p-3 text-left transition-all ${hours === tier.hours ? 'border-green bg-green-50 shadow-[0_0_0_1.5px_#0F4D32]' : 'border-line bg-white hover:-translate-y-0.5'}`}>
                  <span className="block text-sm font-bold">{tier.label}</span><span className="block text-xs text-muted">{tier.hint}</span>
                </button>
              ))}
            </div>
            <label htmlFor="hours" className="mt-4 flex justify-between text-sm font-semibold"><span>Flight time, one way</span><span className="num">{hours} h · ≈ {fmtInt(hoursToKm(hours))} km</span></label>
            <input id="hours" type="range" min={1} max={18} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-[#0F4D32]" />
          </div>
        )}

        <fieldset className="mt-5">
          <legend className="text-[13px] font-semibold">Cabin class</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CABINS.map((c) => (
              <label key={c.id} className={`focus-within:ring-2 focus-within:ring-ocean cursor-pointer rounded-md border px-2 py-2.5 text-center text-sm font-semibold transition-colors ${cabin === c.id ? 'border-green bg-green text-white' : 'border-line bg-white hover:border-[#bcb8ac]'}`}>
                <input type="radio" name="cabin" className="sr-only" checked={cabin === c.id} onChange={() => setCabin(c.id)} />{lang === 'sw' ? c.sw : c.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-[13px] font-semibold" id="pax-l">Passengers</span>
          <div className="flex h-11 items-center rounded-md border border-line bg-white" role="group" aria-labelledby="pax-l">
            <button type="button" aria-label="Fewer passengers" disabled={pax <= 1} onClick={() => setPax(pax - 1)} className="focus-ring grid h-full w-11 place-items-center disabled:opacity-30"><Minus className="h-4 w-4" /></button>
            <output aria-live="polite" className="num w-10 text-center text-lg font-bold">{pax}</output>
            <button type="button" aria-label="More passengers" disabled={pax >= 9} onClick={() => setPax(pax + 1)} className="focus-ring grid h-full w-11 place-items-center disabled:opacity-30"><Plus className="h-4 w-4" /></button>
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg bg-sand p-3 text-sm">
          <input type="checkbox" checked={nonCo2} onChange={(e) => setNonCo2(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0F4D32]" />
          <span><strong>Include non-CO₂ effects</strong> <span className="text-muted">(×{METHOD.nonCo2Multiplier} sensitivity for contrails and high-altitude emissions)</span></span>
        </label>
      </section>

      {/* ---------- results ---------- */}
      <section aria-labelledby="calc-out" aria-live="polite" className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-[12px] bg-ink text-white shadow-card">
          <Ribbon height={5} />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="calc-out" className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">Estimated footprint</h2>
              <div className="inline-flex rounded-md bg-white/10 p-0.5 text-xs font-bold" role="group" aria-label="Show">
                <button type="button" aria-pressed={view === 'per'} onClick={() => setView('per')} className={`focus-ring rounded px-2.5 py-1.5 ${view === 'per' ? 'bg-white text-ink' : ''}`}>Per passenger</button>
                <button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')} className={`focus-ring rounded px-2.5 py-1.5 ${view === 'all' ? 'bg-white text-ink' : ''}`}>All {pax}</button>
              </div>
            </div>
            {result ? (
              <>
                <p className="mt-3 flex items-baseline gap-2"><Counter immediate key={`${Math.round(shownKg)}`} value={shownKg / 1000} format={(n) => n.toFixed(2)} className="text-6xl font-bold leading-none sm:text-7xl" /><span className="text-xl font-semibold">t CO₂e</span></p>
                <p className="mt-2 text-sm text-white/80">{isReturn ? 'Return trip' : 'One way'} · {fmtInt(result.km)} km flown (est.) · {CABINS.find((c) => c.id === cabin)?.label}{nonCo2 ? ' · incl. non-CO₂' : ''}</p>
              </>
            ) : <p className="mt-4 text-white/80">Choose your airports to see an estimate.</p>}
          </div>
          {result && mode === 'airports' && <div className="border-t border-white/10 bg-white"><RouteMap legs={routeLegs} className="mx-auto max-w-[520px]" /></div>}
        </div>

        {result && (
          <>
            <div className="card p-5">
              <h3 className="font-display text-lg font-bold">Flight by flight</h3>
              <ul className="mt-3 space-y-3">
                {result.legs.map((l, i) => (
                  <li key={i}>
                    <div className="flex items-baseline justify-between gap-3 text-sm"><span className="num font-bold">{l.label}</span><span className="num font-semibold">{fmtInt(l.kg * mult)} kg</span></div>
                    <p className="text-xs text-muted">{l.sub}</p>
                    <div className="mt-1.5 h-2 rounded-full bg-line"><motion.div className="h-full rounded-full bg-green" initial={reduce ? false : { width: 0 }} animate={{ width: `${(l.kg / Math.max(...result.legs.map((x) => x.kg))) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} /></div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-display text-lg font-bold">Your trip in perspective</h3>
              <p className="mt-1 text-xs text-muted">Per passenger, compared with yearly CO₂ per person</p>
              <div className="mt-4 space-y-3">
                {[
                  { k: 'Your trip', v: perKg, c: '#111111', note: `${fmtT(perKg)} t` },
                  { k: `Average person in Tanzania, one year (${REF.tzYear})`, v: REF.tzPerCapitaT * 1000, c: '#1EB53A', note: `${REF.tzPerCapitaT} t` },
                  { k: `World average person, one year (${REF.globalYear})`, v: REF.globalPerCapitaT * 1000, c: '#0B6E99', note: `${REF.globalPerCapitaT} t` },
                ].map((b, i) => (
                  <div key={b.k}>
                    <div className="mb-1 flex justify-between gap-3 text-xs"><span className="font-semibold">{b.k}</span><span className="num shrink-0 font-bold">{b.note}</span></div>
                    <div className="h-3 rounded-full bg-sand"><motion.div className="h-full rounded-full" style={{ background: b.c }} initial={reduce ? false : { width: 0 }} animate={{ width: `${Math.max(1.5, (b.v / maxBar) * 100)}%` }} transition={{ duration: 0.9, delay: i * 0.1 }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-3"><Leaf className="h-5 w-5 text-green" aria-hidden="true" /><p className="num mt-2 text-2xl font-bold">{nice(eq.tzYears)}</p><p className="text-xs leading-snug text-muted">years of an average Tanzanian’s CO₂</p></div>
                <div className="rounded-lg bg-ocean-100 p-3"><Globe2 className="h-5 w-5 text-ocean" aria-hidden="true" /><p className="num mt-2 text-2xl font-bold">{nice(eq.globalMonths)}</p><p className="text-xs leading-snug text-muted">months of the world-average person’s CO₂</p></div>
                <div className="rounded-lg bg-sand p-3"><Car className="h-5 w-5 text-ink" aria-hidden="true" /><p className="num mt-2 text-2xl font-bold">{fmtInt(eq.carKm)}</p><p className="text-xs leading-snug text-muted">km in an average petrol car (approx.)</p></div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">Per-person figures are fossil CO₂ from the Global Carbon Budget, via Our World in Data and the Global Carbon Project. The car comparison uses an approximate 0.17 kg CO₂e per km.</p>
            </div>

            <div className="overflow-hidden rounded-[12px] bg-green text-white shadow-card">
              <div className="grid gap-0 sm:grid-cols-[1fr_180px]">
                <div className="p-5 sm:p-6">
                  <HandHeart className="h-6 w-6" aria-hidden="true" />
                  <h3 className="mt-2 font-display text-2xl font-bold">Give back to the places you visit</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">Some travellers like to give in proportion to their trip. As a guide, that would be <strong className="num">{fmtUsd(suggestion)}</strong> for {pax > 1 ? `${pax} passengers` : 'you'} (an illustrative US${GUIDE_USD_PER_T} per estimated tonne). Any amount helps, and giving is voluntary.</p>
                  <p className="mt-2 text-xs text-white/75">A conservation contribution, not an offset: it does not cancel your flight’s emissions.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" icon={<ArrowRight className="h-4 w-4" />} onClick={support}>Support a Tanzanian initiative</Button>
                  </div>
                </div>
                <Photo src="/images/mangrove-sm.jpg" alt="Mangrove roots" className="hidden h-full min-h-[200px] sm:block" />
              </div>
              <div className="flex gap-2 overflow-x-auto bg-black/15 px-5 py-3 text-xs">
                {PROJECTS.map((p) => <span key={p.id} className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-semibold">{p.name} · {p.region}</span>)}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" iconLeft={<Share2 className="h-4 w-4" />} onClick={share}>Share my estimate</Button>
              <Button variant="secondary" size="sm" iconLeft={<Download className="h-4 w-4" />} onClick={pdf}>Download summary (PDF)</Button>
              <span aria-live="polite" className="self-center text-xs font-semibold text-green">{msg}</span>
            </div>
          </>
        )}
      </section>

      {/* ---------- reduce + method + faq ---------- */}
      <section aria-labelledby="reduce-h" className="min-w-0 lg:col-span-2">
        <h2 id="reduce-h" className="font-display text-2xl font-bold">Five ways to travel lighter</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TIPS.map((tip) => (
            <div key={tip.t} className="card p-4 transition-transform duration-200 hover:-translate-y-1"><tip.icon className="h-5 w-5 text-green" aria-hidden="true" /><p className="mt-3 font-bold leading-snug">{tip.t}</p><p className="mt-1 text-sm leading-relaxed text-muted">{tip.d}</p></div>
          ))}
        </div>
      </section>
      <section aria-labelledby="method-h" className="card min-w-0 p-5 sm:p-6">
        <h2 id="method-h" className="font-display text-xl font-bold">How the estimate works</h2>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed">
          <li><strong>1.</strong> Great-circle distance between each pair of airports.</li>
          <li><strong>2.</strong> Plus {METHOD.routingUplift * 100}% for indirect routing and holding.</li>
          <li><strong>3.</strong> Multiplied by a factor per passenger-km for the flight length:</li>
        </ol>
        <table className="mt-2 w-full text-sm"><tbody className="divide-y divide-line">
          {HAULS.map((h) => <tr key={h.id}><td className="py-1.5">{h.label} <span className="text-muted">({h.range})</span></td><td className="num py-1.5 text-right font-semibold">{h.factor} kg</td></tr>)}
        </tbody></table>
        <p className="mt-3 text-sm leading-relaxed"><strong>4.</strong> Multiplied by the cabin class: economy ×1, premium economy ×1.6, business ×2.9, first ×4. A return trip repeats every flight.</p>
        <p className="mt-3 flex gap-2 rounded-md bg-[#FFF6CF] p-3 text-xs leading-relaxed text-[#4F4100]"><Info className="h-4 w-4 shrink-0" aria-hidden="true" />Factors are illustrative for this prototype. Real emissions vary with aircraft, load factor and routing.</p>
      </section>
      <section aria-labelledby="faq-h" className="card min-w-0 p-5 sm:p-6">
        <h2 id="faq-h" className="font-display text-xl font-bold">Questions</h2>
        <div className="mt-2 divide-y divide-line">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <h3><button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="focus-ring flex w-full items-center justify-between gap-3 rounded py-3 text-left text-sm font-bold">{q}<ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} aria-hidden="true" /></button></h3>
              <AnimatePresence initial={false}>{openFaq === i && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3 text-sm leading-relaxed text-ink/85">{a}</motion.p>}</AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
