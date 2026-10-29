'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import { markNotificationsRead } from '@/lib/cabinet/api';
import { formatAgo } from '@/lib/cabinet/format';
import { Action, Panel } from './ui';
import { Logo } from '@/components/Logo';

/**
 * ОБОЛОЧКА КАБИНЕТА
 * =================
 * Своя шапка, без маркетингового меню и заставки: человек пришёл
 * работать с проектом, а не читать про ателье. Ссылка назад на сайт
 * есть всегда, чтобы кабинет не ощущался «другим сайтом».
 */

export function CabinetShell({ children }: { children: ReactNode }) {
  const { status, profile, isStaff, signOut, notifications, unread, markRead } = useCabinet();
  const [bellOpen, setBellOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setBellOpen(false), [pathname]);

  const authed = status === 'ready';

  return (
    <div className="flex min-h-dvh flex-col bg-bone">
      <header className="sticky top-0 z-50 border-b border-line bg-cream/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <Logo />
              <Link
                href="/kabinet"
                className="hidden border-l border-line pl-3 text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone transition-colors hover:text-ink sm:inline"
              >
                Кабинет
              </Link>
            </div>
            {authed && isStaff ? (
              <nav className="hidden items-center gap-4 md:flex" aria-label="Разделы панели">
                <ShellLink href="/kabinet" active={pathname === '/kabinet'}>
                  Мои проекты
                </ShellLink>
                <ShellLink href="/kabinet/admin" active={pathname.startsWith('/kabinet/admin')}>
                  Панель «РЕцепт»
                </ShellLink>
              </nav>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {authed ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setBellOpen((v) => !v);
                    if (!bellOpen && unread) {
                      const ids = notifications.filter((n) => !n.read_at).map((n) => n.id);
                      markRead(ids);
                      void markNotificationsRead(ids).catch(() => undefined);
                    }
                  }}
                  className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-stone"
                  aria-label={unread ? `События: ${unread} новых` : 'События'}
                  aria-expanded={bellOpen}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path
                      d="M9 1.5a4.5 4.5 0 0 0-4.5 4.5v3L3 12h12l-1.5-3V6A4.5 4.5 0 0 0 9 1.5ZM7 14.5a2 2 0 0 0 4 0"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {unread ? (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-caption font-semibold text-cream">
                      {unread}
                    </span>
                  ) : null}
                </button>

                {bellOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] border border-line bg-cream shadow-xl">
                    <p className="border-b border-line px-4 py-3 text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                      События
                    </p>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-ui text-stone">Пока событий нет.</p>
                      ) : (
                        notifications.slice(0, 12).map((n) => (
                          <div key={n.id} className="border-b border-line px-4 py-3 last:border-0">
                            <p className="text-ui leading-snug text-ink">{n.title}</p>
                            {n.body ? (
                              <p className="mt-1 text-small leading-snug text-stone">{n.body}</p>
                            ) : null}
                            <p className="mt-1 text-small text-stone">{formatAgo(n.created_at)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Link
              href="/"
              className="hidden text-small text-stone transition-colors hover:text-ink sm:inline"
            >
              На сайт
            </Link>

            {authed ? (
              <Action size="sm" variant="quiet" onClick={() => void signOut()}>
                Выйти
              </Action>
            ) : null}
          </div>
        </div>

        {authed && isStaff ? (
          <nav className="container-page flex gap-4 border-t border-line py-2 md:hidden" aria-label="Разделы панели">
            <ShellLink href="/kabinet" active={pathname === '/kabinet'}>
              Мои проекты
            </ShellLink>
            <ShellLink href="/kabinet/admin" active={pathname.startsWith('/kabinet/admin')}>
              Панель
            </ShellLink>
          </nav>
        ) : null}
      </header>

      <main className="container-page flex-1 py-8 sm:py-12">{children}</main>

      <footer className="border-t border-line bg-cream">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-small text-stone">
          <p>
            {profile?.email ? `Вы вошли как ${profile.email}` : 'Личный кабинет «РЕцепт»'}
          </p>
          <Link href="/kontakty" className="transition-colors hover:text-ink">
            Связаться с Робертом и Катей
          </Link>
        </div>
      </footer>
    </div>
  );
}

function ShellLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-eyebrow font-semibold uppercase tracking-[0.16em] transition-colors ${
        active ? 'text-ink' : 'text-stone hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}

/** Экран «кабинет ещё не подключён» — честно и без выдуманных данных. */
export function NotConfigured() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <Panel>
        <h1 className="font-display text-head leading-tight text-ink">
          Кабинет ещё не подключён
        </h1>
        <p className="mt-4 text-body leading-relaxed text-stone">
          Личный кабинет работает на отдельной защищённой базе. Пока к сайту не
          подключены её адрес и ключ, кабинет не показывает и не отправляет
          никаких данных — это сделано намеренно.
        </p>
        <p className="mt-4 text-body leading-relaxed text-stone">
          Владельцам: инструкция по подключению лежит в репозитории, файл{' '}
          <code className="bg-sand px-1.5 py-0.5 text-ui text-ink">supabase/README.md</code>.
          Нужно создать проект Supabase, выполнить миграцию и вписать два
          значения в{' '}
          <code className="bg-sand px-1.5 py-0.5 text-ui text-ink">public/kabinet-config.js</code>.
        </p>
        <div className="mt-8">
          <Link
            href="/kontakty"
            className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink underline underline-offset-4"
          >
            Написать нам
          </Link>
        </div>
      </Panel>
    </div>
  );
}
