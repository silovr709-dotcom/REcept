import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { RatingBadge } from '@/components/RatingBadge';
import { YandexReviewsWidget } from '@/components/YandexWidgets';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { CtaButton } from '@/components/CtaButton';
import { VideoWall } from '@/components/sections/VideoWall';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { rating, reviews } from '@/data/reviews';
import { yandex } from '@/data/site';

export const metadata: Metadata = {
  title: 'Отзывы о кухнях на заказ в Твери — ателье «РЕцепт»',
  description: `Отзывы клиентов мебельного ателье «РЕцепт» в Твери: рейтинг ${rating.value} из 5 на Яндекс Картах, ${rating.reviewsCount} отзыва. Цитаты приведены дословно, рядом — живой виджет с первоисточником.`,
  alternates: { canonical: '/otzyvy' },
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Отзывы"
        title={`${rating.value} из 5 на Яндекс Картах`}
        lead={`${rating.reviewsCount} отзыва и ${rating.scoresCount} оценки в карточке организации. Отзывы на Яндекс Картах мы не можем ни отредактировать, ни удалить — поэтому показываем их как есть и ставим рядом живой виджет, чтобы вы могли проверить каждое слово.`}
        breadcrumbs={[{ name: 'Отзывы' }]}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <RatingBadge />
          <CtaButton
            source="reviews-top"
            variant="brass"
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
          <ul className="grid gap-6 lg:grid-cols-2">
            {reviews.map((t, i) => (
              <li key={`${t.author ?? 'anon'}-${i}`}>
                <Reveal
                  delay={Math.min(i, 3) * 50}
                  className="flex h-full flex-col rounded-lg border border-line bg-cream p-7 sm:p-9"
                >
                  <p className="font-display text-h3 text-ink">{t.highlight}</p>
                  <div aria-hidden="true" className="rule-brass my-6 w-full" />
                  <blockquote className="grow leading-relaxed text-stone">
                    {t.text}
                  </blockquote>
                  <footer className="mt-7 flex items-baseline justify-between gap-4 border-t border-line pt-5">
                    <p className="font-semibold text-ink">
                      {t.author ?? 'Без подписи'}
                    </p>
                    <p className="shrink-0 text-sm text-stone">
                      {t.date} · Яндекс Карты
                    </p>
                  </footer>
                </Reveal>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-3xl text-sm text-stone">
            Цитаты приведены дословно, сокращения отмечены многоточием. Цифры
            рейтинга сверены с карточкой организации{' '}
            {rating.checkedAt} — актуальные всегда видны в виджете ниже.
          </p>
        </div>
      </Section>

      {/* Живой первоисточник */}
      <Section tone="cream" aria-labelledby="widget-title">
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
                href={yandex.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 font-semibold text-brass underline decoration-brass/40 underline-offset-4"
              >
                Открыть карточку «{yandex.orgName}» на Яндекс Картах
              </a>
            </div>
            <YandexReviewsWidget />
          </div>
        </div>
      </Section>

      <VideoWall />

      <FinalCta
        title="Хотите так же?"
        lead="Расскажите, что у вас за помещение и чего хочется. Посмотрим, что реально сделать в ваших размерах, предложим варианты и посчитаем стоимость. Бесплатно и без обязательств."
        source="reviews-final"
      />

      <BreadcrumbJsonLd items={[{ name: 'Отзывы', url: '/otzyvy' }]} />
    </>
  );
}
