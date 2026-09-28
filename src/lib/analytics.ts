/**
 * ЦЕЛИ ДЛЯ АНАЛИТИКИ
 * ==================
 * Тонкая обёртка над Яндекс.Метрикой. Если счётчик не подключён, вызовы
 * просто ничего не делают — код страниц от этого не зависит.
 *
 * Зачем цели: без них нельзя ответить на главный вопрос — какая кнопка
 * и какой блок приносят обращения. Заявка отправляется без перехода на
 * отдельную страницу «спасибо», поэтому считать её можно только событием.
 */

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    __ymId?: number;
  }
}

export type Goal =
  /** Форма успешно отправлена — главная цель сайта */
  | 'lead_sent'
  /** Открыли форму заявки (нажали любую кнопку с призывом) */
  | 'lead_form_open'
  /** Нажали на номер телефона */
  | 'phone_click'
  /** Перешли в мессенджер или соцсеть */
  | 'messenger_click';

export function reachGoal(goal: Goal, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const id = window.__ymId;
  if (!id || typeof window.ym !== 'function') return;
  try {
    window.ym(id, 'reachGoal', goal, params);
  } catch {
    /* аналитика не должна ломать сайт */
  }
}
