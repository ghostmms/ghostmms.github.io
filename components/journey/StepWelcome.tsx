'use client';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, HandHeart, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { LangToggle } from '../ui/LangToggle';
import { Photo } from '../ui/Photo';
import { Ribbon } from '../ui/Ribbon';
import { useI18n } from '@/lib/i18n';
import type { StepProps } from './types';

export function StepWelcome({ go }: StepProps) {
  const { t, lang } = useI18n();
  const reduce = useReducedMotion();
  const item = (i: number) => ({ initial: reduce ? false : { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] } });
  return (
    <section aria-labelledby="welcome-h" className="flex flex-col">
      <motion.div {...item(0)} className="-mx-4 -mt-6 mb-2 lg:hidden">
        <Photo src="/images/kili.jpg" alt="Mount Kilimanjaro above farmland near Moshi" priority cut="diagonal" className="h-[46vh] min-h-[300px] w-full" position="50% 30%" credit="Erasmus Kamugisha · CC BY-SA 4.0" />
      </motion.div>
      <motion.div {...item(1)}><Ribbon className="w-24" height={5} /></motion.div>
      <motion.h1 {...item(2)} id="welcome-h" className="mt-5 font-display text-[40px] font-bold leading-[1.05] sm:text-5xl">{t.karibu}</motion.h1>
      <motion.p {...item(3)} className="mt-3 font-display text-xl italic text-muted">{t.tagline}</motion.p>
      <motion.p {...item(4)} className="mt-5 text-[16px] leading-relaxed text-ink/85">{t.welcomeIntro}</motion.p>
      <motion.ul {...item(5)} className="mt-6 space-y-3">
        <li className="flex gap-3 rounded-lg bg-white p-4 shadow-card"><HandHeart className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden="true" /><span className="text-sm leading-relaxed">{t.voluntary}</span></li>
        <li className="flex gap-3 rounded-lg bg-white p-4 shadow-card"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ocean" aria-hidden="true" />
          <span className="text-sm leading-relaxed">{lang === 'sw' ? 'Huu ni mfano wa maonyesho: hakuna pesa inayokusanywa na taarifa zako hubaki kwenye kifaa hiki.' : 'This is a demonstration: no money is collected and your details stay on this device.'} <Link href="/privacy/" className="focus-ring rounded font-semibold underline">{t.privacy}</Link></span></li>
      </motion.ul>
      <motion.div {...item(6)} className="mt-7"><p className="label mb-2">{t.language}</p><LangToggle /></motion.div>
      <motion.div {...item(7)} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" full icon={<ArrowRight className="h-5 w-5" />} onClick={() => go('flight')}>{t.begin}</Button>
      </motion.div>
      <motion.div {...item(8)} className="mt-4 text-center sm:text-left">
        <Link href="/discover/" className="focus-ring rounded text-sm font-bold text-green underline-offset-4 hover:underline">{t.exploreFirst}</Link>
        <span className="mx-2 text-muted" aria-hidden="true">·</span>
        <Link href="/calculator/" className="focus-ring rounded text-sm font-bold text-green underline-offset-4 hover:underline">{lang === 'sw' ? 'Kokotoa athari ya safari yako' : 'Calculate your travel footprint'}</Link>
      </motion.div>
    </section>
  );
}
