'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ЦИФРА, КОТОРАЯ НАБИРАЕТСЯ
 * =========================
 * Число доезжает до своего значения, когда блок появляется на экране.
 * Приём работает только там, где цифра честная и крупная: 595 плёнок,
 * 278 пластиков, 228 декоров ЛДСП. Человек видит не «много вариантов»,
 * а как счётчик добирается до конкретной величины.
 *
 * Важное: в разметке сразу стоит конечное значение. Без JavaScript, в
 * поиске и при включённом «меньше движения» на странице просто стоит
 * число — ничего не пропадает.
 */
export function CountUp({
  value,
  duration = 1100,
  className = '',
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let raf = 0;
    let started = false;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          io.disconnect();

          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // Замедление к концу: счётчик «доводится», а не тормозит резко
            const eased = 1 - Math.pow(1 - t, 3);
            setShown(Math.round(value * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          setShown(0);
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
