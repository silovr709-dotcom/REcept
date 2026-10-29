import { KitchenBrief } from '../KitchenBrief';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { MarginNote } from '../ui/MarginNote';
import { RatingBadge } from '../RatingBadge';

/**
 * БЛОК «СОБРАТЬ ЗАДАЧУ».
 *
 * Стоит сразу после разговора о цене — в точке, где у человека
 * уже возник вопрос «а сколько будет у меня». Ответить на него
 * цифрой мы честно не можем, зато можем сделать следующий шаг
 * очень дешёвым: пять вопросов про его кухню вместо формы
 * «имя и телефон» на пустом месте.
 */
export function Brief({
  index,
  tone = 'bone',
  title = 'Соберите свою кухню за пять шагов — посчитаем по вашим размерам',
  lead = 'Это не калькулятор с придуманной ценой: таких цен не бывает. Это бриф. Вы отвечаете на пять коротких вопросов, Роберт считает смету по вашему помещению и объясняет, из чего она сложилась.',
}: {
  index?: string;
  tone?: 'cream' | 'bone' | 'ink';
  title?: string;
  lead?: string;
}) {
  return (
    <Section tone={tone} id="brief" aria-labelledby="brief-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          id="brief-title"
          eyebrow="Расчёт"
          title={title}
          lead={lead}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal>
            <KitchenBrief tone={tone === 'ink' ? 'dark' : 'light'} source="brief" />
          </Reveal>

          <Reveal delay={80} className="lg:pt-6">
            <div className="relative max-w-sm">
              <h3 className="font-display text-h4 text-ink">Что будет дальше</h3>
              <ol className="mt-5 grid gap-5">
                {[
                  [
                    'Посмотрим ответы',
                    'Если чего-то не хватает — спросим в одном сообщении, а не устроим допрос.',
                  ],
                  [
                    'Посчитаем смету',
                    'По вашим размерам и выбранным материалам, с расшифровкой по позициям.',
                  ],
                  [
                    'Решать будете вы',
                    'Ни предоплаты, ни обязательств на этом шаге нет. Можно просто сравнить с другими.',
                  ],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-gold/40 text-small font-semibold text-gold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{t}</span>
                      <span className="mt-1 block text-ui leading-relaxed text-stone">
                        {d}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <RatingBadge />
              </div>

              <MarginNote className="mt-10" author="Роберт">
                Честно: половина расчётов заканчивается ничем. Мы всё равно
                считаем — иначе вам не с чем сравнивать.
              </MarginNote>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
