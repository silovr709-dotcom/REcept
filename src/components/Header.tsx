'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Logo } from './Logo';
import { CtaButton } from './CtaButton';
import { useSite } from './SiteProvider';
import { reachGoal } from '@/lib/analytics';

/*
 * Проверка тёмного первого экрана должна успеть до первой отрисовки:
 * обычный useEffect срабатывает уже после неё, и логотип на мгновение
 * проступал тёмным поверх тёмной фотографии. На сервере слой разметки
 * недоступен, поэтому там остаётся обычный эффект.
 */
const useBeforePaint =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function Header() {
  const { navigation, contacts: activeContacts, primaryPhone } = useSite();
  const hasPhone = Boolean(primaryPhone);
  const phoneDisplay = primaryPhone?.display ?? '';
  const phoneHref = primaryPhone ? `tel:${primaryPhone.raw}` : '';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  /**
   * У шапки два состояния. В прокрученном виде она везде одинаковая —
   * светлая плашка с тёмным текстом. А вот наверху она прозрачная, и
   * тут важно, что под ней: над фотографией логотип, меню и кнопка
   * должны стать светлыми, над кремовой полосой — остаться тёмными.
   *
   * Список страниц мы не ведём: тёмные первые экраны сами помечают
   * себя `data-hero="dark"` (см. Hero и PageHero). Шапка просто
   * смотрит, есть ли такая метка на текущей странице.
   */
  const [darkHero, setDarkHero] = useState(false);
  useBeforePaint(() => {
    setDarkHero(Boolean(document.querySelector('[data-hero="dark"]')));
  }, [pathname]);

  const overPhoto = darkHero && !scrolled && !menuOpen;
  /*
   * В меню — один канал: ВКонтакте. Телефон уже стоит отдельной
   * кнопкой выше, и дублировать его списком не нужно; остальные каналы
   * живут в подвале и на странице контактов. Пять мелких подчёркнутых
   * ссылок в две строки читались как случайно вставленный подвал.
   */
  const menuContacts = activeContacts.filter((c) => c.id === 'vk');


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
          ? 'border-b border-line bg-cream/92 shadow-[0_4px_14px_-10px_color-mix(in_oklab,var(--color-soot)_70%,transparent)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      {/* Направляющая: латунная линия выдвигается вдоль нижней кромки
          шапки по мере прокрутки. Честный индикатор прогресса, сделанный
          как профиль-ручка, а не как полоска загрузки */}
      <span
        aria-hidden="true"
        className={`scroll-rail pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left bg-goldline transition-opacity duration-300 ${
          scrolled && !menuOpen ? 'opacity-70' : 'opacity-0'
        }`}
      />
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <Logo tone={overPhoto ? 'light' : 'dark'} />

          <nav aria-label="Основная навигация" className="hidden lg:block">
            {/* Интервалы и кегль растут вместе с экраном. Раньше меню
                включалось с 1024 px в одном размере, и на ноутбуках
                1280–1366 пункты переносились на вторую строку. */}
            <ul className="flex items-center gap-4 xl:gap-6 2xl:gap-7">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      /* Подчёркивание в один пиксель вместо жирности:
                         текущий раздел виден, но меню остаётся ровным
                         по цвету и весу — как колонтитул, а не как
                         панель кнопок. */
                      className={`relative whitespace-nowrap py-2 text-ui transition-colors xl:text-ui after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                        active
                          ? overPhoto
                            ? 'text-goldsoft after:scale-x-100'
                            : 'text-gold after:scale-x-100'
                          : overPhoto
                            ? 'text-cream/85 hover:text-cream'
                            : 'text-ink/80 hover:text-gold'
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
            {/* Кабинет нужен действующим заказчикам, а не случайному
                посетителю. На широких экранах он стоит в шапке, на
                ноутбуках уходит в меню и подвал — иначе основному меню
                не хватает ширины и оно ломается на две строки. */}
            <Link
              href="/kabinet"
              className={`hidden whitespace-nowrap text-ui font-medium transition-colors 2xl:inline ${
                overPhoto ? 'text-cream/85 hover:text-cream' : 'text-ink/80 hover:text-gold'
              }`}
            >
              Личный кабинет
            </Link>

            {hasPhone ? (
              <a
                href={phoneHref}
                onClick={() => reachGoal('phone_click', { place: 'header' })}
                className={`hidden text-ui font-semibold transition-colors 2xl:inline ${
                  overPhoto
                    ? 'text-cream hover:text-goldsoft'
                    : 'text-ink hover:text-gold'
                }`}
              >
                {phoneDisplay}
              </a>
            ) : null}

            {/*
              ПОЧЕМУ КНОПКИ ОБЁРНУТЫ В SPAN.
              Классы видимости на самой кнопке не работали: у кнопки в
              базовых стилях стоит inline-flex, и он перебивал hidden —
              поэтому на телефоне поверх тёмного первого экрана висела
              кремовая плашка «Рассчитать кухню» в две строки. Теперь
              показом управляет обёртка, а не сама кнопка.

              На телефоне кнопки в шапке нет вовсе: внизу экрана и так
              есть панель с «Рассчитать кухню» и «Позвонить».
            */}
            <span className="hidden sm:block lg:hidden">
              <CtaButton
                source="header"
                variant={overPhoto ? 'light' : 'primary'}
                size="sm"
                className="whitespace-nowrap"
                modalTitle="Рассчитаем вашу кухню"
                modalLead="Оставьте контакт — Роберт или Катя свяжутся, зададут пару вопросов и предложат, с чего начать. Без обязательств."
                submitLabel="Получить расчёт"
              >
                Расчёт
              </CtaButton>
            </span>

            <span className="hidden lg:block">
              <CtaButton
                source="header"
                variant={overPhoto ? 'light' : 'primary'}
                size="md"
                className="whitespace-nowrap"
                modalTitle="Рассчитаем вашу кухню"
                modalLead="Оставьте контакт — Роберт или Катя свяжутся, зададут пару вопросов и предложат, с чего начать. Без обязательств."
                submitLabel="Получить расчёт"
              >
                Рассчитать кухню
              </CtaButton>
            </span>

            {/* Телефон на мобильном. Раньше номер появлялся только с 2xl,
                то есть на телефоне позвонить из шапки было нельзя — приходилось
                открывать меню или долистывать до нижней панели. */}
            {hasPhone ? (
              <a
                href={phoneHref}
                onClick={() => reachGoal('phone_click', { place: 'header-mobile' })}
                aria-label={`Позвонить ${phoneDisplay}`}
                className={`grid size-11 place-items-center rounded-full transition-colors 2xl:hidden ${
                  overPhoto ? 'text-cream hover:bg-cream/10' : 'text-ink hover:bg-ink/5'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6.6 3.5h3l1.5 3.7-2 1.4a12 12 0 0 0 5.3 5.3l1.4-2 3.7 1.5v3a1.6 1.6 0 0 1-1.7 1.6A15.6 15.6 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : null}

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              className={`grid size-11 place-items-center rounded-full transition-colors lg:hidden ${
                overPhoto ? 'text-cream hover:bg-cream/10' : 'text-ink hover:bg-ink/5'
              }`}
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
        /* Панель во весь оставшийся экран: раньше она заканчивалась по
           высоте содержимого и снизу выглядывал кусок страницы — меню
           выглядело незакрытым окном, а не меню. */
        className={`lift-door max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-cream lg:hidden ${
          menuOpen ? 'min-h-[calc(100dvh-4rem)] ' : ''
        }${
          menuOpen ? '' : 'invisible h-0 overflow-hidden border-t-0'
        }`}
      >
        <div className="container-page py-6">
          <ul className="grid gap-1">
            {navigation.map((item, i) => (
              <li
                key={item.href}
                className="drawer-item"
                style={{ '--i': i } as React.CSSProperties}
              >
                {/* Без стрелок: они обещали подменю, которого нет.
                    Вместо них — тонкая золотая черта, которая выезжает
                    слева при нажатии, как направляющая ящика. */}
                <Link
                  href={item.href}
                  className="group/mi relative flex min-h-13 items-center border-b border-line/70 py-3 font-display text-sub text-ink"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-px w-0 bg-goldline transition-[width] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-active/mi:w-full"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-3">
            <CtaButton
              source="mobile-menu"
              variant="gold"
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
                className="flex min-h-13 items-center justify-center border border-ink/25 text-small font-semibold uppercase tracking-[0.13em] text-ink"
              >
                Позвонить {phoneDisplay}
              </a>
            ) : null}

            {/* Кабинет — обычная ссылка, а не серая надпись: раньше он
                выглядел как заголовок раздела, по которому не нажимают. */}
            <Link
              href="/kabinet"
              className="flex min-h-13 items-center justify-center border border-line text-small font-semibold uppercase tracking-[0.13em] text-stone transition-colors hover:border-gold/50 hover:text-gold"
            >
              Личный кабинет
            </Link>
          </div>

          {/* В меню оставлены два контакта из пяти. Остальное —
              работа подвала: мелкие подчёркнутые ссылки в несколько
              строк превращали меню в свалку. */}
          {menuContacts.length > 0 ? (
            <ul className="mt-7 grid gap-3 border-t border-line pt-6">
              {menuContacts.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    className="flex items-baseline justify-between gap-4 text-ui text-stone transition-colors hover:text-gold"
                  >
                    <span className="text-caption font-semibold uppercase tracking-[0.18em] text-clay">
                      {c.label}
                    </span>
                    <span className="font-display text-big text-ink">
                      {c.value}
                    </span>
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
