import type { Metadata, Viewport } from 'next';
import { Libre_Baskerville, Libre_Franklin } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import './globals.css';

const display = Libre_Baskerville({ subsets: ['latin', 'latin-ext'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap', preload: false });
const sans = Libre_Franklin({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: { default: 'Tanzania Green Journey', template: '%s · Tanzania Green Journey' },
  description: 'Every journey can help protect Tanzania. A design prototype for a proposed national tourism and conservation initiative.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#0F4D32', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">Skip to content</a>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
