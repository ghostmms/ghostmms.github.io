import type { ReactNode } from 'react';
export function Field({ id, label, hint, error, optional, children }: { id: string; label: string; hint?: string; error?: string; optional?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between text-[13px] font-semibold text-ink">
        <span>{label}</span>{optional && <span className="text-xs font-normal text-muted">{optional}</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-[#A3261B]">{error}</p>}
    </div>
  );
}
export const inputCls = (err?: string) =>
  `focus-ring h-12 w-full rounded-md border bg-white px-3.5 text-[15px] text-ink placeholder:text-[#8A8B8F] transition-colors ${err ? 'border-[#A3261B]' : 'border-line hover:border-[#bcb8ac]'}`;
