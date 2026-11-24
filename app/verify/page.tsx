'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, SearchX } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Ribbon } from '@/components/ui/Ribbon';
import { SiteFooter } from '@/components/SiteFooter';
import { findRecord, type JourneyRecord } from '@/lib/demoStore';
import { projectById } from '@/lib/data/projects';
import { fmtDate, fmtUsd } from '@/lib/format';

export default function VerifyPage() {
  const [ref, setRef] = useState('');
  const [rec, setRec] = useState<JourneyRecord | null | undefined>(undefined);
  useEffect(() => { const r = new URLSearchParams(window.location.search).get('ref') ?? ''; setRef(r); setRec(r ? findRecord(r) ?? null : null); }, []);
  return (
    <>
      <header className="border-b border-line bg-white"><div className="mx-auto max-w-3xl px-5 py-4"><Logo /></div></header>
      <main id="main" className="mx-auto max-w-xl px-5 py-12">
        <Ribbon className="w-20" height={5} />
        <h1 className="mt-4 font-display text-3xl font-bold">Demonstration record check</h1>
        <p className="mt-2 text-sm text-muted">This page shows how a verification code could work. Demonstration records exist only in the browser that created them; nothing is checked against an official system.</p>
        {rec === undefined ? null : rec ? (
          <div className="card mt-6 p-5">
            <p className="flex items-center gap-2 font-bold text-green"><CheckCircle2 className="h-5 w-5" aria-hidden="true" />Demonstration record found on this device</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="label">Reference</dt><dd className="num break-all font-semibold">{rec.ref}</dd></div>
              <div><dt className="label">Date</dt><dd className="font-semibold">{fmtDate(rec.createdAt)}</dd></div>
              <div><dt className="label">Initiative</dt><dd className="font-semibold">{projectById(rec.projectId)?.name}</dd></div>
              <div><dt className="label">Simulated amount</dt><dd className="num font-semibold">{fmtUsd(rec.amountUsd)}</dd></div>
            </dl>
          </div>
        ) : (
          <div className="card mt-6 p-5">
            <p className="flex items-center gap-2 font-bold"><SearchX className="h-5 w-5" aria-hidden="true" />No demonstration record found{ref ? ` for ${ref}` : ''}</p>
            <p className="mt-2 text-sm text-muted">Open this link on the device that completed the journey, or start a new journey.</p>
          </div>
        )}
        <Link href="/journey/" className="focus-ring mt-6 inline-block rounded font-bold text-green underline">Start a journey</Link>
      </main>
      <SiteFooter />
    </>
  );
}
