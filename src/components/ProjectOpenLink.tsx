'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from 'react';

/**
 * ССЫЛКА НА ПРОЕКТ: КАРТОЧКА ОТКРЫВАЕТСЯ, А НЕ ПЕРЕЛИСТЫВАЕТСЯ
 * ============================================================
 * Две вещи, которых не хватало портфолио.
 *
 * 1. Подпись у курсора. На компьютере человек наводит мышь на фотографию и
 *    не всегда понимает, что это ссылка. Вместо того чтобы писать «подробнее»
 *    на каждой карточке и засорять сетку, подпись едет рядом с курсором —
 *    появляется только тогда, когда она нужна.
 *
 * 2. Открытие. При переходе фотография не исчезает вместе со страницей:
 *    её копия разворачивается вверх экрана и гаснет уже на новой странице.
 *    Получается ощущение, что карточку открыли, а не сменили экран.
 *
 * Всё держится на обычной ссылке: без JavaScript, при «уменьшенной
 * анимации», при клике с Ctrl или средней кнопкой — это просто переход.
 */

const DURATION = 420;
const NAVIGATE_AT = 230;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ProjectOpenLink({
  href,
  className = '',
  label = 'Смотреть проект',
  children,
}: {
  href: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const onMove = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    // Тонкий указатель — значит мышь, а не палец: подпись уместна.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    setCursor({ x: event.clientX - box.left, y: event.clientY - box.top });
  }, []);

  const onLeave = useCallback(() => setCursor(null), []);

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        prefersReducedMotion()
      ) {
        return;
      }

      const image = ref.current?.querySelector('img');
      if (!image) return;

      const from = image.getBoundingClientRect();
      if (from.width < 80 || from.height < 80) return;

      event.preventDefault();
      setCursor(null);

      const clone = image.cloneNode(true) as HTMLImageElement;
      clone.removeAttribute('sizes');
      clone.style.cssText = [
        'position:fixed',
        `left:${from.left}px`,
        `top:${from.top}px`,
        `width:${from.width}px`,
        `height:${from.height}px`,
        'margin:0',
        'object-fit:cover',
        'z-index:70',
        'pointer-events:none',
        'will-change:transform,opacity',
        `transition:left ${DURATION}ms cubic-bezier(0.16,1,0.3,1),` +
          `top ${DURATION}ms cubic-bezier(0.16,1,0.3,1),` +
          `width ${DURATION}ms cubic-bezier(0.16,1,0.3,1),` +
          `height ${DURATION}ms cubic-bezier(0.16,1,0.3,1),` +
          `opacity 220ms ease-out ${DURATION - 40}ms`,
      ].join(';');
      document.body.appendChild(clone);

      // Куда разворачивается: широкая полоса в верхней части экрана —
      // там же, где стоит главный кадр на странице проекта.
      const width = Math.min(window.innerWidth, 1600);
      const left = (window.innerWidth - width) / 2;
      const height = Math.min(window.innerHeight * 0.62, width * 0.5625);

      requestAnimationFrame(() => {
        clone.style.left = `${left}px`;
        clone.style.top = `${Math.max(window.innerHeight * 0.1, 64)}px`;
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.opacity = '0';
      });

      window.setTimeout(() => router.push(href), NAVIGATE_AT);
      window.setTimeout(() => clone.remove(), DURATION + 320);
    },
    [href, router],
  );

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}

      {cursor ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-ink/90 px-3 py-1.5 text-caption font-bold uppercase tracking-[0.16em] text-cream backdrop-blur-sm"
          style={{ left: cursor.x, top: cursor.y }}
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
