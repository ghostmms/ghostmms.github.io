'use client';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
export function Counter({ value, format = (n: number) => Math.round(n).toLocaleString('en-GB'), duration = 1.2, className = '', immediate = false }: { value: number; format?: (n: number) => string; duration?: number; className?: string; immediate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0); // same on server and client; effect below sets the real value
  const prev = useRef(0);
  useEffect(() => {
    if (!inView && !immediate) return;
    if (reduce) { setShown(value); return; }
    const c = animate(prev.current, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: setShown });
    prev.current = value;
    return () => c.stop();
  }, [inView, immediate, value, duration, reduce]);
  return <span ref={ref} className={`num ${className}`}>{format(shown)}</span>;
}
