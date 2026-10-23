'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteView } from '@/lib/content/view';

/**
 * Настройки сайта для клиентских компонентов.
 * Шапка, мобильная панель и форма заявки живут на клиенте, но данные о
 * контактах приходят из админки — то есть с сервера. Контекст передаёт их
 * один раз из корневого layout, без пробрасывания пропсов через полстраницы.
 */
const SiteContext = createContext<SiteView | null>(null);

export function SiteProvider({
  value,
  children,
}: {
  value: SiteView;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteView {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite нужно вызывать внутри SiteProvider');
  }
  return ctx;
}
