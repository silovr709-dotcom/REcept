import type { Metadata } from 'next';
import Link from 'next/link';
import { adminIsConfigured, isAuthed } from '@/lib/admin/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { LoginScreen } from '@/components/admin/LoginScreen';
import { logoutAction } from './actions';

export const metadata: Metadata = {
  title: 'Управление сайтом',
  robots: { index: false, follow: false },
};

/**
 * Админку нельзя отдавать из кэша: страницы зависят от куки входа
 * и должны собираться на каждый запрос.
 */
export const dynamic = 'force-dynamic';

/**
 * Оболочка админки.
 * Публичной шапки, заставки и мобильной панели здесь нет — это рабочий
 * инструмент, а не витрина. Проверка входа стоит на уровне layout,
 * плюс каждое действие проверяет доступ ещё раз самостоятельно.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configured = adminIsConfigured();
  const authed = configured ? await isAuthed() : false;

  // Пока не вошли — никакого содержимого админки не отдаём вовсе
  if (!authed) {
    return <LoginScreen configured={configured} />;
  }

  return (
    <div className="min-h-dvh bg-bone">
      <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-[1.25rem] text-ink">
              <span className="text-brass">РЕ</span>цепт
            </span>
            <span className="hidden text-eyebrow font-bold uppercase text-stone sm:inline">
              Управление сайтом
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40"
            >
              Открыть сайт
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-medium text-stone transition-colors hover:bg-ink/5 hover:text-ink"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <AdminNav />
        <main className="min-w-0 flex-1 pb-20">{children}</main>
      </div>
    </div>
  );
}
