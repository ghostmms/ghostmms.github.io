'use client';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ocean' | 'ghost' | 'dark';
const styles: Record<Variant, string> = {
  primary: 'bg-green text-white [--depth:#06301F] hover:bg-[#125a3b]',
  ocean: 'bg-ocean text-white [--depth:#064863] hover:bg-[#0c7aa9]',
  dark: 'bg-ink text-white [--depth:#000] hover:bg-[#222]',
  secondary: 'bg-white text-ink border-[1.5px] border-ink [--depth:#111]',
  ghost: 'bg-transparent text-ink [--depth:transparent] hover:bg-black/5',
};

type Common = { variant?: Variant; size?: 'md' | 'lg' | 'sm'; full?: boolean; loading?: boolean; icon?: ReactNode; iconLeft?: ReactNode; children: ReactNode; className?: string };

function classes({ variant = 'primary', size = 'md', full, className = '' }: Common) {
  const sz = size === 'lg' ? 'h-14 px-6 text-[15px]' : size === 'sm' ? 'h-10 px-4 text-sm' : 'h-12 px-5 text-[15px]';
  const depth = variant === 'ghost' ? '' : 'shadow-[0_4px_0_var(--depth),0_10px_20px_-12px_rgba(0,0,0,.45)] hover:-translate-y-[1px] hover:shadow-[0_5px_0_var(--depth),0_16px_26px_-14px_rgba(0,0,0,.5)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--depth),0_4px_10px_-8px_rgba(0,0,0,.4)]';
  return `focus-ring relative inline-flex select-none items-center justify-center gap-2.5 rounded-md font-sans font-bold tracking-[0.01em] transition-[transform,box-shadow,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none ${depth} ${styles[variant]} ${sz} ${full ? 'w-full' : ''} ${className}`;
}

export function Button({ variant, size, full, loading, icon, iconLeft, children, className, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} aria-busy={loading || undefined} disabled={rest.disabled || loading} className={classes({ variant, size, full, className, children })}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : iconLeft}
      <span className={full && icon ? 'flex-1 text-left' : ''}>{children}</span>
      {!loading && icon}
    </button>
  );
}

export function ButtonLink({ href, variant, size, full, icon, iconLeft, children, className, external }: Common & { href: string; external?: boolean }) {
  const cls = classes({ variant, size, full, className, children });
  const inner = (<>{iconLeft}<span className={full && icon ? 'flex-1 text-left' : ''}>{children}</span>{icon}</>);
  if (external) return <a href={href} className={cls}>{inner}</a>;
  return <Link href={href} className={cls}>{inner}</Link>;
}
