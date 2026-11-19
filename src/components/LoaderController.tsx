'use client';

import { useEffect } from 'react';

/**
 * Снимает шторку загрузки.
 * Пользователя не держим: как только страница готова — уходим.
 * Минимальная длительность даёт киноколлажу успеть перейти из кадров
 * проектов в логотип. При повторном визите версия короче, при
 * reduce-motion — нулевая.
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
     * Первый монтаж длится около 7,15 с, повторный — 4,75 с.
     * Даём кадрам, сборке логотипа и световому проходу завершиться; reduce-motion — мгновенно.
     */
    const minDuration = reduce ? 0 : isShort ? 4750 : 7150;

    // The client animation starts after hydration; time it from here rather
    // than from the head script, or slow hydration could skip the whole reveal.
    const start = Date.now();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      el.dataset.state = 'done';
      el.setAttribute('aria-hidden', 'true');
      el.removeAttribute('role');
      document.documentElement.removeAttribute('data-loading');
      try {
        sessionStorage.setItem('recept:visited:mosaic-v4', '1');
      } catch {
        /* приватный режим — не критично */
      }
    };

    const schedule = () => {
      const elapsed = Date.now() - start;
      window.setTimeout(finish, Math.max(0, minDuration - elapsed));
    };

    // Страховка на медленных сетях: заставка не задержит страницу дольше 8,2 с.
    const hardStop = window.setTimeout(finish, 8200);

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => window.clearTimeout(hardStop);
  }, []);

  return null;
}
