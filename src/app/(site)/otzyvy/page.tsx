import type { Metadata } from 'next';
import { Fragment } from 'react';
import { PageHero } from '@/components/PageHero';
import { RatingBadge } from '@/components/RatingBadge';
import { YandexReviewsWidget } from '@/components/YandexWidgets';
import { Reveal } from '@/components/ui/Reveal';
import { CropFrame } from '@/components/ui/CropFrame';
import { crops } from '@/data/crops';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CtaButton } from '@/components/CtaButton';
import { VideoWall } from '@/components/sections/VideoWall';
import { PhotoBand } from '@/components/PhotoBand';
import { ProjectCard } from '@/components/ProjectCard';
import { getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleReviews } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

export async function generateMetadata(): Promise<Metadata> {
  const { rating } = await getVisibleReviews();
  return {
    title: 'Отзывы о наших кухнях',
    description: `Отзывы о кухнях на заказ в Твери: рейтинг ${rating.value} из 5 на Яндекс Картах, ${rating.reviewsCount} отзыва. Цитаты дословно, рядом живой виджет с первоисточником.`,
    alternates: { canonical: '/otzyvy' },
  openGraph: {
    images: [{ url: '/og-otzyvy.jpg', width: 1200, height: 630, alt: 'Отзывы о кухнях ателье «РЕцепт» в Твери' }],
  },
  };
}

export default async function ReviewsPage() {
  const heroProjects = await getVisibleProjects();
  // Снимок в шапку страницы: тот же приём, что на первом экране
  // главной и на карточке ссылки в мессенджере
  const heroShot = pickImage(heroProjects, 'kuhnya-v-nishe-latun', 0);
  const [{ rating, items: reviews }, site, projects] = await Promise.all([
    getVisibleReviews(),
    getSiteView(),
    getVisibleProjects(),
  ]);
  const band = pickImage(projects, 'malenkaya-kuhnya-p-obraznaya', 8);
  const yandex = site.yandex;
  return (
    <>
      <PageHero
        eyebrow="Отзывы"
        title={`${rating.value} из 5 на Яндекс Картах`}
        lead={`${rating.reviewsCount} отзыва и ${rating.scoresCount} оценки в карточке организации. Отзывы на Яндекс Картах мы не можем ни отредактировать, ни удалить — поэтому показываем их как есть и ставим рядом живой виджет, чтобы вы могли проверить каждое слово.`}
        breadcrumbs={[{ name: 'Отзывы' }]}
        image={heroShot?.image}
        imageAlt=""
        imagePosition="object-[50%_55%]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <RatingBadge />
          <CtaButton
            source="reviews-top"
            variant="light-solid"
            size="lg"
            withArrow
            className="max-sm:w-full"
            modalTitle="Обсудим вашу кухню"
            modalLead="Расскажите про помещение — посмотрим, что реально сделать, и посчитаем стоимость. Бесплатно и без обязательств."
            submitLabel="Обсудить мою кухню"
          >
            Обсудить мою кухню
          </CtaButton>
        </div>
      </PageHero>

      <Section tone="bone" className="pt-0! lg:pt-0!">
        <div className="container-page">
          {/*
            Шесть отзывов подряд — шесть одинаковых прямоугольников
            текста. После второго и пятого в сетку встаёт фрагмент
            работы: это не иллюстрация к конкретному отзыву (связывать
            их мы не вправе), а напоминание, о чём вообще речь.
          */}
          <ul className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
            {reviews.map((t, i) => (
              <Fragment key={`${t.author ?? 'anon'}-${i}`}>
              <li>
                <Reveal
                  delay={Math.min(i, 3) * 50}
                  /* Рамка вокруг каждой цитаты превращала страницу
                     в сетку окошек. Цитата держится линией сверху и
                     подписью снизу — как в книге. */
                  className="flex h-full flex-col border-t border-goldline/50 pt-7"
                >
                  <p className="font-display text-[clamp(1.3rem,0.95rem+0.9vw,1.6rem)] leading-[1.3] text-ink">
                    {t.highlight}
                  </p>
                  <blockquote className="mt-5 grow text-[0.9375rem] leading-[1.7] text-stone">
                    {t.text}
                  </blockquote>
                  <footer className="mt-6 flex items-baseline gap-4">
                    <p className="label-xs text-ink">
                      {t.author ?? 'Без подписи'}
                    </p>
                    <span aria-hidden="true" className="h-px grow bg-line" />
                    <p className="shrink-0 font-display text-[0.9375rem] text-stone">
                      {t.date} · Яндекс Карты
                    </p>
                  </footer>
                </Reveal>
              </li>

              {i === 1 || i === 4 ? (
                <li>
                  <CropFrame
                    crop={i === 1 ? crops.islandWood : crops.brassHood}
                    ratio="aspect-16/10"
                    sizes="(max-width: 1023px) 100vw, 46vw"
                    caption
                    className="h-full"
                  />
                </li>
              ) : null}
              </Fragment>
            ))}
          </ul>

          <p className="mt-8 max-w-3xl text-sm text-stone">
            Цитаты приведены дословно, сокращения отмечены многоточием. Цифры
            рейтинга сверены с карточкой организации{' '}
            {rating.checkedAt} — актуальные всегда видны в виджете ниже.
          </p>
        </div>
      </Section>

      {band ? (
        <PhotoBand
          image={band.image}
          alt={band.alt}
          overlay="quote"
          height="lg"
          caption="Отзывы пишут о работе, а не о картинках. Поэтому мы и не прячем их за своей вёрсткой."
        />
      ) : null}

      {/* Живой первоисточник */}
      <Section tone="bone" aria-labelledby="widget-title">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                id="widget-title"
                eyebrow="Первоисточник"
                title="Те же отзывы, но напрямую с Яндекс Карт"
                lead="Этот блок мы не наполняем вручную: он показывает карточку организации в реальном времени. Если завтра появится плохой отзыв — он появится и здесь."
              />
              <a
                href={yandex?.reviewsUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-gold underline decoration-gold/40 underline-offset-4"
              >
                Открыть карточку «{yandex?.orgName}» на Яндекс Картах
              </a>
            </div>
            <YandexReviewsWidget />
          </div>
        </div>
      </Section>

      <Section tone="cream" aria-labelledby="reviews-works">
        <div className="container-page">
          <SectionHeading
            id="reviews-works"
            eyebrow="Проекты"
            title="О чём эти отзывы"
          />
          <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <li key={project.slug}>
                <ProjectCard project={project} ratio="aspect-4/5" />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Видеостена на песочном: раньше она была тёмной и упиралась
          в тёмный финальный призыв — два синих блока подряд */}
      <VideoWall tone="bone" />

      <FinalCta
        title="Хотите так же?"
        lead="Расскажите, что у вас за помещение и чего хочется. Посмотрим, что реально сделать в ваших размерах, предложим варианты и посчитаем стоимость. Бесплатно и без обязательств."
        source="reviews-final"
      />

      <BreadcrumbJsonLd items={[{ name: 'Отзывы', url: '/otzyvy' }]} />
    </>
  );
}
