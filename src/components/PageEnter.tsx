'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Въезд страницы для браузеров без переходов представлений.
 * Там снимка старой страницы нет, «открыть» её как фасад невозможно —
 * но новая всё равно должна появляться движением, а не рывком.
 *
 * Ключ по адресу заставляет React перемонтировать содержимое при
 * переходе, из-за чего анимация запускается заново.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
