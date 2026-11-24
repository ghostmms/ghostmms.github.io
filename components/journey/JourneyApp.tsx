'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Info } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { LangToggle } from '../ui/LangToggle';
import { Ribbon } from '../ui/Ribbon';
import { Photo } from '../ui/Photo';
import { useI18n } from '@/lib/i18n';
import { recordScan, recordStart } from '@/lib/demoStore';
import { airportByCode } from '@/lib/data/airports';
import { estimate } from '@/lib/emissions';
import { projectById } from '@/lib/data/projects';
import { STAGE_OF, STEP_ORDER, emptyDraft, type Draft, type Step } from './types';
import { StepWelcome } from './StepWelcome';
import { StepFlight, StepConfirm } from './StepFlight';
import { StepFootprint } from './StepFootprint';
import { StepDiscover } from './StepDiscover';
import { StepProject, StepAmount } from './StepProject';
import { StepDetails, StepReview, StepProcessing } from './StepCheckout';
import { StepDone } from './StepDone';

const SIDE: Partial<Record<Step, { src: string; alt: string; credit: string; caption: string }>> = {
  welcome: { src: '/images/kili.jpg', alt: 'Mount Kilimanjaro above farmland near Moshi', credit: 'Erasmus Kamugisha · CC BY-SA 4.0', caption: 'Mount Kilimanjaro from Moshi' },
  flight: { src: '/images/dar.jpg', alt: 'Dar es Salaam skyline from the harbour', credit: 'David Stanley · CC BY 2.0', caption: 'Dar es Salaam harbour' },
  confirm: { src: '/images/dar.jpg', alt: 'Dar es Salaam skyline from the harbour', credit: 'David Stanley · CC BY 2.0', caption: 'Dar es Salaam harbour' },
  footprint: { src: '/images/serengeti.jpg', alt: 'Serengeti plains with an acacia tree', credit: 'Bjørn Christian Tørrissen · CC BY-SA 3.0', caption: 'Serengeti National Park' },
  details: { src: '/images/stonetown.jpg', alt: 'Carved balconies in Stone Town, Zanzibar', credit: 'Diego Delso · CC BY-SA 4.0', caption: 'Stone Town, Zanzibar' },
  review: { src: '/images/stonetown.jpg', alt: 'Carved balconies in Stone Town, Zanzibar', credit: 'Diego Delso · CC BY-SA 4.0', caption: 'Stone Town, Zanzibar' },
};

export function JourneyApp() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState<Step>('welcome');
  const [ready, setReady] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('tgj-journey');
      if (saved) { const s = JSON.parse(saved); if (s.draft) setDraft({ ...emptyDraft(), ...s.draft }); if (s.step && s.step !== 'processing') setStep(s.step); }
      const src = new URLSearchParams(window.location.search).get('src');
      if (src === 'qr' && !sessionStorage.getItem('tgj-scan')) { recordScan(); sessionStorage.setItem('tgj-scan', '1'); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { sessionStorage.setItem('tgj-journey', JSON.stringify({ draft, step })); } catch {} }, [draft, step, ready]);

  const est = useMemo(() => {
    const a = airportByCode(draft.from), b = airportByCode(draft.to);
    if (!a || !b) return null;
    const e = estimate(a, b, draft.cabin, draft.passengers);
    const n = draft.tripType === 'return' ? 2 : 1;
    const per = draft.calcKgPerPassenger ?? e.perPassengerKg * n;
    return { ...e, greatCircleKm: e.greatCircleKm * n, routedKm: e.routedKm * n, perPassengerKg: per, totalKg: per * draft.passengers, withNonCo2PerPassengerKg: per * 1.7 };
  }, [draft.from, draft.to, draft.cabin, draft.passengers, draft.tripType, draft.calcKgPerPassenger]);

  /** Steps that require earlier information fall back to the earliest valid step. */
  const allowed = useCallback((s: Step, d: Draft) => {
    const i = STEP_ORDER.indexOf(s);
    if (i >= STEP_ORDER.indexOf('confirm') && !(d.from && d.to)) return false;
    if (i >= STEP_ORDER.indexOf('amount') && s !== 'done' && !d.projectId) return false;
    if (i >= STEP_ORDER.indexOf('details') && s !== 'done' && !d.amount) return false;
    if (s === 'done' && !d.ref) return false;
    return true;
  }, []);

  const go = useCallback((s: Step) => {
    if (s === 'flight' && step === 'welcome') recordStart();
    setStep(s);
    if (s !== 'processing') window.history.pushState({ step: s }, '', `#${s}`);
    requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); top.current?.focus({ preventScroll: true }); });
  }, [step, reduce]);

  useEffect(() => {
    const onPop = () => {
      const h = window.location.hash.slice(1) as Step;
      setStep((cur) => (STEP_ORDER.includes(h) && h !== 'processing' && allowed(h, draft) ? h : cur === 'done' ? 'done' : 'welcome'));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [allowed, draft]);

  const set = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);
  const restart = useCallback(() => { setDraft(emptyDraft()); try { sessionStorage.removeItem('tgj-journey'); } catch {} go('welcome'); }, [go]);

  const stage = STAGE_OF[step];
  const side = step === 'project' || step === 'amount' || step === 'processing' || step === 'done'
    ? (() => { const p = draft.projectId ? projectById(draft.projectId) : undefined; return p ? { src: p.image, alt: p.name, credit: p.imageCredit, caption: `${p.name} · ${p.place}` } : SIDE.footprint; })()
    : SIDE[step];
  const fullWidth = step === 'discover';

  const body = (() => {
    const props = { draft, set, go };
    switch (step) {
      case 'welcome': return <StepWelcome {...props} />;
      case 'flight': return <StepFlight {...props} />;
      case 'confirm': return <StepConfirm {...props} est={est} />;
      case 'footprint': return est ? <StepFootprint {...props} est={est} /> : <StepFlight {...props} />;
      case 'discover': return <StepDiscover {...props} />;
      case 'project': return <StepProject {...props} />;
      case 'amount': return <StepAmount {...props} />;
      case 'details': return <StepDetails {...props} />;
      case 'review': return <StepReview {...props} est={est} />;
      case 'processing': return <StepProcessing {...props} est={est} />;
      case 'done': return <StepDone {...props} est={est} restart={restart} />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <Ribbon height={4} />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <Logo href="/journey/" />
          <LangToggle />
        </div>
        <nav aria-label="Journey progress" className="mx-auto max-w-6xl px-4 pb-3 sm:px-5">
          <ol className="grid grid-cols-6 gap-1.5">
            {t.steps.map((label, i) => (
              <li key={label} aria-current={i === stage ? 'step' : undefined} className="min-w-0">
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <motion.div className={`h-full ${i <= stage ? 'bg-green' : ''}`} initial={false} animate={{ width: i < stage ? '100%' : i === stage ? '55%' : '0%' }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                </div>
                <span className={`mt-1 hidden truncate text-[11px] font-semibold sm:block ${i === stage ? 'text-ink' : 'text-muted'}`}>{label}</span>
              </li>
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">{`Step ${stage + 1} of 6: ${t.steps[stage]}`}</p>
        </nav>
      </header>
      <div className="no-print bg-[#FFF6CF] px-4 py-1.5 text-center text-[11px] font-semibold text-[#4F4100]"><Info className="mr-1 inline h-3 w-3 -translate-y-px" aria-hidden="true" />{t.demoBanner}</div>
      <main id="main" className={`mx-auto w-full flex-1 ${fullWidth ? 'max-w-6xl' : 'max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12'} px-4 pb-16 pt-6 sm:px-5`}>
        {!fullWidth && side && (
          <aside className="no-print sticky top-[118px] hidden h-[calc(100vh-150px)] max-h-[720px] lg:block" aria-hidden="true">
            <AnimatePresence mode="popLayout">
              <motion.div key={side.src} className="h-full" initial={reduce ? false : { opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
                <Photo src={side.src} alt={side.alt} credit={side.credit} cut="soft" className="h-full w-full rounded-t-xl" />
              </motion.div>
            </AnimatePresence>
            <p className="mt-2 text-xs text-muted">{side.caption}</p>
          </aside>
        )}
        <div ref={top} tabIndex={-1} className="outline-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={reduce ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? undefined : { opacity: 0, x: -24 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              {ready ? body : <div className="h-96 animate-pulse rounded-xl bg-white" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
