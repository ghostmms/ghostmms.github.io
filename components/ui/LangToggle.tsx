'use client';
import { useI18n, type Lang } from '@/lib/i18n';
export function LangToggle({ light = false }: { light?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const opts: [Lang, string][] = [['en', 'English'], ['sw', 'Kiswahili']];
  return (
    <div role="group" aria-label={t.language} className={`inline-flex rounded-lg p-1 ${light ? 'bg-white/15 backdrop-blur' : 'border border-line bg-white'}`}>
      {opts.map(([id, label]) => (
        <button key={id} type="button" aria-pressed={lang === id} onClick={() => setLang(id)}
          className={`focus-ring h-9 rounded-md px-3 text-[13px] font-semibold transition-colors ${lang === id ? (light ? 'bg-white text-ink' : 'bg-green text-white') : light ? 'text-white hover:bg-white/10' : 'text-ink hover:bg-black/5'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
