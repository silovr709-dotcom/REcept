import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { ButtonLink } from '../ui/Button';
import { RatingBadge } from '../RatingBadge';
import Link from 'next/link';
import { getContent } from '@/lib/content/store';

/**
 * ПЕРВЫЙ ЭКРАН
 * ============
 * Разворот журнала, а не баннер с текстом поверх фотографии.
 *
 * Почему так. Текст на снимке всегда компромисс: его приходится
 * затемнять, и страдают оба — и буквы, и кадр. Здесь заголовок стоит
 * на чистой бумаге во всю ширину, а под ним фотография идёт от края
 * до края без затемнения. Каждый элемент показан в полную силу.
 *
 * Заголовок набран предельно крупно и плотно: это единственное место
 * на сайте, где размер работает как заявление.
 */
export async function Hero() {
  const { hero, team } = await getContent('texts');
  const names = team.map((t) => t.fullName.split(' ')[0]).join(' и ');

  return (
    <section className="relative bg-cream pt-28 lg:pt-36">
      <div className="container-page">
        <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
          <p className="label-xs text-stone">{hero.eyebrow}</p>
          <p className="label-xs hidden text-stone sm:block">
            Проект бесплатно
          </p>
        </div>

        <h1 className="animate-fade-up font-display mt-10 text-display text-ink">
          {hero.title}
          {hero.titleSecondLine ? (
            <>
              {/* Пробел нужен, чтобы при чтении вслух и в выдаче строки
                  не склеивались в «Кухни на заказв Твери» */}
              {' '}
              <span className="block text-stone">{hero.titleSecondLine}</span>
            </>
          ) : null}
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_auto] lg:items-end lg:gap-16">
          <p
            className="animate-fade-up max-w-2xl text-lead text-stone"
            style={{ animationDelay: '140ms' }}
          >
            {hero.lead}
          </p>

          <div
            className="animate-fade-up flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: '220ms' }}
          >
            <CtaButton
              source="hero"
              variant="primary"
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
              variant="outline"
              size="lg"
              className="max-sm:w-full"
            >
              {hero.secondaryCta}
            </ButtonLink>
          </div>
        </div>

        <p className="mt-5 max-w-md text-sm text-stone">{hero.reassurance}</p>

        {/* Подпись авторов: за мебелью на заказ идут к людям, а не в компанию */}
        <Link
          href="/o-nas"
          className="group mt-10 inline-flex items-baseline gap-4 border-t border-line pt-6"
        >
          <span className="label-xs text-stone">Делаем вдвоём</span>
          <span className="font-display text-h3 text-ink transition-colors group-hover:text-stone">
            {names}
          </span>
          <span aria-hidden="true" className="text-stone">
            →
          </span>
        </Link>
      </div>

      {/* Кадр во всю ширину: без затемнения и без текста поверх */}
      {hero.image ? (
        <div className="relative mt-14 h-[58svh] w-full overflow-hidden bg-sand sm:h-[68svh] lg:mt-20 lg:h-[78svh]">
          <Image
            src={hero.image.src}
            alt="Кухня на заказ от ателье «РЕцепт»: светлые матовые фасады, латунный профиль-ручка, деревянная ниша и каменная столешница"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder={hero.image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={hero.image.blurDataURL || undefined}
            className="animate-soft-zoom object-cover"
          />
        </div>
      ) : null}

      {/* Доказательства сразу под кадром, пока внимание ещё держится */}
      <div className="container-page">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6 border-b border-line py-8">
          <RatingBadge />
          {hero.stats.slice(0, 3).map((item) => (
            <p key={item.small} className="max-w-56 text-[0.8125rem] text-stone">
              <span className="mr-2 font-semibold text-ink">{item.big}</span>
              {item.small}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
