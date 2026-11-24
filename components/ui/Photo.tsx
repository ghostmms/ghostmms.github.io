'use client';
import { useEffect, useRef, useState } from 'react';
export function Photo({ src, alt, className = '', imgClassName = '', cut, credit, priority, position = 'center' }:
  { src: string; alt: string; className?: string; imgClassName?: string; cut?: 'diagonal' | 'soft'; credit?: string; priority?: boolean; position?: string }) {
  const [loaded, setLoaded] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // Images can finish loading before hydration attaches onLoad
  useEffect(() => { if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true); }, [src]);
  return (
    <div className={`relative overflow-hidden bg-[#d9ddd4] ${cut === 'diagonal' ? 'cut-diagonal' : cut === 'soft' ? 'cut-diagonal-soft' : ''} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(true)}
        style={{ objectPosition: position }}
        className={`h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out ${loaded ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0'} ${imgClassName}`} />
      {credit && <span className="absolute bottom-1.5 right-2 max-w-[80%] truncate rounded bg-black/45 px-1.5 py-0.5 text-[9px] text-white/90">{credit}</span>}
    </div>
  );
}
