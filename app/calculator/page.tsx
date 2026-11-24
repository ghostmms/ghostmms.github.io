import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';
import { LangToggle } from '@/components/ui/LangToggle';
import { Ribbon } from '@/components/ui/Ribbon';
import { Photo } from '@/components/ui/Photo';
import { SiteFooter } from '@/components/SiteFooter';
import { Calculator } from '@/components/calculator/Calculator';
export const metadata: Metadata = { title: 'Travel footprint calculator' };
export default function Page() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur"><Ribbon height={4} /><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3"><Logo /><LangToggle /></div></header>
      <main id="main">
        <section className="relative">
          <Photo src="/images/serengeti.jpg" alt="Serengeti plains with an acacia tree" cut="diagonal" priority className="h-[440px] w-full sm:h-[360px]" position="50% 45%" credit="Bjørn Christian Tørrissen · CC BY-SA 3.0" />
          <div className="absolute inset-x-0 top-0 mx-auto max-w-6xl px-4 pt-6 sm:px-5 sm:pt-10">
            <div className="max-w-xl rounded-xl bg-ivory/95 p-6 shadow-card backdrop-blur">
              <Ribbon className="w-20" height={4} />
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Your travel footprint</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/85">See the estimated climate impact of your flights to Tanzania, flight by flight, and what it means in everyday terms. Transparent method, no offset claims.</p>
            </div>
          </div>
        </section>
        <div className="mx-auto -mt-10 max-w-6xl px-4 pb-16 sm:px-5"><Calculator /></div>
      </main>
      <SiteFooter />
    </>
  );
}
