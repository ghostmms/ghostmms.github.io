'use client';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LangToggle } from '@/components/ui/LangToggle';
import { Ribbon } from '@/components/ui/Ribbon';
import { ButtonLink } from '@/components/ui/Button';
import { DiscoverExperience } from '@/components/discover/DiscoverExperience';
import { SiteFooter } from '@/components/SiteFooter';
import { useI18n } from '@/lib/i18n';

export default function DiscoverPage() {
  const { t } = useI18n();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur"><Ribbon height={4} /><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3"><Logo /><LangToggle /></div></header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl"><p className="label">Discover</p><h1 className="mt-1 font-display text-4xl font-bold">{t.discoverTitle}</h1><p className="mt-2 text-muted">{t.discoverIntro} Select a place on the map or in the list. Switch to 3D for a model of Tanzania.</p></div>
          <ButtonLink href="/journey/" icon={<ArrowRight className="h-5 w-5" />}>{t.begin}</ButtonLink>
        </div>
        <DiscoverExperience default3D />
      </main>
      <SiteFooter />
    </>
  );
}
