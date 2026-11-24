'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Car, ChevronDown, Globe2, HandHeart, Leaf } from 'lucide-react';
import { Button } from '../ui/Button';
import { Counter } from '../ui/Counter';
import { RouteMap } from './RouteMap';
import { useI18n } from '@/lib/i18n';
import { airportByCode } from '@/lib/data/airports';
import { CABINS, METHOD, REF, equivalents, type Estimate } from '@/lib/emissions';
import { fmtInt } from '@/lib/format';
import type { StepProps } from './types';

export function StepFootprint({ draft, go, est }: StepProps & { est: Estimate }) {
  const { t, lang } = useI18n();
  const [nonCo2, setNonCo2] = useState(false);
  const from = airportByCode(draft.from)!, to = airportByCode(draft.to)!;
  const per = nonCo2 ? est.withNonCo2PerPassengerKg : est.perPassengerKg;
  const cabin = CABINS.find((c) => c.id === draft.cabin)!;
  return (
    <section aria-labelledby="fp-h">
      <p className="label">{t.steps[2]}</p>
      <h1 id="fp-h" className="mt-1 font-display text-3xl font-bold">{t.footprintTitle}</h1>
      <div className="card mt-5 overflow-hidden">
        <RouteMap from={from} to={to} />
        <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
          <div className="p-4"><p className="text-xs text-muted">{from.city}</p><p className="num text-lg font-bold">{from.code}</p></div>
          <div className="p-4"><p className="text-xs text-muted">{to.city}</p><p className="num text-lg font-bold text-green">{to.code}</p></div>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[10px] bg-ocean text-white shadow-card">
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85">{t.estEmissions}</p>
          <p className="mt-1 flex items-baseline gap-2"><Counter immediate value={per / 1000} format={(n) => n.toFixed(2)} className="text-6xl font-bold leading-none" /><span className="text-lg font-semibold">t CO₂e</span></p>
          <p className="mt-1 text-sm text-white/85">{draft.tripType === 'return' ? (lang === 'sw' ? 'kwa msafiri, kwenda na kurudi' : 'per passenger, return trip') : t.perPassenger} · {lang === 'sw' ? cabin.sw : cabin.label} · {lang === 'sw' ? 'makadirio' : 'estimate'}</p>
          <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" checked={nonCo2} onChange={(e) => setNonCo2(e.target.checked)} className="h-4 w-4 accent-[#FCD116]" />
            {lang === 'sw' ? 'Jumuisha athari zisizo za CO₂ (×1.7)' : 'Include non-CO₂ effects (×1.7 sensitivity)'}
          </label>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/20 border-t border-white/20 text-center">
          <div className="p-3"><p className="text-[11px] text-white/80">{t.distance} {lang === 'sw' ? '(njia)' : '(flown, est.)'}</p><p className="num font-bold"><Counter immediate value={est.routedKm} /> km</p></div>
          <div className="p-3"><p className="text-[11px] text-white/80">{t.passengers}</p><p className="num font-bold">{draft.passengers}</p></div>
          <div className="p-3"><p className="text-[11px] text-white/80">{lang === 'sw' ? 'Jumla' : 'All passengers'}</p><p className="num font-bold">{((per * draft.passengers) / 1000).toFixed(2)} t</p></div>
        </div>
      </div>
      <details className="group card mt-4 px-5 py-4">
        <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded text-sm font-bold">{t.howCalculated}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed">
          <li><strong>1. Distance.</strong> Great-circle distance {from.code}–{to.code}: <span className="num">{fmtInt(est.greatCircleKm)} km</span>.</li>
          <li><strong>2. Routing.</strong> +{METHOD.routingUplift * 100}% for indirect routing and holding: <span className="num">{fmtInt(est.routedKm)} km</span>.</li>
          <li><strong>3. Factor.</strong> {est.baseFactor} kg CO₂e per passenger-km ({est.haul.label.toLowerCase()}) × {METHOD.cabinMultiplier[draft.cabin]} for {cabin.label.toLowerCase()} = <span className="num">{est.factor.toFixed(3)}</span>.</li>
          <li><strong>4. Result.</strong> {draft.calcKgPerPassenger ? <>Calculated flight by flight in the footprint calculator: <span className="num">{fmtInt(est.perPassengerKg)} kg</span> per passenger.</> : <><span className="num">{fmtInt(est.routedKm)} × {est.factor.toFixed(3)} = {fmtInt(est.perPassengerKg)} kg</span> per passenger{draft.tripType === 'return' ? ' (both directions)' : ''}.</>}</li>
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-muted">The structure follows the UK Government greenhouse-gas conversion-factor approach. The base factor is an illustrative demonstration value; non-CO₂ effects are shown only as an optional sensitivity. Real figures vary with aircraft, load factor and routing. {METHOD.version}.</p>
      </details>
      {(() => { const q = equivalents(per); const n = (x: number) => (x >= 100 ? fmtInt(x) : x >= 10 ? x.toFixed(0) : x.toFixed(1)); return (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white p-3 shadow-card"><Leaf className="h-4 w-4 text-green" aria-hidden="true" /><p className="num mt-1.5 text-xl font-bold">{n(q.tzYears)}</p><p className="text-[11px] leading-snug text-muted">{lang === 'sw' ? 'miaka ya CO₂ ya Mtanzania wa kawaida' : 'years of an average Tanzanian’s CO₂'}</p></div>
          <div className="rounded-lg bg-white p-3 shadow-card"><Globe2 className="h-4 w-4 text-ocean" aria-hidden="true" /><p className="num mt-1.5 text-xl font-bold">{n(q.globalMonths)}</p><p className="text-[11px] leading-snug text-muted">{lang === 'sw' ? 'miezi ya wastani wa dunia' : 'months of the world-average person’s CO₂'}</p></div>
          <div className="rounded-lg bg-white p-3 shadow-card"><Car className="h-4 w-4" aria-hidden="true" /><p className="num mt-1.5 text-xl font-bold">{fmtInt(q.carKm)}</p><p className="text-[11px] leading-snug text-muted">{lang === 'sw' ? 'km kwa gari la petroli' : 'km in an average petrol car'}</p></div>
        </div>); })()}
      <p className="mt-2 text-[10px] text-muted">Per-person CO₂: Tanzania {REF.tzPerCapitaT} t ({REF.tzYear}), world {REF.globalPerCapitaT} t ({REF.globalYear}). Global Carbon Budget via Our World in Data.</p>
      <Link href={`/calculator/?from=${draft.from}&to=${draft.to}&cabin=${draft.cabin}&pax=${draft.passengers}&trip=${draft.tripType}`} className="focus-ring mt-3 inline-flex items-center gap-2 rounded text-sm font-bold text-green underline-offset-4 hover:underline"><Calculator className="h-4 w-4" aria-hidden="true" />{lang === 'sw' ? 'Fungua kikokotoo kamili (safari zenye vituo vingi)' : 'Open the full footprint calculator (multi-stop trips, comparisons)'}</Link>
      <p className="mt-4 flex gap-3 rounded-lg border border-green/30 bg-green-50 p-4 text-sm leading-relaxed"><HandHeart className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden="true" />{t.notOffset}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => go('confirm')}>{t.back}</Button>
        <Button full icon={<ArrowRight className="h-5 w-5" />} onClick={() => go('discover')}>{t.discoverTitle}</Button>
      </div>
    </section>
  );
}
