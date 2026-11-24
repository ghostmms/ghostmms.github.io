import { Info } from 'lucide-react';
export function DemoBadge({ children = 'Illustrative demonstration data', tone = 'gold', className = '' }: { children?: React.ReactNode; tone?: 'gold' | 'dark' | 'light'; className?: string }) {
  const t = tone === 'gold' ? 'bg-[#FFF6CF] text-[#4F4100]' : tone === 'dark' ? 'bg-white/10 text-white' : 'bg-white text-ink border border-line';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${t} ${className}`}>
      <Info className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
