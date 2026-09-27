import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { testimonials } from '@/data/content';

/**
 * ОТЗЫВЫ.
 * Архитектура блока готова, но выдуманных отзывов здесь нет и не будет.
 * Пока массив `testimonials` пуст, секция не рендерится вообще —
 * пустой блок с рыбой навредил бы доверию сильнее, чем его отсутствие.
 */
export function Testimonials({ tone = 'bone' }: { tone?: 'cream' | 'bone' }) {
  if (testimonials.length === 0) return null;

  return (
    <Section tone={tone} aria-labelledby="testimonials-title">
      <div className="container-page">
        <SectionHeading
          id="testimonials-title"
          eyebrow="Отзывы"
          title="Что говорят те, у кого уже стоит наша кухня"
        />

        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={`${t.author}-${i}`}>
              <Reveal
                delay={Math.min(i, 3) * 50}
                className={`flex h-full flex-col rounded-lg border border-line p-7 ${
                  tone === 'bone' ? 'bg-cream' : 'bg-bone'
                }`}
              >
                <blockquote className="grow text-[0.9375rem] leading-relaxed text-stone">
                  «{t.text}»
                </blockquote>
                <footer className="mt-6 border-t border-line pt-4">
                  <p className="font-semibold text-ink">{t.author}</p>
                  {t.source ? (
                    t.url ? (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brass underline underline-offset-4"
                      >
                        {t.source}
                      </a>
                    ) : (
                      <p className="text-sm text-stone">{t.source}</p>
                    )
                  ) : null}
                </footer>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
