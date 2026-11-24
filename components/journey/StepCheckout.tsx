'use client';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lock, Pencil, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, inputCls } from '../ui/Field';
import { Ribbon } from '../ui/Ribbon';
import { useI18n } from '@/lib/i18n';
import { projectById } from '@/lib/data/projects';
import { airportByCode } from '@/lib/data/airports';
import { airlineByCode } from '@/lib/data/airlines';
import { CABINS, type Estimate } from '@/lib/emissions';
import { addRecord, makeRef } from '@/lib/demoStore';
import { fmtUsd } from '@/lib/format';
import type { StepProps } from './types';

export const COUNTRIES = ['Australia', 'Belgium', 'Canada', 'China', 'Denmark', 'France', 'Germany', 'India', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Netherlands', 'Norway', 'Oman', 'Poland', 'Qatar', 'Rwanda', 'Saudi Arabia', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Tanzania', 'Uganda', 'United Arab Emirates', 'United Kingdom', 'United States', 'Other'];

export function StepDetails({ draft, set, go }: StepProps) {
  const { t, lang } = useI18n();
  const [err, setErr] = useState<{ email?: string; consent?: string }>({});
  const next = () => {
    const e: typeof err = {};
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email)) e.email = 'Enter a valid email address, or leave it empty.';
    if (!draft.consent) e.consent = 'Please confirm to continue.';
    setErr(e);
    if (!Object.keys(e).length) go('review');
  };
  return (
    <section aria-labelledby="det-h">
      <p className="label">{t.steps[4]}</p>
      <h1 id="det-h" className="mt-1 font-display text-3xl font-bold">{t.detailsTitle}</h1>
      <p className="mt-2 text-[15px] text-muted">{t.detailsIntro}</p>
      <div className="mt-6 space-y-5">
        <Field id="name" label={t.name} optional={t.optional}>
          <input id="name" autoComplete="name" className={inputCls()} maxLength={60} value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field id="email" label={t.email} optional={t.optional} error={err.email} hint={lang === 'sw' ? 'Maonyesho: hakuna barua pepe itakayotumwa.' : 'Demonstration: no email is sent and the address is not stored.'}>
          <input id="email" type="email" autoComplete="email" className={inputCls(err.email)} value={draft.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field id="country" label={t.country} optional={t.optional} hint="Used only for anonymous totals on the demonstration dashboard.">
          <select id="country" className={inputCls()} value={draft.country} onChange={(e) => set({ country: e.target.value })}>
            <option value="">Prefer not to say</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <label className={`flex cursor-pointer gap-3 rounded-lg border bg-white p-4 text-sm leading-relaxed ${err.consent ? 'border-[#A3261B]' : 'border-line'}`}>
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#0F4D32]" checked={draft.consent} onChange={(e) => set({ consent: e.target.checked })} aria-describedby={err.consent ? 'consent-err' : undefined} />
          <span>{t.consent}</span>
        </label>
        {err.consent && <p id="consent-err" role="alert" className="-mt-3 text-xs font-semibold text-[#A3261B]">{err.consent}</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => go('amount')}>{t.back}</Button>
        <Button full icon={<ArrowRight className="h-5 w-5" />} onClick={next}>{t.review}</Button>
      </div>
    </section>
  );
}

export function StepReview({ draft, go, est }: StepProps & { est: Estimate | null }) {
  const { t, lang } = useI18n();
  const p = projectById(draft.projectId!)!;
  const from = airportByCode(draft.from), to = airportByCode(draft.to);
  const rows: [string, string, () => void][] = [
    [lang === 'sw' ? 'Mradi' : 'Initiative', `${p.name} · ${p.place}`, () => go('project')],
    [t.amountTitle, fmtUsd(draft.amount!, draft.amount! % 1 ? 2 : 0), () => go('amount')],
    [t.flightTitle, `${draft.flightNumber ? `${airlineByCode(draft.airline)?.name ?? ''} ${draft.flightNumber} · ` : ''}${from?.code} → ${to?.code}${draft.tripType === 'return' ? ' (return)' : ''} · ${CABINS.find((c) => c.id === draft.cabin)?.label}${draft.fromCalculator ? ' · from the footprint calculator' : ''}`, () => go('flight')],
    [lang === 'sw' ? 'Makadirio ya ndege' : 'Flight estimate', est ? `${(est.perPassengerKg / 1000).toFixed(2)} t CO₂e per passenger (estimate)` : '—', () => go('footprint')],
    [lang === 'sw' ? 'Jina' : 'Name', draft.name || '—', () => go('details')],
    [lang === 'sw' ? 'Nchi' : 'Country', draft.country || '—', () => go('details')],
  ];
  return (
    <section aria-labelledby="rev-h">
      <p className="label">{t.steps[4]}</p>
      <h1 id="rev-h" className="mt-1 font-display text-3xl font-bold">{t.reviewTitle}</h1>
      <div className="card mt-5 overflow-hidden">
        <Ribbon height={5} />
        <dl className="divide-y divide-line px-5">
          {rows.map(([k, v, edit]) => (
            <div key={k} className="flex items-start gap-3 py-3.5">
              <dt className="w-28 shrink-0 text-[11px] font-semibold uppercase leading-snug tracking-[0.06em] text-muted">{k}</dt>
              <dd className="min-w-0 flex-1 text-sm font-semibold">{v}</dd>
              <button type="button" onClick={edit} aria-label={`${t.edit}: ${k}`} className="focus-ring rounded p-1 text-green hover:bg-green-50"><Pencil className="h-4 w-4" /></button>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-4 flex gap-3 rounded-lg bg-[#FFF6CF] p-4 text-sm leading-relaxed text-[#4F4100]">
        <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p><strong>Simulated payment.</strong> No card details are requested and no money is collected. Confirming records a demonstration contribution on this device only.</p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => go('details')}>{t.back}</Button>
        <Button full icon={<ShieldCheck className="h-5 w-5" />} onClick={() => go('processing')}>{t.confirmSim}</Button>
      </div>
    </section>
  );
}

export function StepProcessing({ draft, set, go, est }: StepProps & { est: Estimate | null }) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  useEffect(() => {
    const ref = makeRef();
    const createdAt = new Date().toISOString();
    const timer = setTimeout(() => {
      addRecord({
        ref, createdAt, name: draft.name.trim() || undefined, country: draft.country || undefined, airline: draft.airline, flightNumber: draft.flightNumber,
        from: draft.from, to: draft.to, travelDate: draft.travelDate, cabin: draft.cabin, passengers: draft.passengers,
        kgPerPassenger: est?.perPassengerKg ?? 0, projectId: draft.projectId!, amountUsd: draft.amount!, lang,
      });
      set({ ref, completedAt: createdAt });
      go('done');
    }, reduce ? 300 : 1800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section aria-live="polite" className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="relative h-2 w-56 overflow-hidden rounded-full bg-line">
        <motion.div className="absolute inset-y-0 left-0 bg-ribbon" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: reduce ? 0.2 : 1.7, ease: 'easeInOut' }} />
      </div>
      <p className="mt-6 font-display text-xl">{t.processing}</p>
      <p className="mt-2 text-sm text-muted">Simulated · no payment is taken</p>
    </section>
  );
}
