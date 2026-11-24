/** Base URL encoded in QR codes. Set NEXT_PUBLIC_BASE_URL for deployment; otherwise the current origin is used. */
export function baseUrl() {
  const env = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
export const isLocalOrigin = () => typeof window !== 'undefined' && /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.hostname) && !process.env.NEXT_PUBLIC_BASE_URL;
