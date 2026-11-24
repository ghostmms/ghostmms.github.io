import Link from 'next/link';
import { Ribbon } from './ui/Ribbon';
export function SiteFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`no-print ${dark ? 'bg-ink text-white/80' : 'bg-white text-muted'} text-xs`}>
      <Ribbon height={4} />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <p>Tanzania Green Journey · design prototype. No government endorsement, partnership or official mark is implied. Payments are simulated.</p>
        <nav aria-label="Footer" className="flex gap-4 font-semibold">
          <Link className="focus-ring rounded hover:underline" href="/privacy/">Privacy</Link>
          <Link className="focus-ring rounded hover:underline" href="/qr/">QR entry</Link>
          <Link className="focus-ring rounded hover:underline" href="/calculator/">Footprint calculator</Link>
          <Link className="focus-ring rounded hover:underline" href="/dashboard/">Dashboard</Link>
        </nav>
      </div>
    </footer>
  );
}
