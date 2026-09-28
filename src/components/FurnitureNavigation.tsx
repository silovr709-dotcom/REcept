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
 * ВАЖНО ПРО ФАЗУ ПЕРЕХВАТА.
 * Обработчик обязан стоять именно на перехвате (capture), а не на
 * всплытии. React вешает свои обработчики на корневой контейнер, то есть
 * ниже документа по дереву, — и ссылка Next успевает отменить событие
 * и увести навигацию к себе раньше, чем всплытие дойдёт до документа.
 * На всплытии мы получали уже отменённое событие и ничего не делали.
 *
 * Поэтому: перехватываем клик первыми, гасим его, и навигацию запускаем
 * сами — внутри перехода представлений.
 */

type NavKind = 'door' | 'drawer' | 'drawer-back';

/** Вглубь текущего раздела — ящик, в сторону — дверца. */
function kindFor(from: string, to: string): NavKind {
  const base = from === '/' ? '' : from;
  const target = to === '/' ? '' : to;
  if (to.startsWith(`${base}/`)) return 'drawer';
  if (from.startsWith(`${target}/`)) return 'drawer-back';
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
            }, 1500);
          }),
      );

      transition.finished
        .catch(() => undefined)
        .finally(() => {
          delete document.documentElement.dataset.nav;
        });
    },
    [router],
  );

  useEffect(() => {
    function onClickCapture(event: MouseEvent) {
      if (
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

      // Забираем клик себе: иначе ссылка Next уведёт навигацию мимо анимации
      event.preventDefault();
      event.stopPropagation();

      navigate(
        url.pathname + url.search + url.hash,
        kindFor(window.location.pathname, url.pathname),
      );
    }

    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [navigate]);

  return null;
}
