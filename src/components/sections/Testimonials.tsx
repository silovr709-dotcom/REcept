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

        {/*
          Было четыре равные колонки мелкого текста — так верстают
          ленту объявлений, а не разворот. Стало две неравные полосы:
          слева цитаты, набранные как цитаты (врезка антиквой, тело
          письма ниже), справа — одна работа во всю высоту. Глазу есть
          за что зацепиться, и чужая речь не превращается в стену.
        */}
        <div className="mt-12 grid gap-x-16 gap-y-12 lg:mt-16 lg:grid-cols-[1.5fr_1fr]">
          <ul className="grid gap-12">
            {items.map((t, i) => (
              <li key={`${t.author ?? 'anon'}-${i}`}>
                <Reveal
                  delay={Math.min(i, 3) * 60}
                  className="border-t border-goldline/50 pt-7"
                >
                  <p className="font-display text-[clamp(1.3rem,0.95rem+0.9vw,1.6rem)] leading-[1.3] text-ink">
                    {t.highlight}
                  </p>
                  <blockquote className="mt-5 max-w-[62ch] text-ui leading-[1.7] text-stone">
                    {t.text}
                  </blockquote>
                  <footer className="mt-5 flex items-baseline gap-4">
                    <p className="label-xs text-ink">
                      {t.author ?? 'Без подписи'}
                    </p>
                    <span aria-hidden="true" className="h-px grow bg-line" />
                    <p className="shrink-0 font-display text-ui text-stone">
                      {t.date}
                    </p>
                  </footer>
                </Reveal>
              </li>
            ))}
          </ul>

          {sideShot ? (
            <Reveal delay={120} className="lg:sticky lg:top-28 lg:self-start">
              <Link
                href={`/portfolio/${sideShot.slug}`}
                className="group block"
              >
                <span className="mat-light block">
                  <span className="relative block aspect-4/5 overflow-hidden bg-sand">
                    <Image
                      src={assetUrl(sideShot.image.src)}
                      alt={sideShot.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1023px) 100vw, 32vw"
                      placeholder={
                        sideShot.image.blurDataURL ? 'blur' : 'empty'
                      }
                      blurDataURL={sideShot.image.blurDataURL || undefined}
                      className="photo-calm object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </span>
                </span>
                <span className="mt-4 block font-display text-big text-ink transition-colors group-hover:text-gold">
                  {sideShot.title}
                </span>
                <span className="label-xs mt-1.5 block text-stone">
                  Смотреть проект
                </span>
              </Link>
            </Reveal>
          ) : null}
        </div>

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
