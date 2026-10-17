import { CtaButton } from '../CtaButton';
import { ButtonLink } from '../ui/Button';
import { RatingBadge } from '../RatingBadge';
import Link from 'next/link';
import { getContent } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { assetUrl, srcSetOf } from '@/lib/content/images';
import { teamShots, teamShotAlt } from '@/data/team-shots';

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
  const { primaryPhone } = await getSiteView();
  const names = team.map((t) => t.fullName.split(' ')[0]).join(' и ');

  /*
    Подзаголовок на телефоне короче на одно предложение. Причина
    арифметическая: на экране 390×844 блок текста с полным лидом
    занимает около семисот точек, и лица Роберта и Кати неизбежно
    оказываются под буквами — как бы мы ни кадрировали снимок.
    Убирая второе предложение и поджимая отступы, мы освобождаем
    сверху примерно сто семьдесят точек: ровно столько, чтобы лица
    оказались выше первой строки. На ширине от 640 точек место есть,
    там лид показывается целиком.
  */
  const [leadFirst, ...leadRest] = hero.lead.split(/(?<=\.)\s+/);
  const leadTail = leadRest.join(' ');

  return (
    <>
      <section
        data-hero="dark"
        className="relative isolate flex min-h-[94svh] flex-col justify-end overflow-hidden bg-ink pb-9 pt-24 sm:pb-12 sm:pt-28 lg:min-h-svh lg:pb-16 lg:pt-32"
      >
        {/*
          Два кадра вместо одного. На телефоне экран почти в два раза
          выше своей ширины: от широкого снимка остаётся вертикальная
          полоса в четверть кадра, кухня пропадает, а от людей остаётся
          половина лица — именно так первый экран и выглядел. Поэтому
          для узких экранов подставляется отдельный вертикальный кадр.

          Это <picture> с media, а не два <Image>: браузер скачивает
          ровно один файл из двух, а у первого экрана каждый лишний
          запрос стоит времени до отрисовки.
        */}
        <picture>
          <source
            media="(min-width: 1024px)"
            srcSet={
              srcSetOf(teamShots.heroWide) ?? assetUrl(teamShots.heroWide.src)
            }
            sizes="100vw"
            width={teamShots.heroWide.width}
            height={teamShots.heroWide.height}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl(teamShots.heroPortrait.src)}
            srcSet={srcSetOf(teamShots.heroPortrait)}
            sizes="100vw"
            alt={teamShotAlt.hero}
            width={teamShots.heroPortrait.width}
            height={teamShots.heroPortrait.height}
            fetchPriority="high"
            decoding="async"
            className="animate-soft-zoom absolute inset-0 -z-20 size-full object-cover object-center brightness-110 lg:object-right lg:brightness-100"
          />
        </picture>

        {/* Основная шторка — снизу вверх. Заголовок и кнопки лежат в
            нижней половине кадра, и именно там нужна плотность: на
            телефоне текст приходится на светлую одежду и столешницу.
            Кверху шторка расступается, чтобы кухня осталась видна.

            На широких экранах шторка заметно легче, чем на телефоне.
            Прежний кадр был снят в белой кухне при ровном дневном
            свете — там требовалось плотное затемнение. Нынешний снят
            на закате в графитовой кухне и сам по себе тёмный: та же
            плотность превращала левую половину в чёрное пятно и
            съедала ровно то, ради чего человек пришёл, — кухню.
            Контраст светлого текста при этом остаётся выше 10:1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink/97 via-ink/88 via-46% to-ink/10 lg:from-ink/66 lg:via-ink/24 lg:via-50% lg:to-ink/5"
        />

        {/* Подсветка там, где лица. На телефоне текст физически
            не может не лежать на людях: экран вдвое выше своей
            ширины. Шторка держит контраст, а это мягкое пятно
            возвращает Роберту и Кате лица, чтобы первый экран не
            выглядел как тёмное пятно с буквами */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(74%_20%_at_50%_16%,rgba(243,240,234,0.18),transparent_72%)] lg:hidden"
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
          className="absolute inset-0 -z-10 hidden lg:block lg:bg-linear-to-r lg:from-ink/54 lg:via-ink/14 lg:to-transparent"
        />

        <div className="container-page">
          <div className="flex items-baseline justify-between gap-6 border-b border-cream/15 pb-4 sm:pb-5">
            <p className="label-xs text-cream/60">{hero.eyebrow}</p>
            <p className="label-xs hidden text-cream/60 sm:block">
              Проект бесплатно
            </p>
          </div>

          {/* На широких экранах заголовок прижат к нижнему краю кадра,
              поэтому его потолок ниже штатного text-h1: иначе на ноутбуке
              с невысоким окном первый экран перестаёт помещаться целиком */}
          <h1 className="animate-fade-up font-display mt-6 max-w-5xl text-h1 text-cream sm:mt-9 lg:text-[clamp(3.25rem,4.6vw,5.75rem)]">
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
            className="animate-fade-up mt-5 max-w-2xl text-lead text-cream/80 sm:mt-8"
            style={{ animationDelay: '140ms' }}
          >
            {leadFirst}
            {leadTail ? (
              <span className="hidden sm:inline"> {leadTail}</span>
            ) : null}
          </p>

          <div
            className="animate-fade-up mt-6 flex flex-col items-start gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4"
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

          <p className="mt-4 max-w-md text-sm text-cream/60 sm:mt-5">
            {hero.reassurance}
          </p>

          {/* Третья дверь. Форма — не единственный способ до нас
              добраться, и для части людей она худший: им проще
              один раз позвонить. На телефоне это одно касание */}
          {primaryPhone ? (
            <p className="mt-3 text-sm text-cream/60 sm:mt-4">
              Или просто позвоните:{' '}
              <a
                href={`tel:${primaryPhone.raw}`}
                className="font-semibold text-cream underline decoration-brasslight/50 underline-offset-4 transition-colors hover:text-brasslight"
              >
                {primaryPhone.display}
              </a>
            </p>
          ) : null}

          {/* Доказательство и авторы — в одной строке у нижнего края кадра.
              На телефоне эта строка уезжает в светлую полосу под кадром:
              каждая её строка здесь стоила бы полусотни точек высоты,
              а именно их не хватает, чтобы лица оказались выше заголовка */}
          <div className="mt-7 hidden flex-wrap items-center gap-x-10 gap-y-5 border-t border-cream/15 pt-6 sm:mt-10 sm:flex sm:pt-7">
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
          {/* Мобильный дубль строки доказательств из кадра */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-line py-5 sm:hidden">
            <RatingBadge tone="dark" />
            <Link
              href="/o-nas"
              className="group inline-flex items-baseline gap-3"
            >
              <span className="label-xs text-stone">Это мы</span>
              <span className="font-display text-[1.125rem] text-ink">
                {names}
              </span>
              <span aria-hidden="true" className="text-stone">
                →
              </span>
            </Link>
          </div>

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
