'use client';

import { useEffect } from 'react';

/**
 * Снимает шторку загрузки.
 * Пользователя не держим: как только страница готова — уходим.
 * Минимальная длительность равна длине сборки фасада: показать её
 * наполовину хуже, чем не показывать вовсе. При повторном визите она
 * вдвое короче, при reduce-motion — нулевая.
 */
export function LoaderController() {
  useEffect(() => {
    // Сообщаем CSS, что React ожил: отключаются страховочные анимации
    document.documentElement.dataset.hydrated = 'true';

    const el = document.getElementById('recept-loader');
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isShort = document.documentElement.dataset.loader === 'short';
    /*
     * Сборка фасада идёт до 2,4 с, и обрывать её на середине нельзя —
     * половина впечатления в том, что рейка дорисовывается до конца.
     * Повторный визит укорочен вдвое, «меньше движения» — мгновенно.
     */
    const minDuration = reduce ? 0 : isShort ? 1150 : 2400;

    const start = Number(document.documentElement.dataset.loaderStart) || Date.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      el.dataset.state = 'done';
      el.setAttribute('aria-hidden', 'true');
      el.removeAttribute('role');
      document.documentElement.removeAttribute('data-loading');
      try {
        sessionStorage.setItem('recept:visited', '1');
      } catch {
        /* приватный режим — не критично */
      }
    };

    const schedule = () => {
      const elapsed = Date.now() - start;
      window.setTimeout(finish, Math.max(0, minDuration - elapsed));
    };

    // Страховка на медленных сетях: дольше четырёх с половиной секунд
    // не держим никого, даже если страница ещё не догрузилась
    const hardStop = window.setTimeout(finish, 4500);

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => window.clearTimeout(hardStop);
  }, []);

  return null;
}
