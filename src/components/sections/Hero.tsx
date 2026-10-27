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
 * Раньше здесь лежала фотография во весь экран, а поверх неё — чёрная
 * шторка плотностью до 97%, чтобы заголовок читался. Так устроено
 * большинство лендингов, и у этого приёма есть цена: от снимка остаётся
 * тёмное пятно. На нашем кадре под шторкой оказывались Роберт и Катя —
 * то есть ровно то, ради чего человек сюда и приходит. Люди исчезали.
 *
 * Теперь первый экран построен как разворот журнала. Слева — плотное
 * синее поле с текстом: оно само по себе носитель, его не нужно
 * «забивать» градиентом, и контраст там идеальный по построению.
 * Справа — портрет в золотой рамке: не фон, а объект, которым можно
 * любоваться. Фотография не притушена ни на процент.
 *
 * Такая раскладка решает и вторую задачу. Сайт продаёт не мебельную
 * фабрику, а двух конкретных людей, которые ведут проект лично. Когда
 * их портрет стоит рядом с заголовком как равный по весу элемент, это
 * читается с первой секунды — и без единого слова «мы команда
 * профессионалов».
 *
 * На телефоне порядок перевёрнут: сначала портрет, потом заголовок.
 * Колонки там нет, и если оставить текст первым, люди опять уедут под
 * нижний край экрана — то же самое исчезновение, только иначе.
 */
export async function Hero() {
  const { hero, team } = await getContent('texts');
  const { primaryPhone } = await getSiteView();
  const names = team.map((t) => t.fullName.split(' ')[0]).join(' и ');

  /*
    Из четырёх фактов на первом экране показываем три. Четвёртый не
    пропадает — он стоит в строке под кадром. Причина простая: три
    колонки держат строку на любой ширине, четвёртая ломает её на две
    строки уже на ноутбуке, и аккуратная линия превращается в кашу.
  */
  const facts = hero.stats.slice(0, 3);

  return (
    <>
      <section
        data-hero="dark"
        className="grain relative isolate overflow-hidden bg-ink text-cream"
      >
        {/* Поле собрано из трёх слоёв: тёплый золотой свет сверху справа,
            глубокая тень снизу слева и диагональный переход синего.
            Ровная заливка одним цветом — главный признак дешёвой
            вёрстки: в печати и в природе плоского цвета не бывает */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(120%_85%_at_84%_-4%,rgba(199,170,112,0.22),transparent_56%),radial-gradient(95%_85%_at_-5%_105%,rgba(5,12,24,0.78),transparent_64%),linear-gradient(162deg,#1b3a63_0%,#13294a_48%,#0a1930_100%)]"
        />

        <div className="container-page relative z-10 flex min-h-[92svh] flex-col justify-center pb-12 pt-24 sm:pb-14 lg:pb-16 lg:pt-28">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:gap-16">
            {/* ПОРТРЕТ. В разметке он стоит первым — это и есть мобильный
                порядок. На большом экране уезжает направо через order */}
            <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[22rem] lg:order-2 lg:mx-0 lg:ml-auto lg:max-w-[29.5rem]">
              {/* Паспарту: снимок отбит от поля светлым полем и золотой
                  линией — так портрет читается как работа на стене,
                  а не как картинка, положенная на фон */}
              <div className="mat-dark relative">
                <div className="relative aspect-4/5 overflow-hidden bg-soot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetUrl(teamShots.heroPortrait.src)}
                  srcSet={srcSetOf(teamShots.heroPortrait)}
                  sizes="(max-width: 640px) 17rem, (max-width: 1024px) 22rem, 30rem"
                  alt={teamShotAlt.hero}
                  width={teamShots.heroPortrait.width}
                  height={teamShots.heroPortrait.height}
                  fetchPriority="high"
                  decoding="async"
                  className="photo-calm size-full object-cover object-[50%_18%]"
                />

                {/* Рамка в волосок с отбивкой от края и засечками по
                    углам — приём паспарту: он говорит «это снимок,
                    который показывают», а не «это картинка на фоне» */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10"
                  >
                    <span className="absolute left-0 top-0 size-7 border-l border-t border-goldsoft/70" />
                    <span className="absolute bottom-0 right-0 size-7 border-b border-r border-goldsoft/70" />
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <Link
                  href="/o-nas"
                  className="group inline-flex flex-col gap-1"
                >
                  <span className="label-xs text-goldsoft">Это мы</span>
                  <span className="font-display text-sub leading-none text-cream transition-colors group-hover:text-goldsoft sm:text-sub">
                    {names}
                  </span>
                </Link>
                {/* На телефоне подпись пряталась в угол и ломалась на две
                    строки — выглядела как обрывок. Теперь она появляется
                    только там, где помещается в строку целиком */}
                <p className="hidden whitespace-nowrap text-right text-caption leading-snug tracking-[0.04em] text-cream/65 sm:block">
                  Ведут проект лично
                </p>
              </div>

              {/* Координаты вертикальной строкой — деталь из чертежа,
                  которая ничего не объясняет, но задаёт тон */}
              <p
                aria-hidden="true"
                className="absolute right-[-1.25rem] top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] text-caption uppercase tracking-[0.32em] text-cream/30 xl:block"
              >
                Тверь · своё производство
              </p>
            </div>

            {/* ТЕКСТ */}
            <div className="lg:order-1 lg:max-w-[40rem]">
              <p className="eyebrow-rule text-goldsoft">{hero.eyebrow}</p>

              <h1 className="font-display-light animate-fade-up mt-6 text-[clamp(2.5rem,4.4vw,4.4rem)] leading-[1.02] tracking-[-0.014em] sm:mt-7">
                {hero.title}
                {hero.titleSecondLine ? (
                  <>
                    {' '}
                    {/* Курсив антиквы золотом — единственный цветной
                        акцент в заголовке. Второе такое слово на
                        странице стёрло бы приём */}
                    <span className="accent-italic block text-goldsoft">
                      {hero.titleSecondLine}
                    </span>
                  </>
                ) : null}
              </h1>

              <p
                className="animate-fade-up mt-5 max-w-[46ch] text-lead text-cream/78"
                style={{ animationDelay: '120ms' }}
              >
                {hero.lead}
              </p>

              <div
                className="animate-fade-up mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4"
                style={{ animationDelay: '200ms' }}
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

              <p className="mt-4 max-w-md text-small leading-relaxed text-cream/60">
                {hero.reassurance}
              </p>

              {/* Третья дверь: часть людей не станет заполнять форму
                  ни при каких условиях, им проще один раз позвонить */}
              {primaryPhone ? (
                <p className="mt-2 text-small text-cream/60">
                  Или просто позвоните:{' '}
                  <a
                    href={`tel:${primaryPhone.raw}`}
                    className="font-medium text-cream underline decoration-goldsoft/50 underline-offset-4 transition-colors hover:text-goldsoft"
                  >
                    {primaryPhone.display}
                  </a>
                </p>
              ) : null}

              {/* Факты — цифрой антиквой, подпись мелко. Так устроены
                  выходные данные в каталоге: цифра работает как якорь */}
              <dl className="mt-8 grid grid-cols-3 gap-x-6 gap-y-4 border-t border-cream/15 pt-5 sm:gap-x-10 lg:mt-9">
                {facts.map((item) => (
                  <div key={item.small} className="flex flex-col-reverse gap-1">
                    <dd className="max-w-[16ch] text-caption leading-[1.45] tracking-[0.03em] text-cream/70">
                      {item.small}
                    </dd>
                    <dt className="font-display text-sub leading-none text-goldsoft sm:text-sub">
                      {item.big}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Строка доказательств сразу под кадром: рейтинг с Яндекс Карт,
          ссылка на страницу о нас и четвёртый факт, не поместившийся
          в первый экран */}
      <div className="grain bg-ink text-cream">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-cream/12 py-6">
            <RatingBadge tone="light" />

            {hero.stats.slice(3).map((item) => (
              <p key={item.small} className="max-w-64 text-small text-cream/70">
                <span className="mr-2 font-display text-big text-goldsoft">
                  {item.big}
                </span>
                {item.small}
              </p>
            ))}

            <Link
              href="/o-nas"
              className="group ml-auto inline-flex items-baseline gap-3 max-sm:ml-0"
            >
              <span className="label-xs text-cream/55">Это мы</span>
              <span className="font-display text-big text-cream transition-colors group-hover:text-goldsoft">
                {names}
              </span>
              <span aria-hidden="true" className="text-goldsoft">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
