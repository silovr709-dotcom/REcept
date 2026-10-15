import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { ButtonLink } from '../ui/Button';
import { RatingBadge } from '../RatingBadge';
import Link from 'next/link';
import { getContent } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';
import { teamShotAlt } from '@/data/team-shots';

/**
 * ПЕРВЫЙ ЭКРАН
 * ============
 * Заголовок стоит на фотографии, а не над ней. До этого кадр лежал
 * отдельной полосой под текстом: снимок при этом оставался чистым, но
 * на ноутбуке человек видел сначала экран с одним текстом, а кухню —
 * только после прокрутки. Для правила пяти секунд это плохой размен:
 * товар должен попадать в кадр сразу вместе с обещанием.
 *
 * Читаемость обеспечивает не ровное затемнение всего кадра, а два
 * направленных градиента: плотный там, где лежит текст, и прозрачный
 * там, где смотрят на кухню. Снизу — для мобильной раскладки, слева —
 * для широких экранов. В худшем случае (под текстом оказался белый
 * участок снимка) контраст светлого текста остаётся около 7:1, то
 * есть с запасом выше требований доступности.
 */
export async function Hero() {
  const { hero, team } = await getContent('texts');
  const names = team.map((t) => t.fullName.split(' ')[0]).join(' и ');

  return (
    <>
      <section className="relative isolate flex min-h-[94svh] flex-col justify-end overflow-hidden bg-ink pb-12 pt-28 lg:min-h-svh lg:pb-16 lg:pt-32">
        {hero.image ? (
          <Image
            src={assetUrl(hero.image.src)}
            alt={teamShotAlt.hero}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder={hero.image.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={hero.image.blurDataURL || undefined}
            // Кадр снят под эту раскладку: кухня слева, Роберт и Катя
            // в правой трети. На узком экране от широкого кадра остаётся
            // вертикальная полоса по центру — и люди уехали бы за край,
            // поэтому точка привязки сдвинута вправо и тем сильнее,
            // чем уже экран. По вертикали смещение вверх: внизу кадр
            // всё равно уходит под плашку с текстом.
            className="animate-soft-zoom -z-20 object-cover object-[72%_38%] md:object-[62%_45%] 2xl:object-[56%_50%]"
          />
        ) : null}

        {/* Снизу вверх — работает на любой ширине */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink/95 via-ink/72 to-ink/45 lg:from-ink/92 lg:via-ink/55 lg:to-ink/25"
        />
        {/* Отдельный завал под шапку. Наверху главной она прозрачная
            и светлая, а кадр в этом месте самый яркий — без этой полосы
            меню и кнопка в правой части растворялись в белых фасадах.
            Полоса короткая: саму кухню она не трогает */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-ink/85 via-ink/45 to-transparent lg:h-48"
        />

        {/* Слева направо — только на широких, чтобы правая часть кадра
            с кухней осталась почти нетронутой */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 hidden lg:block lg:bg-linear-to-r lg:from-ink/80 lg:via-ink/35 lg:to-transparent"
        />

        <div className="container-page">
          <div className="flex items-baseline justify-between gap-6 border-b border-cream/15 pb-5">
            <p className="label-xs text-cream/60">{hero.eyebrow}</p>
            <p className="label-xs hidden text-cream/60 sm:block">
              Проект бесплатно
            </p>
          </div>

          {/* На широких экранах заголовок прижат к нижнему краю кадра,
              поэтому его потолок ниже штатного text-h1: иначе на ноутбуке
              с невысоким окном первый экран перестаёт помещаться целиком */}
          <h1 className="animate-fade-up font-display mt-9 max-w-5xl text-h1 text-cream lg:text-[clamp(3.25rem,4.6vw,5.75rem)]">
            {hero.title}
            {hero.titleSecondLine ? (
              <>
                {/* Пробел нужен, чтобы при чтении вслух и в выдаче строки
                    не склеивались в «Кухни на заказв Твери» */}
                {' '}
                <span className="block text-cream/55">
                  {hero.titleSecondLine}
                </span>
              </>
            ) : null}
          </h1>

          <p
            className="animate-fade-up mt-8 max-w-2xl text-lead text-cream/80"
            style={{ animationDelay: '140ms' }}
          >
            {hero.lead}
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: '220ms' }}
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

          <p className="mt-5 max-w-md text-sm text-cream/60">
            {hero.reassurance}
          </p>

          {/* Доказательство и авторы — в одной строке у нижнего края кадра */}
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-cream/15 pt-7">
            <RatingBadge tone="light" />

            {/* За мебелью на заказ идут к людям, а не в компанию */}
            <Link
              href="/o-nas"
              className="group inline-flex items-baseline gap-4"
            >
              <span className="label-xs text-cream/50">Это мы</span>
              <span className="font-display text-[1.375rem] text-cream transition-colors group-hover:text-cream/70">
                {names}
              </span>
              <span aria-hidden="true" className="text-cream/50">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Факты вынесены из кадра: в первом экране они спорили за внимание
          с заголовком, а здесь встречают человека сразу после прокрутки */}
      <div className="bg-cream">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6 border-b border-line py-8">
            {hero.stats.map((item) => (
              <p key={item.small} className="max-w-56 text-[0.8125rem] text-stone">
                <span className="mr-2 font-semibold text-ink">{item.big}</span>
                {item.small}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
