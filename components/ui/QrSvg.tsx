'use client';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
export function QrSvg({ value, size = 240, label, className = '', dark = '#111111' }: { value: string; size?: number; label: string; className?: string; dark?: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    if (!value) return;
    QRCode.toString(value, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark, light: '#FFFFFF' } }).then(setSvg).catch(() => setSvg(''));
  }, [value, dark]);
  return (
    <div role="img" aria-label={label} className={`bg-white [&>svg]:h-full [&>svg]:w-full ${className}`} style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }} />
  );
}
