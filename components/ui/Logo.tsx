import Link from 'next/link';
export function Logo({ light = false, href = '/' }: { light?: boolean; href?: string }) {
  return (
    <Link href={href} className="focus-ring group inline-flex items-center gap-3 rounded" aria-label="Tanzania Green Journey home">
      <span aria-hidden="true" className="h-8 w-8 shrink-0 overflow-hidden rounded-[4px] bg-ribbon shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg]" />
      <span className={`font-sans text-[12px] font-bold leading-[1.2] tracking-[0.12em] ${light ? 'text-white' : 'text-ink'}`}>TANZANIA<br />GREEN JOURNEY</span>
    </Link>
  );
}
