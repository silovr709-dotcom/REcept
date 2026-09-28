import Link from 'next/link';
import { RatingBadge } from '../RatingBadge';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getVisibleReviews } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

/**
 * ОТЗЫВЫ.
 * Это не «отзывы с нашего сайта», которые можно написать самим, а цитаты
 * из карточки организации на Яндекс Картах. У каждого есть автор, дата
 * и ссылка на первоисточник — любой может открыть и сверить.
 */
export async function Testimonials({
  index,
  tone = 'bone',
  limit = 3,
}: {
  index?: string;
  tone?: 'cream' | 'bone';
  limit?: number;
}) {
  const [{ rating, items: all }, site] = await Promise.all([
    getVisibleReviews(),
    getSiteView(),
  ]);
  if (all.length === 0 || !site.yandex) return null;
  const items = all.slice(0, limit);
  const yandex = site.yandex;

  return (
    <Section tone={tone} aria-labelledby="testimonials-title">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index={index}
            id="testimonials-title"
            eyebrow="Отзывы"
            title={`${rating.value} из 5 на Яндекс Картах`}
            lead={`${rating.reviewsCount} отзыва и ${rating.scoresCount} оценки в карточке организации. Мы не можем ни отредактировать их, ни удалить — поэтому им и стоит верить больше, чем тексту на сайте.`}
          />
          <RatingBadge className="shrink-0" />
        </div>

        <ul className="mt-12 grid gap-6 lg:mt-14 lg:grid-cols-3">
          {items.map((t, i) => (
            <li key={`${t.author ?? 'anon'}-${i}`}>
              <Reveal
                delay={Math.min(i, 3) * 60}
                className="flex h-full flex-col border-t border-line pt-7"
              >
                <p className="font-display text-[1.0625rem] leading-snug text-ink">
                  {t.highlight}
                </p>
                <div className="my-4" />
                <blockquote className="grow text-[0.9375rem] leading-relaxed text-stone">
                  {t.text}
                </blockquote>
                <footer className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <p className="font-semibold text-ink">
                    {t.author ?? 'Без подписи'}
                  </p>
                  <p className="shrink-0 text-sm text-stone">{t.date}</p>
                </footer>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone">
            Цитаты приведены дословно, сокращения отмечены многоточием.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/otzyvy"
              className="link-sweep font-semibold text-brass"
            >
              Все отзывы на сайте
            </Link>
            <a
              href={yandex.reviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-sweep font-semibold text-ink"
            >
              Проверить на Яндекс Картах
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
