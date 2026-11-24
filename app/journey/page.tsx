import type { Metadata } from 'next';
import { JourneyApp } from '@/components/journey/JourneyApp';
export const metadata: Metadata = { title: 'Visitor journey' };
export default function Page() { return <JourneyApp />; }
