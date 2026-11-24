import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { Ribbon } from '@/components/ui/Ribbon';
import { SiteFooter } from '@/components/SiteFooter';
export const metadata: Metadata = { title: 'Privacy notice' };
const items: [string, string][] = [
  ['What this is', 'Tanzania Green Journey is a design prototype for a proposed national initiative. It is not an operational government service.'],
  ['What we ask for', 'Flight details (to show an estimate), your choice of initiative and amount, and optionally a name and country. We never ask for card details, passport numbers or other identification.'],
  ['Where it is stored', 'Everything you enter stays in this browser (local and session storage). Nothing is sent to a server, and email addresses are never stored.'],
  ['Payments', 'All contributions are simulated. No payment provider is connected and no money is collected.'],
  ['The dashboard', 'The government dashboard shows simulated, aggregated demonstration data. Journeys completed on this device appear only in this browser and without names or email addresses.'],
  ['Tracking', 'The prototype uses no analytics, advertising or third-party trackers.'],
  ['Removing your data', 'Use “Reset demo data” on the dashboard, or clear this site’s data in your browser settings.'],
];
export default function Privacy() {
  return (
    <>
      <header className="border-b border-line bg-white"><div className="mx-auto max-w-3xl px-5 py-4"><Logo /></div></header>
      <main id="main" className="mx-auto max-w-3xl px-5 py-12">
        <Ribbon className="w-20" height={5} />
        <h1 className="mt-4 font-display text-4xl font-bold">Privacy notice</h1>
        <p className="mt-3 text-muted">Plain-language summary for the demonstration prototype.</p>
        <dl className="mt-8 divide-y divide-line rounded-xl bg-white px-6 shadow-card">
          {items.map(([k, v]) => <div key={k} className="grid gap-1 py-5 sm:grid-cols-[180px_1fr]"><dt className="font-bold">{k}</dt><dd className="text-[15px] leading-relaxed text-ink/85">{v}</dd></div>)}
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
