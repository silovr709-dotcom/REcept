import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { ButtonLink } from '../ui/Button';
import { Eyebrow } from '../ui/Section';
import { RatingBadge } from '../RatingBadge';
import { getContent } from '@/lib/content/store';

/**
 * ПЕРВЫЙ ЭКРАН — правило пяти секунд.
 * Человек должен сразу понять: что это, что делают, где, чем отличаются
 * и что делать дальше. Поэтому сначала смысл, потом красота.
 *
 * Порядок на мобильном специально такой: заголовок → объяснение → кнопки
 * → фотография → цифры. Кнопка не уезжает вниз за картинку.
 */
export async function Hero() {
  const { hero } = await getContent('texts');

  return (
    <section className="relative overflow-hidden bg-cream pb-14 pt-24 lg:pb-20 lg:pt-32">
      {/* Мягкое тёплое свечение — глубина без «чёрного с золотом» */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 size-[38rem] rounded-full bg-sand/60 blur-3xl"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_1fr] lg:gap-16 xl:gap-20">
          <div className="max-w-2xl">
            <Eyebrow className="animate-fade-up">{hero.eyebrow}</Eyebrow>

            <h1
              className="animate-fade-up font-display mt-6 text-h1 text-ink"
              style={{ animationDelay: '60ms' }}
            >
              {hero.title}{' '}
              {hero.titleSecondLine ? (
                <span className="block">{hero.titleSecondLine}</span>
              ) : null}
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-lead text-stone"
              style={{ animationDelay: '120ms' }}
            >
              {hero.lead}
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: '180ms' }}
            >
              <CtaButton
                source="hero"
                variant="brass"
                size="lg"
                withArrow
                className="w-full sm:w-auto"
                modalTitle="Расскажите, какую кухню вы хотите"
                modalLead="Можно даже без точного проекта и размеров — разберёмся вместе. Роберт или Катя свяжутся и подскажут, с чего начать."
                submitLabel={hero.primaryCta}
              >
                {hero.primaryCta}
              </CtaButton>

              <ButtonLink
                href="/portfolio"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                {hero.secondaryCta}
              </ButtonLink>
            </div>

            <p
              className="animate-fade-up mt-4 max-w-md text-sm text-stone"
              style={{ animationDelay: '220ms' }}
            >
              {hero.reassurance}
            </p>

            <div className="animate-fade-up mt-7" style={{ animationDelay: '260ms' }}>
              <RatingBadge />
            </div>
          </div>

          {/* Визуальное доказательство качества */}
          {hero.image ? (
            <div className="animate-soft-zoom relative aspect-4/3 overflow-hidden rounded-lg bg-sand sm:aspect-3/2 lg:aspect-auto lg:h-[min(70vh,38rem)]">
              <Image
                src={hero.image.src}
                alt="Кухня на заказ от ателье «РЕцепт»: светлые матовые фасады, латунный профиль-ручка, деревянная ниша и каменная столешница"
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1023px) 100vw, 46vw"
                placeholder={hero.image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={hero.image.blurDataURL || undefined}
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        {/* Доказательство прямо на первом экране */}
        {hero.stats.length > 0 ? (
          <ul className="animate-fade-up mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 sm:grid-cols-4 lg:mt-16">
            {hero.stats.map((item) => (
              <li key={item.small}>
                <p className="font-display text-[1.625rem] leading-none text-ink">
                  {item.big}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-snug text-stone">
                  {item.small}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
