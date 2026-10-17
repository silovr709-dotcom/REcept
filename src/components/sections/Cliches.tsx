import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getVisibleDetails } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';

/**
 * ЧЕГО ВЫ ЗДЕСЬ НЕ НАЙДЁТЕ
 * ========================
 * Блок ломает шаблон буквально: берёт фразы, которые человек уже
 * двадцать раз прочитал на сайтах конкурентов, зачёркивает их и
 * пишет от руки, как есть на самом деле.
 *
 * Это не шутка ради шутки. Посетитель приходит сюда после трёх-четырёх
 * похожих сайтов и читает всё по диагонали, потому что заранее знает
 * текст. Зачёркнутый штамп останавливает взгляд — и следом идёт
 * настоящий ответ. Заодно блок делает то, чего не делает ни один
 * список преимуществ: показывает, где мы слабее остальных, и этим
 * вызывает больше доверия, чем ещё десять иконок с галочками.
 *
 * Правило для правок: в левой колонке — только чужой штамп, в правой —
 * только то, что мы можем подтвердить. Ни одной цифры, которой нет
 * в проверенных данных.
 */

const pairs: { cliche: string; truth: string }[] = [
  {
    cliche: 'Собственное производство',
    truth:
      'Своего цеха у нас нет. Заказ размещаем на производстве и ведём его сами — от чертежа до сборки у вас дома.',
  },
  {
    cliche: 'Индивидуальный подход к каждому клиенту',
    truth: 'На замер приезжаем сами. Оба. Это и есть весь подход.',
  },
  {
    cliche: 'Скидка 50% только сегодня',
    truth:
      'Скидок нет, таймеров тоже. Цена не меняется от того, в какой день вы написали.',
  },
  {
    cliche: 'Более 1000 довольных клиентов',
    truth:
      '34 отзыва на Яндекс Картах. Мы не можем их ни отредактировать, ни удалить — проверьте сами.',
  },
  {
    cliche: 'Кухня вашей мечты',
    truth:
      'Просто кухня, в которой удобно готовить и о которой вы перестаёте думать.',
  },
  {
    cliche: 'Работаем по всей России',
    truth:
      'Тверь и ближайшие окрестности. Дальше мы не можем приехать сами, а значит — не можем отвечать за результат.',
  },
];

export async function Cliches({ tone = 'ink' }: { tone?: 'ink' | 'cream' }) {
  const dark = tone === 'ink';
  /*
    Шесть зачёркнутых фраз подряд — шесть одинаковых прямоугольников
    с текстом, и на тёмном фоне это читается как сплошная стена.
    Две ячейки сетки отдаём фотографиям: они и ломают ритм, и
    показывают то самое «вместо слов» — нашу работу вблизи.
  */
  const details = await getVisibleDetails();
  const shots = details.slice(0, 2);

  return (
    <Section tone={tone} aria-labelledby="cliches-title">
      <div className="container-page">
        <SectionHeading
          tone={dark ? 'light' : 'dark'}
          id="cliches-title"
          eyebrow="Начистоту"
          title="Чего вы здесь не найдёте"
          lead="Вы наверняка уже открыли несколько сайтов кухонь подряд и читаете их по диагонали — потому что текст везде один. Вот фразы, которых у нас не будет, и то, что мы говорим вместо них."
        />

        <ul className="mt-16 grid gap-px bg-current/10 sm:grid-cols-2 lg:mt-24">
          {pairs.map((p, i) => (
            <li key={p.cliche}>
              <Reveal
                delay={Math.min(i, 5) * 40}
                className={`flex h-full flex-col p-8 sm:p-10 lg:p-12 ${
                  dark ? 'bg-ink' : 'bg-cream'
                }`}
              >
                {/* Штамп. Зачёркнут по-настоящему, а не стилизован:
                    для озвучки это тоже должно читаться как «вычеркнуто». */}
                <s
                  className={`font-display text-[1.25rem] leading-snug decoration-2 sm:text-[1.4375rem] ${
                    dark
                      ? 'text-cream/35 decoration-cream/40'
                      : 'text-ink/35 decoration-ink/35'
                  }`}
                >
                  {p.cliche}
                </s>

                {/* Ответ от руки — как будто поверх распечатки */}
                <p
                  className={`mt-5 font-(family-name:--font-hand) text-[1.375rem] leading-[1.35] sm:text-[1.5rem] ${
                    dark ? 'text-cream' : 'text-ink'
                  }`}
                  style={{ transform: 'rotate(-0.5deg)' }}
                >
                  {p.truth}
                </p>
              </Reveal>
            </li>
          ))}

          {shots.map((d) => (
            <li key={d.id} className="relative min-h-56">
              <Image
                src={assetUrl(d.image.src)}
                alt={d.alt}
                fill
                loading="lazy"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
                placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={d.image.blurDataURL || undefined}
                className="object-cover"
              />
              <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-12 text-[0.9375rem] font-medium text-cream">
                {d.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
