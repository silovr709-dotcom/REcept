import Link from 'next/link';
import { RatingBadge } from '../RatingBadge';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { MarginNote } from '../ui/MarginNote';
import { getVisibleProjects, getVisibleReviews } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';
import Image from 'next/image';
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
  photoIndex = 3,
}: {
  index?: string;
  tone?: 'cream' | 'bone';
  limit?: number;
  /** Какой проект поставить в фотоколонку: на разных страницах разный */
  photoIndex?: number;
}) {
  const [{ rating, items: all }, site, projects] = await Promise.all([
    getVisibleReviews(),
    getSiteView(),
    getVisibleProjects(),
  ]);
  if (all.length === 0 || !site.yandex) return null;
  const items = all.slice(0, limit);
  const yandex = site.yandex;
  /*
    Три колонки чужого текста подряд читаются как стена. Четвёртая
    колонка — работа, подписанная своим названием: это кадр проекта,
    а не «фотография к отзыву». Связывать конкретный отзыв с
    конкретной кухней мы не вправе — люди не давали на это согласия.
  */
  const sideShot = projects[photoIndex % Math.max(projects.length, 1)] ?? null;

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

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-8">
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

          {sideShot ? (
            <li className="max-sm:order-first">
              <Reveal
                delay={Math.min(items.length, 3) * 60}
                className="h-full"
              >
                <Link
                  href={`/portfolio/${sideShot.slug}`}
                  className="group relative block h-full min-h-72 overflow-hidden bg-sand"
                >
                  <Image
                    src={assetUrl(sideShot.image.src)}
                    alt={sideShot.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    placeholder={
                      sideShot.image.blurDataURL ? 'blur' : 'empty'
                    }
                    blurDataURL={sideShot.image.blurDataURL || undefined}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-16">
                    <span className="block text-[0.9375rem] font-medium text-cream">
                      {sideShot.title}
                    </span>
                    <span className="label-xs mt-1.5 block text-cream/60">
                      Смотреть проект
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          ) : null}
        </ul>

        {/* Блок состоит из трёх колонок чужого текста — без живого голоса
            он читается как витрина отобранных похвал. Пометка от руки
            сразу называет это подозрение вслух */}
        <div className="mt-12 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <MarginNote author="Катя">
            Отзывы на сайтах обычно выбирает сам сайт. Эти выбирать нельзя: они
            лежат в карточке на Яндекс Картах, мы не можем их ни поправить, ни
            снять. Откройте и сверьте — так спокойнее и вам, и нам.
          </MarginNote>

          <div className="flex flex-col gap-4 lg:items-end lg:text-right">
            <p className="text-sm text-stone">
              Цитаты приведены дословно, сокращения отмечены многоточием.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 lg:justify-end">
            <Link
              href="/otzyvy"
              className="link-sweep font-semibold text-gold"
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
      </div>
    </Section>
  );
}
