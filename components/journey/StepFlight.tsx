'use client';
import { useRef, useState } from 'react';
import { ArrowRight, Calculator, Minus, Pencil, Plane, Plus, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, inputCls } from '../ui/Field';
import { AirportCombobox } from '../ui/AirportCombobox';
import { useI18n } from '@/lib/i18n';
import { AIRLINES, airlineByCode } from '@/lib/data/airlines';
import { ORIGIN_AIRPORTS, TZ_AIRPORTS, airportByCode } from '@/lib/data/airports';
import { CABINS, type Estimate } from '@/lib/emissions';
import { fmtInt } from '@/lib/format';
import type { Draft, StepProps } from './types';

type Errors = Partial<Record<'airline' | 'flightNumber' | 'from' | 'to' | 'travelDate' | 'passengers', string>>;
const today = () => new Date().toISOString().slice(0, 10);

function validate(d: Draft): Errors {
  const e: Errors = {};
  if (!d.airline) e.airline = 'Choose an airline.';
  if (!/^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/i.test(d.flightNumber.trim())) e.flightNumber = 'Enter a flight number such as KL 569 or TC 101.';
  if (!d.from) e.from = 'Choose the airport you departed from.';
  if (!d.to) e.to = 'Choose your arrival airport in Tanzania.';
  if (!d.travelDate) e.travelDate = 'Enter your travel date.';
  else {
    const t = new Date(d.travelDate).getTime(), now = Date.now();
    if (t < now - 90 * 864e5 || t > now + 365 * 864e5) e.travelDate = 'Use a date within the last 90 days or the next year.';
  }
  if (d.passengers < 1 || d.passengers > 9) e.passengers = 'Between 1 and 9 passengers.';
  return e;
}

export function StepFlight({ draft, set, go }: StepProps) {
  const { t, lang } = useI18n();
  const [errors, setErrors] = useState<Errors>({});
  const form = useRef<HTMLFormElement>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(draft);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { form.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus(); return; }
    go('confirm');
  };
  const sample = () => { set({ airline: 'OTHER', flightNumber: 'XY 1234', from: 'LHR', to: 'DAR', travelDate: today(), cabin: 'economy', passengers: 1, tripType: 'oneway', calcKgPerPassenger: undefined }); setErrors({}); };
  return (
    <section aria-labelledby="flight-h">
      <div className="flex items-start justify-between gap-4">
        <div><p className="label">{t.steps[1]}</p><h1 id="flight-h" className="mt-1 font-display text-3xl font-bold">{t.flightTitle}</h1></div>
        <Button type="button" variant="ghost" size="sm" iconLeft={<Wand2 className="h-4 w-4" />} onClick={sample}>{lang === 'sw' ? 'Mfano' : 'Sample'}</Button>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.flightIntro}</p>
      <form ref={form} noValidate onSubmit={submit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-airline" label={t.airline} error={errors.airline} hint="Sample list · no airline integration">
            <select id="f-airline" className={inputCls(errors.airline)} value={draft.airline} aria-invalid={!!errors.airline}
              onChange={(e) => set({ airline: e.target.value })}>
              <option value="">Select…</option>
              {AIRLINES.map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
            </select>
          </Field>
          <Field id="f-flightNumber" label={t.flightNumber} error={errors.flightNumber}>
            <input id="f-flightNumber" className={`${inputCls(errors.flightNumber)} uppercase placeholder:normal-case`} inputMode="text" autoComplete="off" placeholder="e.g. KL 569"
              value={draft.flightNumber} aria-invalid={!!errors.flightNumber} onChange={(e) => set({ flightNumber: e.target.value.toUpperCase().slice(0, 8) })} />
          </Field>
        </div>
        <Field id="f-from" label={t.from} error={errors.from}>
          <AirportCombobox id="f-from" airports={ORIGIN_AIRPORTS} value={draft.from} onChange={(c) => set({ from: c, calcKgPerPassenger: undefined })} placeholder={t.searchAirport} error={errors.from} />
        </Field>
        <fieldset>
          <legend className="text-[13px] font-semibold">{t.to}</legend>
          <div id="f-to" tabIndex={-1} className="mt-1.5 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-invalid={!!errors.to}>
            {TZ_AIRPORTS.map((a) => {
              const on = draft.to === a.code;
              return (
                <label key={a.code} className={`focus-within:ring-2 focus-within:ring-ocean relative cursor-pointer rounded-md border bg-white p-3 transition-all ${on ? 'border-green shadow-[0_0_0_1.5px_#0F4D32]' : 'border-line hover:border-[#bcb8ac]'}`}>
                  <input type="radio" name="to" value={a.code} checked={on} onChange={() => set({ to: a.code, calcKgPerPassenger: undefined })} className="sr-only" />
                  <span className="num block text-xl font-bold">{a.code}</span>
                  <span className="block text-xs font-semibold">{a.city}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted">{a.name}</span>
                </label>
              );
            })}
          </div>
          {errors.to && <p role="alert" className="mt-1.5 text-xs font-semibold text-[#A3261B]">{errors.to}</p>}
          {draft.to && <p className="mt-2 text-xs text-muted">{airportByCode(draft.to)?.note}</p>}
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="f-travelDate" label={t.date} error={errors.travelDate}>
            <input id="f-travelDate" type="date" className={inputCls(errors.travelDate)} value={draft.travelDate} aria-invalid={!!errors.travelDate} onChange={(e) => set({ travelDate: e.target.value })} />
          </Field>
          <Field id="f-passengers" label={t.passengers} error={errors.passengers}>
            <div className="flex h-12 items-center rounded-md border border-line bg-white">
              <button type="button" aria-label="Fewer passengers" className="focus-ring grid h-full w-12 place-items-center disabled:opacity-30" disabled={draft.passengers <= 1} onClick={() => set({ passengers: draft.passengers - 1 })}><Minus className="h-4 w-4" /></button>
              <output id="f-passengers" aria-live="polite" className="num flex-1 text-center text-lg font-bold">{draft.passengers}</output>
              <button type="button" aria-label="More passengers" className="focus-ring grid h-full w-12 place-items-center disabled:opacity-30" disabled={draft.passengers >= 9} onClick={() => set({ passengers: draft.passengers + 1 })}><Plus className="h-4 w-4" /></button>
            </div>
          </Field>
        </div>
        <fieldset>
          <legend className="text-[13px] font-semibold">{lang === 'sw' ? 'Aina ya safari' : 'Trip type'}</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2" role="radiogroup">
            {([['oneway', lang === 'sw' ? 'Njia moja' : 'One way'], ['return', lang === 'sw' ? 'Kwenda na kurudi' : 'Return']] as const).map(([id, label]) => (
              <label key={id} className={`focus-within:ring-2 focus-within:ring-ocean cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${draft.tripType === id ? 'border-green bg-green text-white' : 'border-line bg-white hover:border-[#bcb8ac]'}`}>
                <input type="radio" name="trip" className="sr-only" checked={draft.tripType === id} onChange={() => set({ tripType: id, calcKgPerPassenger: undefined })} />{label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-[13px] font-semibold">{t.cabin}</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
            {CABINS.map((c) => (
              <label key={c.id} className={`focus-within:ring-2 focus-within:ring-ocean cursor-pointer rounded-md border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${draft.cabin === c.id ? 'border-green bg-green text-white' : 'border-line bg-white hover:border-[#bcb8ac]'}`}>
                <input type="radio" name="cabin" className="sr-only" checked={draft.cabin === c.id} onChange={() => set({ cabin: c.id, calcKgPerPassenger: undefined })} />{lang === 'sw' ? c.sw : c.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => go('welcome')}>{t.back}</Button>
          <Button type="submit" full icon={<ArrowRight className="h-5 w-5" />}>{t.continue}</Button>
        </div>
      </form>
    </section>
  );
}

export function StepConfirm({ draft, go, est }: StepProps & { est: Estimate | null }) {
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const from = airportByCode(draft.from), to = airportByCode(draft.to);
  const rows: [string, string][] = [
    [t.airline, airlineByCode(draft.airline)?.name ?? '—'],
    [t.flightNumber, draft.flightNumber],
    [t.from, from ? `${from.city} (${from.code})` : '—'],
    [t.to, to ? `${to.city} (${to.code})` : '—'],
    [t.date, draft.travelDate ? new Date(draft.travelDate).toLocaleDateString(lang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
    [t.cabin, CABINS.find((c) => c.id === draft.cabin)?.[lang === 'sw' ? 'sw' : 'label'] ?? ''],
    [t.passengers, String(draft.passengers)],
    [lang === 'sw' ? 'Aina ya safari' : 'Trip type', draft.tripType === 'return' ? (lang === 'sw' ? 'Kwenda na kurudi' : 'Return') : (lang === 'sw' ? 'Njia moja' : 'One way')],
  ];
  return (
    <section aria-labelledby="confirm-h">
      <p className="label">{t.steps[1]}</p>
      <h1 id="confirm-h" className="mt-1 font-display text-3xl font-bold">{t.confirmTitle}</h1>
      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
          <span className="num text-3xl font-bold">{from?.code}</span>
          <span className="flex flex-1 items-center gap-2 px-4"><span className="h-px flex-1 bg-white/40" /><Plane className="h-5 w-5" aria-hidden="true" /><span className="h-px flex-1 bg-white/40" /></span>
          <span className="num text-3xl font-bold">{to?.code}</span>
        </div>
        <dl className="divide-y divide-line px-5">
          {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
        </dl>
        {est && <p className="border-t border-line bg-sand px-5 py-3 text-xs text-muted">Great-circle distance {fmtInt(est.greatCircleKm)} km. The estimate on the next screen explains every assumption.</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" iconLeft={<Pencil className="h-4 w-4" />} onClick={() => go('flight')}>{t.edit}</Button>
        <Button full loading={busy} icon={<Calculator className="h-5 w-5" />} onClick={() => { setBusy(true); setTimeout(() => go('footprint'), 700); }}>{t.confirmCalc}</Button>
      </div>
    </section>
  );
}
