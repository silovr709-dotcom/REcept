'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ОГЛАВЛЕНИЕ РАЗДЕЛА
 * ==================
 *
 * Зачем. Страницы вроде «Материалов» честно длинные: фасады, выбор,
 * фурнитура, фрезеровки, столешницы, бюджет. Листать их сверху вниз,
 * чтобы найти каталог фрезеровок, — работа, которую мы перекладывали
 * на человека. Теперь под шапкой едет узкая направляющая со списком
 * того, что есть на странице: видно сразу всё содержание и можно
 * прыгнуть в нужное место одним касанием.
 *
 * Как сделано. Это не «липкое меню» в привычном смысле, а профиль-
 * ручка: тонкая полоса цвета корпуса с латунной чертой под активным
 * пунктом. Полоса встаёт под шапку, когда до неё долистали, и дальше
 * едет вместе со страницей. На телефоне список прокручивается вбок,
 * активный пункт сам подъезжает в видимую часть.
 *
 * Отступ при переходе по якорю. В странице уже задан
 * `scroll-padding-top` под высоту шапки; когда на экране есть ещё и
 * эта полоса, запас нужен больше — компонент увеличивает его, пока
 * живёт на странице, и возвращает прежний при уходе.
 */
export function SectionNav({
  items,
  label = 'Разделы страницы',
}: {
  items: { id: string; label: string }[];
  label?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const railRef = useRef<HTMLUListElement>(null);

  /* Запас прокрутки под шапку и саму полосу */
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.scrollPaddingTop;
    root.style.scrollPaddingTop = '8.75rem';
    return () => {
      root.style.scrollPaddingTop = before;
    };
  }, []);

  /* Какой раздел сейчас перед глазами */
  useEffect(() => {
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    const pick = () => {
      /* Активен последний раздел, который начался выше линии взгляда.
         Линия — чуть ниже шапки с полосой, иначе подсветка перескакивает
         на следующий пункт раньше, чем до него доходит страница. */
      const line = 170;
      let current = nodes[0];
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= line) current = n;
      }
      /* У самого низа страницы последний раздел может так и не дойти
         до линии — показываем его, когда дальше скроллить некуда */
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      setActive(atBottom ? nodes[nodes.length - 1].id : current.id);
    };

    pick();
    window.addEventListener('scroll', pick, { passive: true });
    window.addEventListener('resize', pick);
    return () => {
      window.removeEventListener('scroll', pick);
      window.removeEventListener('resize', pick);
    };
  }, [items]);

  /* Активный пункт подъезжает в видимую часть горизонтального списка */
  useEffect(() => {
    if (!active || !railRef.current) return;
    const el = railRef.current.querySelector<HTMLElement>(
      `[data-id="${active}"]`,
    );
    if (!el) return;
    const rail = railRef.current;
    const left = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-80 border-b border-line bg-cream/94 backdrop-blur-xl lg:top-20"
    >
      {/* Латунная черта по верхней кромке: полоса читается как торец
          ящика, выехавшего из-под шапки */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-goldline/35"
      />
      <div className="container-page">
        <ul
          ref={railRef}
          className="-mx-(--spacing-gutter) flex snap-x gap-1 overflow-x-auto px-(--spacing-gutter) [scrollbar-width:none] lg:mx-0 lg:gap-2 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const on = active === item.id;
            return (
              <li key={item.id} className="shrink-0 snap-start">
                <a
                  href={`#${item.id}`}
                  data-id={item.id}
                  aria-current={on ? 'true' : undefined}
                  className={`relative flex min-h-12 items-center whitespace-nowrap px-2 text-small transition-colors lg:px-3 ${
                    on ? 'text-ink' : 'text-stone hover:text-gold'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-2 bottom-0 h-px origin-left bg-gold transition-transform duration-300 lg:inset-x-3 ${
                      on ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
