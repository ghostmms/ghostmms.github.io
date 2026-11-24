export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-GB');
export const fmtUsd = (n: number, digits = 0) => '$' + n.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const fmtUsdShort = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `$${(n / 1e3).toFixed(1)}k` : fmtUsd(n));
export const fmtKg = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(2)} t` : `${Math.round(kg)} kg`);
export const fmtPct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
export const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
