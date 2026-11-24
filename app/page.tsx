import Link from 'next/link';
import { ArrowRight, Calculator, LayoutDashboard, Map, QrCode } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Ribbon } from '@/components/ui/Ribbon';
import { Photo } from '@/components/ui/Photo';
import { ButtonLink } from '@/components/ui/Button';
import { SiteFooter } from '@/components/SiteFooter';
import { Reveal } from '@/components/ui/Reveal';

const entries = [
  { href: '/qr/', icon: QrCode, title: 'Airport QR entry', body: 'The code a visitor scans on arrival. It opens the journey on their phone.', cta: 'Open QR page' },
  { href: '/journey/', icon: ArrowRight, title: 'Visitor journey', body: 'Welcome, flight details, estimated footprint, discovery, a simulated contribution and an acknowledgement.', cta: 'Start the journey' },
  { href: '/calculator/', icon: Calculator, title: 'Footprint calculator', body: 'Multi-stop and return trips, flight-time estimates, everyday comparisons and ways to travel lighter.', cta: 'Calculate' },
  { href: '/discover/', icon: Map, title: 'Discover Tanzania', body: 'Destinations and conservation stories on an interactive map, with an optional 3D view.', cta: 'Explore' },
  { href: '/dashboard/', icon: LayoutDashboard, title: 'Government dashboard', body: 'National overview of participation, initiatives and simulated contributions.', cta: 'Open dashboard' },
];

export default function Home() {
  return (
    <>
      <header className="no-print absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><Logo /><span className="hidden rounded-full bg-white/90 px-3 py-1 text-xs font-semibold sm:inline">Design prototype · demonstration only</span></div>
      </header>
      <main id="main">
        <section className="relative">
          <Photo src="/images/kili.jpg" alt="Mount Kilimanjaro above farmland near Moshi" priority cut="diagonal" className="h-[68vh] min-h-[460px] w-full" position="50% 35%" credit="Erasmus Kamugisha · CC BY-SA 4.0 · Wikimedia Commons" />
        </section>
        <section className="mx-auto -mt-24 max-w-6xl px-5">
          <Reveal>
            <div className="max-w-2xl rounded-xl bg-ivory/95 p-6 shadow-card backdrop-blur sm:p-8">
              <Ribbon className="w-24" height={5} />
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">Tanzania Green Journey</h1>
              <p className="mt-3 font-display text-xl italic text-muted">Every journey can help protect Tanzania.</p>
              <p className="mt-5 text-[15px] leading-relaxed text-ink/85">A proposed national initiative that links international visitors arriving in Tanzania with voluntary contributions to conservation. This prototype demonstrates the visitor experience and a government overview. All payments and figures are simulated.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/journey/" size="lg" icon={<ArrowRight className="h-5 w-5" />}>Begin the visitor journey</ButtonLink>
                <ButtonLink href="/dashboard/" size="lg" variant="secondary">Government dashboard</ButtonLink>
              </div>
            </div>
          </Reveal>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5" aria-label="Prototype sections">
          {entries.map((e, i) => (
            <Reveal key={e.href} delay={i * 0.07}>
              <Link href={e.href} className="focus-ring group flex h-full flex-col rounded-xl bg-white p-6 shadow-card transition-transform duration-200 hover:-translate-y-1">
                <e.icon className="h-6 w-6 text-green" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl font-bold">{e.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{e.body}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-green">{e.cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>
            </Reveal>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
