import type { Cabin } from '@/lib/emissions';
import type { ProjectId } from '@/lib/data/projects';

export type Step = 'welcome' | 'flight' | 'confirm' | 'footprint' | 'discover' | 'project' | 'amount' | 'details' | 'review' | 'processing' | 'done';
export const STEP_ORDER: Step[] = ['welcome', 'flight', 'confirm', 'footprint', 'discover', 'project', 'amount', 'details', 'review', 'processing', 'done'];
export const STAGE_OF: Record<Step, number> = { welcome: 0, flight: 1, confirm: 1, footprint: 2, discover: 3, project: 4, amount: 4, details: 4, review: 4, processing: 4, done: 5 };

export type Draft = {
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  travelDate: string;
  cabin: Cabin;
  passengers: number;
  tripType: 'oneway' | 'return';
  /** Set when the visitor arrives from the footprint calculator */
  fromCalculator?: boolean;
  calcKgPerPassenger?: number;
  projectId?: ProjectId;
  amount?: number;
  customAmount: string;
  name: string;
  email: string;
  country: string;
  consent: boolean;
  ref?: string;
  completedAt?: string;
};

export const emptyDraft = (): Draft => ({
  airline: '', flightNumber: '', from: '', to: '', travelDate: '', cabin: 'economy', passengers: 1, tripType: 'oneway',
  customAmount: '', name: '', email: '', country: '', consent: false,
});

export type StepProps = { draft: Draft; set: (p: Partial<Draft>) => void; go: (s: Step) => void };
