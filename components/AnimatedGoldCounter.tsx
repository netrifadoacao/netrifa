'use client';

import { useEffect, useState, useRef } from 'react';

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function AnimatedGoldCounter({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let rafId: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(t);
      const current = value * eased;
      setDisplay(Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [started, value, duration, decimals]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('pt-BR');

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
