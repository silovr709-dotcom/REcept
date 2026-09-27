'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * Лёгкое появление при скролле на IntersectionObserver.
 * Никаких анимационных библиотек — меньше JS, быстрее загрузка.
 * Если JS недоступен или пользователь просил меньше движения — контент виден сразу.
 */
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
    if (reduce || typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-revealed', 'true');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute('data-revealed', 'true');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
