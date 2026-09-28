'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/**
 * МЕБЕЛЬНАЯ НАВИГАЦИЯ
 * ===================
 * Переходы между страницами ведут себя как мебель: вглубь (в карточку
 * проекта) страница выдвигается ящиком, между разделами — открывается
 * фасадом на петлях, назад — задвигается обратно.
 *
 * Почему перехват кликов, а не обёртка над каждой ссылкой: ссылок на
 * сайте десятки, и любая забытая выпадала бы из общей механики. Один
 * обработчик на документ покрывает все — включая те, что появятся позже.
 *
 * Механика полностью необязательная: если браузер не умеет переходы
 * представлений (сейчас это Firefox) или человек просил меньше движения,
 * навигация работает как обычно, мгновенно.
 */

type NavKind = 'door' | 'drawer' | 'drawer-back';

/** Вглубь текущего раздела — ящик, в сторону — дверца. */
function kindFor(from: string, to: string): NavKind {
  if (to.startsWith(`${from === '/' ? '' : from}/`)) return 'drawer';
  if (from.startsWith(`${to === '/' ? '' : to}/`)) return 'drawer-back';
  return 'door';
}

export function FurnitureNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const resolveRef = useRef<(() => void) | null>(null);

  // Снимок готов только после того, как новая страница отрисовалась
  useEffect(() => {
    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, [pathname]);

  const navigate = useCallback(
    (href: string, kind: NavKind) => {
      const doc = document as Document & {
        startViewTransition?: (cb: () => Promise<void> | void) => {
          finished: Promise<void>;
        };
      };

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduce || typeof doc.startViewTransition !== 'function') {
        router.push(href);
        return;
      }

      document.documentElement.dataset.nav = kind;

      const transition = doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            router.push(href);
            // Страховка: анимация не должна подвиснуть, если переход
            // почему-то не завершился
            window.setTimeout(() => {
              if (resolveRef.current) {
                resolveRef.current();
                resolveRef.current = null;
              }
            }, 1200);
          }),
      );

      transition.finished.finally(() => {
        delete document.documentElement.dataset.nav;
      });
    },
    [router],
  );

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (anchor.dataset.noTransition !== undefined) return;

      const url = new URL(href, window.location.origin);
      // Якоря внутри той же страницы обрабатывает браузер
      if (url.pathname === window.location.pathname) return;

      event.preventDefault();
      navigate(
        url.pathname + url.search + url.hash,
        kindFor(window.location.pathname, url.pathname),
      );
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return null;
}
