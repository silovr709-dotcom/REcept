'use client';

import { useEffect } from 'react';

/**
 * Снимает шторку загрузки.
 * Пользователя не держим: как только страница готова — уходим.
 * Минимальная длительность нужна лишь для того, чтобы анимация
 * не мигнула; при повторном визите и при reduce-motion она почти нулевая.
 */
export function LoaderController() {
  useEffect(() => {
    const el = document.getElementById('recept-loader');
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isShort = document.documentElement.dataset.loader === 'short';
    const minDuration = reduce ? 0 : isShort ? 500 : 1700;

    const start = Number(document.documentElement.dataset.loaderStart) || Date.now();

    const finish = () => {
      el.dataset.state = 'done';
      document.documentElement.removeAttribute('data-loading');
      try {
        sessionStorage.setItem('recept:visited', '1');
      } catch {
        /* приватный режим — не критично */
      }
      window.setTimeout(() => el.remove(), 700);
    };

    const schedule = () => {
      const elapsed = Date.now() - start;
      window.setTimeout(finish, Math.max(0, minDuration - elapsed));
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
      // Страховка на медленных сетях: не держим дольше 3 секунд
      const hardStop = window.setTimeout(finish, 3000);
      return () => window.clearTimeout(hardStop);
    }
  }, []);

  return null;
}
