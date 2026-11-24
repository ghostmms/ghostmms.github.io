import type { Metadata } from 'next';
import { QrLanding } from '@/components/journey/QrLanding';
export const metadata: Metadata = { title: 'Scan to begin' };
export default function Page() { return <QrLanding />; }
