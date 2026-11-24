'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Download, LayoutDashboard, Printer, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Ribbon } from '../ui/Ribbon';
import { QrSvg } from '../ui/QrSvg';
import { useI18n } from '@/lib/i18n';
import { findRecord, type JourneyRecord } from '@/lib/demoStore';
import { projectById } from '@/lib/data/projects';
import { airportByCode } from '@/lib/data/airports';
import { baseUrl } from '@/lib/baseUrl';
import { fmtDate, fmtUsd } from '@/lib/format';
import type { Estimate } from '@/lib/emissions';
import type { StepProps } from './types';

export function StepDone({ draft, est, restart }: StepProps & { est: Estimate | null; restart: () => void }) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const [rec, setRec] = useState<JourneyRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (draft.ref) setRec(findRecord(draft.ref) ?? null); }, [draft.ref]);
  const r: JourneyRecord | null = rec ?? (draft.ref ? {
    ref: draft.ref, createdAt: draft.completedAt ?? new Date().toISOString(), name: draft.name || undefined, airline: draft.airline, flightNumber: draft.flightNumber,
    from: draft.from, to: draft.to, travelDate: draft.travelDate, cabin: draft.cabin, passengers: draft.passengers, kgPerPassenger: est?.perPassengerKg ?? 0,
    projectId: draft.projectId!, amountUsd: draft.amount!, lang,
  } : null);
  if (!r) return null;
  const p = projectById(r.projectId)!;
  const verify = `${baseUrl()}/verify/?ref=${encodeURIComponent(r.ref)}`;
  const share = async () => {
    const text = `I supported ${p.name} in ${p.place} on my Tanzania Green Journey (demonstration).`;
    try {
      if (navigator.share) { await navigator.share({ title: 'Tanzania Green Journey', text, url: `${baseUrl()}/` }); return; }
      await navigator.clipboard.writeText(`${text} ${baseUrl()}/`); setMsg('Copied to clipboard');
    } catch { /* cancelled */ }
  };
  return (
    <section aria-labelledby="done-h">
      <motion.div initial={reduce ? false : { opacity: 0, y: 20, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 900 }}
        className="print-card overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-30px_rgba(15,77,50,.55)]">
        <div className="relative overflow-hidden bg-green px-6 pb-7 pt-6 text-white">
          <div aria-hidden="true" className="absolute -right-[60px] -top-[30px] h-4 w-[200px] rotate-[-32deg] bg-ribbon" />
          <p className="text-[11px] font-bold tracking-[0.12em] text-white/85">TANZANIA GREEN JOURNEY</p>
          <div className="mt-8 flex items-center gap-3">
            <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 16 }} className="grid h-10 w-10 place-items-center rounded-full bg-white text-green"><Check className="h-6 w-6" aria-hidden="true" /></motion.span>
            <h1 id="done-h" className="font-display text-4xl font-bold">{t.thankYou}</h1>
          </div>
          <p className="mt-3 text-[15px] text-white/90">{r.name ? `${r.name}, ${t.ackSub.charAt(0).toLowerCase()}${t.ackSub.slice(1)}` : t.ackSub}</p>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto]">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="col-span-2"><dt className="label">Initiative</dt><dd className="font-display text-lg font-bold">{p.name}</dd><dd className="text-xs text-muted">{p.place}, {p.region}</dd></div>
            <div><dt className="label">Contribution</dt><dd className="num text-2xl font-bold">{fmtUsd(r.amountUsd, r.amountUsd % 1 ? 2 : 0)}</dd><dd className="text-[11px] font-semibold text-[#7a6400]">Simulated</dd></div>
            <div><dt className="label">Date</dt><dd className="font-semibold">{fmtDate(r.createdAt)}</dd></div>
            <div><dt className="label">Journey</dt><dd className="num font-semibold">{r.from} → {r.to}</dd><dd className="text-[11px] text-muted">{airportByCode(r.to)?.city}</dd></div>
            <div><dt className="label">Reference</dt><dd className="num break-all text-xs font-semibold">{r.ref}</dd></div>
          </dl>
          <div className="flex flex-col items-center">
            <div className="relative rounded-lg border border-line p-2">
              <QrSvg value={verify} size={112} label="Demonstration verification code" />
              <span className="absolute inset-x-2 bottom-2 rounded-sm bg-flag-gold py-0.5 text-center text-[10px] font-bold tracking-[0.1em]">DEMO</span>
            </div>
            <p className="mt-1.5 max-w-[130px] text-center text-[10px] leading-tight text-muted">Verification-style code for demonstration only</p>
          </div>
        </div>
        <Ribbon height={5} />
        <p className="bg-sand px-6 py-3 text-[11px] leading-relaxed text-muted">A simulated, voluntary contribution in a design prototype. No money was collected. This is not a receipt or a carbon offset certificate, and impact statements are illustrative.</p>
      </motion.div>
      <div className="no-print mt-6 grid grid-cols-3 gap-2">
        <Button variant="secondary" size="sm" loading={busy} iconLeft={<Download className="h-4 w-4" />} onClick={async () => { setBusy(true); try { const { acknowledgementPdf } = await import('@/lib/pdf'); await acknowledgementPdf(r, verify); } finally { setBusy(false); } }}>PDF</Button>
        <Button variant="secondary" size="sm" iconLeft={<Printer className="h-4 w-4" />} onClick={() => window.print()}>{t.print}</Button>
        <Button variant="secondary" size="sm" iconLeft={<Share2 className="h-4 w-4" />} onClick={share}>{t.share}</Button>
      </div>
      <p aria-live="polite" className="no-print mt-2 h-4 text-center text-xs font-semibold text-green">{msg}</p>
      <div className="no-print mt-3 flex flex-col gap-3 sm:flex-row">
        <Button full iconLeft={<RotateCcw className="h-4 w-4" />} onClick={restart}>{t.again}</Button>
        <Link href="/dashboard/" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold text-green hover:bg-green-50"><LayoutDashboard className="h-4 w-4" aria-hidden="true" />See it on the dashboard</Link>
      </div>
    </section>
  );
}
