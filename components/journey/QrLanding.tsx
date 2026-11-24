'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Copy, Printer, Smartphone, TriangleAlert } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Ribbon } from '../ui/Ribbon';
import { QrSvg } from '../ui/QrSvg';
import { Button, ButtonLink } from '../ui/Button';
import { LangToggle } from '../ui/LangToggle';
import { Photo } from '../ui/Photo';
import { SiteFooter } from '../SiteFooter';
import { useI18n } from '@/lib/i18n';
import { baseUrl, isLocalOrigin } from '@/lib/baseUrl';

export function QrLanding() {
  const { lang } = useI18n();
  const [url, setUrl] = useState('');
  const [local, setLocal] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setUrl(`${baseUrl()}/journey/?src=qr`); setLocal(isLocalOrigin()); }, []);
  const sw = lang === 'sw';
  return (
    <>
      <header className="no-print border-b border-line bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><Logo /><LangToggle /></div></header>
      <main id="main" className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div className="order-2 min-w-0 lg:order-1">
          <Ribbon className="w-24" height={5} />
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{sw ? 'Karibu Tanzania.' : 'Welcome to Tanzania.'}</h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink/80">{sw ? 'Changanua msimbo kwa kamera ya simu yako ili kuanza Tanzania Green Journey. Kushiriki ni kwa hiari.' : 'Scan the code with your phone camera to begin the Tanzania Green Journey. Taking part is voluntary and takes about three minutes.'}</p>
          <ol className="mt-6 space-y-3 text-[15px]">
            {(sw ? ['Fungua kamera ya simu', 'Elekeza kwenye msimbo', 'Gusa kiungo kinachoonekana'] : ['Open your phone camera', 'Point it at the code', 'Tap the link that appears']).map((s, i) => (
              <li key={s} className="flex items-center gap-3"><span className="num grid h-7 w-7 place-items-center rounded-full bg-green text-xs font-bold text-white">{i + 1}</span>{s}</li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3 no-print">
            <ButtonLink href="/journey/?src=manual" size="lg" icon={<ArrowRight className="h-5 w-5" />}>{sw ? 'Fungua kwenye kifaa hiki' : 'Open on this device'}</ButtonLink>
            <Button variant="secondary" size="lg" iconLeft={<Printer className="h-5 w-5" />} onClick={() => window.print()}>{sw ? 'Chapisha bango' : 'Print airport poster'}</Button>
          </div>
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-card">
            <Ribbon height={8} />
            <Photo src="/images/serengeti-sm.jpg" alt="Serengeti plains with an acacia tree" className="h-28 w-full" cut="soft" />
            <div className="flex flex-col items-center px-8 pb-8 pt-2">
              <p className="label">{sw ? 'Changanua ili kuanza' : 'Scan to begin'}</p>
              <div className="mt-4 rounded-xl border border-line p-3">{url && <QrSvg value={url} size={232} label={`QR code that opens ${url}`} />}</div>
              <p className="mt-4 font-display text-lg italic">Every journey can help protect Tanzania.</p>
              <div className="mt-4 flex w-full items-center gap-2 rounded-md bg-sand px-3 py-2 text-xs no-print">
                <Smartphone className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <code className="min-w-0 flex-1 truncate" title={url}>{url}</code>
                <button type="button" className="focus-ring rounded p-1 hover:bg-black/5" aria-label="Copy journey link"
                  onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {} }}>
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p aria-live="polite" className="mt-1 h-4 text-xs font-semibold text-green">{copied ? 'Link copied' : ''}</p>
            </div>
          </div>
          {local && (
            <p className="no-print mx-auto mt-4 flex max-w-sm gap-2 rounded-md bg-[#FFF6CF] p-3 text-xs text-[#4F4100]">
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              This page is open on localhost, so a phone cannot reach the address in the code. Open this page using your computer’s network address (for example http://192.168.x.x:3000/qr/) or set NEXT_PUBLIC_BASE_URL.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
