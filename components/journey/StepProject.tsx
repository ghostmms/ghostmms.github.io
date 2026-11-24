'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, MapPin, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Photo } from '../ui/Photo';
import { Field, inputCls } from '../ui/Field';
import { useI18n } from '@/lib/i18n';
import { PROJECTS, SUGGESTED_AMOUNTS, projectById } from '@/lib/data/projects';
import { fmtUsd } from '@/lib/format';
import type { StepProps } from './types';

export function StepProject({ draft, set, go }: StepProps) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const [err, setErr] = useState('');
  return (
    <section aria-labelledby="proj-h">
      <p className="label">{t.steps[4]}</p>
      <h1 id="proj-h" className="mt-1 font-display text-3xl font-bold">{t.supportTitle}</h1>
      <p className="mt-2 text-[15px] text-muted">{t.supportIntro}</p>
      <div role="radiogroup" aria-labelledby="proj-h" className="mt-5 space-y-3">
        {PROJECTS.map((p, i) => {
          const on = draft.projectId === p.id;
          return (
            <motion.label key={p.id} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45 }}
              className={`group relative block cursor-pointer overflow-hidden rounded-[10px] bg-white shadow-card transition-all focus-within:ring-2 focus-within:ring-ocean ${on ? 'ring-2 ring-green' : 'hover:-translate-y-0.5'}`}>
              <input type="radio" name="project" className="sr-only" checked={on} onChange={() => { set({ projectId: p.id }); setErr(''); }} />
              <div className="flex">
                <Photo src={p.image.replace('.jpg', '-sm.jpg')} alt="" className="w-[110px] shrink-0 sm:w-[150px]" imgClassName="transition-transform duration-500 group-hover:scale-105" />
                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-display text-lg font-bold leading-tight">{lang === 'sw' ? p.sw : p.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{p.place} · {p.region}</p></div>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${on ? 'border-green bg-green' : 'border-line'}`}>{on && <Check className="h-4 w-4 text-white" aria-hidden="true" />}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink/85">{lang === 'sw' ? p.summarySw : p.summary}</p>
                  {on && (
                    <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs leading-relaxed">
                      <p className="flex gap-1.5"><Target className="mt-px h-3.5 w-3.5 shrink-0 text-green" aria-hidden="true" /><span><strong>Objective:</strong> {p.objective}</span></p>
                      <p className="text-muted">{p.impact}</p>
                      {p.imageNote && <p className="text-muted">{p.imageNote}</p>}
                    </div>
                  )}
                </div>
              </div>
            </motion.label>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">Demonstration initiatives: no project partner, budget or outcome has been agreed.</p>
      {err && <p role="alert" className="mt-2 text-sm font-semibold text-[#A3261B]">{err}</p>}
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => go('discover')}>{t.back}</Button>
        <Button full icon={<ArrowRight className="h-5 w-5" />} onClick={() => (draft.projectId ? go('amount') : setErr('Choose an initiative to continue.'))}>{t.continue}</Button>
      </div>
    </section>
  );
}

export function StepAmount({ draft, set, go }: StepProps) {
  const { t } = useI18n();
  const p = projectById(draft.projectId!)!;
  const [err, setErr] = useState('');
  const custom = draft.customAmount;
  const amount = custom ? Number(custom) : draft.amount;
  const units = amount ? amount * p.unitsPerUsd : 0;
  const next = () => {
    const a = custom ? Number(custom) : draft.amount;
    if (!a || !Number.isFinite(a) || a < 1 || a > 10000) { setErr('Enter an amount between US$1 and US$10,000.'); return; }
    set({ amount: Math.round(a * 100) / 100 });
    go('details');
  };
  return (
    <section aria-labelledby="amt-h">
      <p className="label">{t.steps[4]}</p>
      <h1 id="amt-h" className="mt-1 font-display text-3xl font-bold">{t.amountTitle}</h1>
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-white p-3 shadow-card">
        <Photo src={p.image.replace('.jpg', '-sm.jpg')} alt="" className="h-14 w-14 shrink-0 rounded" />
        <div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="truncate text-xs text-muted">{p.place} · {p.region}</p></div>
        <button type="button" className="focus-ring rounded text-sm font-bold text-green" onClick={() => go('project')}>{t.edit}</button>
      </div>
      <fieldset className="mt-6">
        <legend className="label mb-2">US$ · voluntary</legend>
        <div className="grid grid-cols-4 gap-2" role="radiogroup">
          {SUGGESTED_AMOUNTS.map((a) => {
            const on = !custom && draft.amount === a;
            return (
              <label key={a} className={`focus-within:ring-2 focus-within:ring-ocean cursor-pointer rounded-md border-[1.5px] py-3 text-center transition-all ${on ? 'border-green bg-green text-white shadow-[0_3px_0_#06301F]' : 'border-line bg-white hover:-translate-y-0.5'}`}>
                <input type="radio" name="amount" className="sr-only" checked={on} onChange={() => { set({ amount: a, customAmount: '' }); setErr(''); }} />
                <span className="num text-lg font-bold">{fmtUsd(a)}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-4">
        <Field id="custom" label={t.customAmount} error={err} optional={t.optional}>
          <input id="custom" inputMode="decimal" className={inputCls(err)} placeholder="e.g. 35" value={custom}
            onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ''); set({ customAmount: v, amount: v ? Number(v) : draft.amount }); setErr(''); }} />
        </Field>
      </div>
      {amount ? (
        <div className="mt-5 rounded-lg border border-green/30 bg-green-50 p-4 text-sm leading-relaxed">
          <p><strong className="num">{fmtUsd(amount, amount % 1 ? 2 : 0)}</strong> to {p.name.toLowerCase()}: illustratively about <strong className="num">{units < 10 ? units.toFixed(1) : Math.round(units)}</strong> {p.unitLabel}.</p>
          <p className="mt-1 text-xs text-muted">{p.impact} Not a verified outcome.</p>
        </div>
      ) : null}
      <p className="mt-4 text-xs leading-relaxed text-muted">{t.notOffset}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={() => go('project')}>{t.back}</Button>
        <Button full disabled={!amount} icon={<ArrowRight className="h-5 w-5" />} onClick={next}>{t.continue}</Button>
      </div>
    </section>
  );
}
