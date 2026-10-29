'use client';

import { useState, type ReactNode } from 'react';

/**
 * ДЛИННАЯ ЦИТАТА НА ТЕЛЕФОНЕ
 * ==========================
 * Отзывы приводятся дословно — это принцип, сокращать их мы не будем.
 * Но на экране шириной 390 px отзыв в 500 знаков — это четырнадцать
 * строк подряд, и три таких отзыва превращают раздел в стену текста,
 * которую пролистывают не читая.
 *
 * Поэтому на телефоне цитата сворачивается до семи строк, а рядом
 * стоит честная кнопка. На планшете и десктопе ничего не меняется:
 * и свёртка, и кнопка там отключены через медиазапрос, поэтому
 * разметка остаётся одинаковой, а текст — полным для поисковика.
 */
export function ReadMore({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <blockquote className={`${className} ${open ? '' : 'quote-clamp'}`}>
        {children}
      </blockquote>
      {open ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="quote-more mt-2 inline-flex min-h-11 items-center text-small font-semibold text-gold underline decoration-gold/40 underline-offset-4"
        >
          Читать целиком
        </button>
      )}
    </>
  );
}
