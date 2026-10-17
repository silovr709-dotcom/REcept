'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * Лёгкое появление при скролле.
 * Никаких анимационных библиотек — один общий IntersectionObserver на всю
 * страницу вместо десятков отдельных. Меньше JS, меньше работы в main thread.
 *
 * Если пользователь просил меньше движения или JS недоступен — контент
 * показывается сразу.
 */
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).setAttribute('data-revealed', 'true');
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
  }
  return observer;
}

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div' as ElementType,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = reduce ? null : getObserver();

    if (!io) {
      el.setAttribute('data-revealed', 'true');
      return;
    }

    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={
        delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined
      }
      className={className}
    >
      {children}
    </Tag>
  );
}
