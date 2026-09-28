'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { CtaButton } from './CtaButton';
import { useSite } from './SiteProvider';
import { reachGoal } from '@/lib/analytics';

export function Header() {
  const { navigation, contacts: activeContacts, primaryPhone } = useSite();
  const hasPhone = Boolean(primaryPhone);
  const phoneDisplay = primaryPhone?.display ?? '';
  const phoneHref = primaryPhone ? `tel:${primaryPhone.raw}` : '';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-90 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled || menuOpen
          ? 'worktop bg-cream/95 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <Logo />

          <nav aria-label="Основная навигация" className="hidden lg:block">
            <ul className="flex items-center gap-5 xl:gap-7">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative py-2 text-[0.9375rem] font-medium transition-colors hover:text-brass ${
                        active ? 'text-brass' : 'text-ink/80'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {hasPhone ? (
              <a
                href={phoneHref}
                onClick={() => reachGoal('phone_click', { place: 'header' })}
                className="hidden text-[0.9375rem] font-semibold text-ink transition-colors hover:text-brass 2xl:inline"
              >
                {phoneDisplay}
              </a>
            ) : null}

            <CtaButton
              source="header"
              variant="primary"
              size="md"
              className="hidden sm:inline-flex"
              modalTitle="Рассчитаем вашу кухню"
              modalLead="Оставьте контакт — Роберт или Катя свяжутся, зададут пару вопросов и предложат, с чего начать. Без обязательств."
              submitLabel="Получить расчёт"
            >
              Рассчитать кухню
            </CtaButton>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 7h18M3 12h18M3 17h18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {/* Подъёмный фасад: меню откидывается от верхней кромки */}
      <div
        id="mobile-menu"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        className={`lift-door max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-cream lg:hidden ${
          menuOpen ? '' : 'invisible h-0 overflow-hidden border-t-0'
        }`}
      >
        <div className="container-page py-6">
          <ul className="grid gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-13 items-center justify-between border-b border-line/70 py-3 text-[1.125rem] font-medium text-ink"
                >
                  {item.label}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="text-stone"
                  >
                    <path
                      d="M5.5 3 10.5 8l-5 5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-3">
            <CtaButton
              source="mobile-menu"
              variant="brass"
              size="lg"
              className="w-full"
              modalTitle="Рассчитаем вашу кухню"
              submitLabel="Получить расчёт"
              withArrow
            >
              Рассчитать кухню
            </CtaButton>

            {hasPhone ? (
              <a
                href={phoneHref}
                className="flex min-h-13 items-center justify-center border border-ink/25 text-[0.75rem] font-semibold uppercase tracking-[0.13em] text-ink"
              >
                Позвонить {phoneDisplay}
              </a>
            ) : null}
          </div>

          {activeContacts.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone">
              {activeContacts.map((c) => (
                <li key={c.id}>
                  <a href={c.href} className="underline decoration-brass/40 underline-offset-4">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
}
