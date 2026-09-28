import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { ButtonLink } from '../ui/Button';
import { RatingBadge } from '../RatingBadge';
import { getContent } from '@/lib/content/store';

/**
 * ПЕРВЫЙ ЭКРАН
 * ============
 * Фотография на весь экран, а не в колонке рядом с текстом. Так делают
 * студии, которым есть что показать: снимок работает как витрина, а
 * текста ровно столько, чтобы за пять секунд понять, что это, где и
 * что нажать.
 *
 * Заголовок вынесен на нижнюю кромку кадра — взгляд идёт сверху вниз
 * по фотографии и упирается прямо в него, а следом в кнопку.
 */
export async function Hero() {
  const { hero } = await getContent('texts');

  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-ink pb-10 pt-32 sm:pb-14 lg:min-h-svh">
      {hero.image ? (
        <>
          <Image
            src={hero.image.src}
            alt="Кухня на заказ от ателье «РЕцепт»: светлые матовые фасады, латунный профиль-ручка, деревянная ниша и каменная столешница"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder={hero.image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={hero.image.blurDataURL || undefined}
            className="animate-soft-zoom -z-10 object-cover"
          />
          {/* Затемнение снизу: текст должен читаться на любом кадре */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-ink/92 via-ink/45 to-ink/25"
          />
        </>
      ) : null}

      <div className="container-page relative">
        <p
          className="animate-fade-up label-xs text-cream/65"
          style={{ animationDelay: '120ms' }}
        >
          {hero.eyebrow}
        </p>

        <h1
          className="animate-fade-up font-display mt-6 max-w-[16ch] text-h1 text-cream"
          style={{ animationDelay: '200ms' }}
        >
          {hero.title}
          {hero.titleSecondLine ? ` ${hero.titleSecondLine}` : ''}
        </h1>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="animate-fade-up max-w-xl text-lead text-cream/75"
            style={{ animationDelay: '300ms' }}
          >
            {hero.lead}
          </p>

          <div
            className="animate-fade-up flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: '380ms' }}
          >
            <CtaButton
              source="hero"
              variant="light-solid"
              size="lg"
              withArrow
              className="max-sm:w-full"
              modalTitle="Расскажите, какую кухню вы хотите"
              modalLead="Можно даже без точного проекта и размеров — разберёмся вместе. Роберт или Катя свяжутся и подскажут, с чего начать."
              submitLabel={hero.primaryCta}
            >
              {hero.primaryCta}
            </CtaButton>

            <ButtonLink
              href="/portfolio"
              variant="light"
              size="lg"
              className="max-sm:w-full"
            >
              {hero.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <div
          className="animate-fade-up mt-12 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-cream/15 pt-8"
          style={{ animationDelay: '460ms' }}
        >
          <RatingBadge tone="light" />
          {hero.stats.slice(0, 3).map((item) => (
            <p key={item.small} className="text-[0.8125rem] text-cream/60">
              <span className="mr-2 font-semibold text-cream">{item.big}</span>
              {item.small}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
