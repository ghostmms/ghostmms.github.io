'use client';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { DiscoverExperience } from '../discover/DiscoverExperience';
import { useI18n } from '@/lib/i18n';
import type { ProjectId } from '@/lib/data/projects';
import type { StepProps } from './types';

export function StepDiscover({ set, go }: StepProps) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="disc-h">
      <div className="mb-5 max-w-2xl"><p className="label">{t.steps[3]}</p><h1 id="disc-h" className="mt-1 font-display text-3xl font-bold">{t.discoverTitle}</h1><p className="mt-2 text-muted">{t.discoverIntro}</p></div>
      <DiscoverExperience onSupport={(id) => { set({ projectId: id as ProjectId }); go('amount'); }} />
      <div className="mt-6 flex max-w-xl gap-3">
        <Button variant="secondary" onClick={() => go('footprint')}>{t.back}</Button>
        <Button full icon={<ArrowRight className="h-5 w-5" />} onClick={() => go('project')}>{t.supportTitle}</Button>
      </div>
    </section>
  );
}
