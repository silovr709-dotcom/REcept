import type { Metadata } from 'next';

/**
 * ВРЕМЕННАЯ СТРАНИЦА ПОДБОРА ШРИФТОВ
 * ==================================
 * Нужна только чтобы посмотреть пары «классическая антиква потолще +
 * тонкий рукописный» на реальных фразах сайта. Каждая пара показана
 * на светлом и на тёмном фоне: на синем любой шрифт выглядит тоньше.
 *
 * Страница закрыта от индексации и удаляется, как только пара выбрана.
 */
export const metadata: Metadata = {
  title: 'Подбор шрифтов',
  robots: { index: false, follow: false },
};

type Pair = {
  id: string;
  name: string;
  note: string;
  display: string;
  displayWeight: number;
  hand: string;
  handSize: string;
};

const pairs: Pair[] = [
  {
    id: 'A',
    name: 'Cormorant Garamond 600 + Caveat',
    note: 'Тот же шрифт, что сейчас, но плотнее. Минимальное изменение: вся вёрстка остаётся на месте.',
    display: "'Cormorant Garamond'",
    displayWeight: 600,
    hand: "'Caveat'",
    handSize: '1.6rem',
  },
  {
    id: 'B',
    name: 'Playfair Display 700 + Marck Script',
    note: 'Высокий контраст штриха, журнальная подача. Заметно тяжелее и современнее.',
    display: "'Playfair Display'",
    displayWeight: 700,
    hand: "'Marck Script'",
    handSize: '1.5rem',
  },
  {
    id: 'C',
    name: 'Prata + Bad Script',
    note: 'Плотная дидона без светлых начертаний. Самый «дорогой глянец», но характер жёсткий.',
    display: "'Prata'",
    displayWeight: 400,
    hand: "'Bad Script'",
    handSize: '1.45rem',
  },
  {
    id: 'D',
    name: 'Lora 700 + Caveat',
    note: 'Книжная антиква с мягкими засечками. Теплее и спокойнее остальных.',
    display: "'Lora'",
    displayWeight: 700,
    hand: "'Caveat'",
    handSize: '1.6rem',
  },
];

function Sample({ pair, dark }: { pair: Pair; dark: boolean }) {
  return (
    <section
      id={`pair-${pair.id}${dark ? '-dark' : ''}`}
      className={dark ? 'bg-ink py-16 text-cream' : 'bg-cream py-16 text-ink'}
    >
      <div className="container-page">
        <p
          className={`text-[0.6875rem] font-semibold uppercase tracking-[0.2em] ${
            dark ? 'text-goldsoft' : 'text-gold'
          }`}
        >
          Вариант {pair.id} · {pair.name}
          {dark ? ' · на синем' : ''}
        </p>

        <h2
          className="mt-7 text-[clamp(2.5rem,1.4rem+4vw,4.5rem)] leading-[1.05]"
          style={{ fontFamily: pair.display, fontWeight: pair.displayWeight }}
        >
          Кухни на заказ{' '}
          <span
            style={{
              fontFamily: pair.display,
              fontStyle: 'italic',
              fontWeight: pair.displayWeight,
              color: dark ? 'var(--color-goldsoft)' : 'var(--color-gold)',
            }}
          >
            в Твери
          </span>
        </h2>

        <p
          className={`mt-6 max-w-xl text-[1.0625rem] leading-relaxed ${
            dark ? 'text-cream/75' : 'text-stone'
          }`}
        >
          Роберт и Катя лично ведут проект — от первого замера до момента,
          когда вы впервые готовите на новой кухне.
        </p>

        <div className="mt-10 grid gap-10 border-t border-goldline/40 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3
              className="text-[1.75rem] leading-tight"
              style={{
                fontFamily: pair.display,
                fontWeight: pair.displayWeight,
              }}
            >
              Прямая кухня в нише с латунью
            </h3>
            <p
              className={`mt-3 text-[0.9375rem] leading-relaxed ${
                dark ? 'text-cream/70' : 'text-stone'
              }`}
            >
              Профиль-ручка идёт по всей длине ящика и заканчивается ровно с
              фасадом. Зацепиться рукавом не за что.
            </p>
            <p
              className={`mt-6 text-[0.8125rem] ${dark ? 'text-cream/60' : 'text-stone'}`}
            >
              Цифры: 595 плёнок · 278 пластиков · 228 ЛДСП · гарантия 24 месяца
            </p>
          </div>

          <div
            className="border-l border-goldline/40 pl-7"
            style={{
              fontFamily: pair.hand,
              fontSize: pair.handSize,
              lineHeight: 1.45,
            }}
          >
            <p className={dark ? 'text-cream/85' : 'text-ink/80'}>
              Сейчас у вас наверняка открыты ещё две-три вкладки с кухнями. Это
              правильно. Только сравнивайте одно и то же: материалы, фурнитуру
              и то, кто приедет собирать.
            </p>
            <p
              className={`mt-3 text-[0.9em] ${dark ? 'text-goldsoft' : 'text-gold'}`}
            >
              — Катя
            </p>
          </div>
        </div>

        <p
          className={`mt-8 max-w-2xl text-[0.8125rem] leading-relaxed ${
            dark ? 'text-cream/55' : 'text-stone'
          }`}
        >
          {pair.note}
        </p>
      </div>
    </section>
  );
}

export default function FontsPage() {
  return (
    <main>
      <section className="bg-bone py-14">
        <div className="container-page">
          <h1 className="font-display-light text-[2.5rem] text-ink">
            Подбор шрифтов
          </h1>
          <p className="mt-4 max-w-2xl text-stone">
            Одни и те же фразы сайта в четырёх парах «классическая антиква
            потолще + тонкий рукописный». Каждая пара показана на светлом и на
            тёмном фоне — на синем шрифт всегда выглядит тоньше.
          </p>
          <p className="mt-3 text-[0.8125rem] text-stone">
            Страница временная и закрыта от поисковиков.
          </p>
        </div>
      </section>
      {pairs.map((pair) => (
        <div key={pair.id}>
          <Sample pair={pair} dark={false} />
          <Sample pair={pair} dark />
        </div>
      ))}
    </main>
  );
}
