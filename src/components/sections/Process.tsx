import Image from 'next/image';
import Link from 'next/link';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleDetails } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';
import { MarginNote } from '../ui/MarginNote';

/**
 * Процесс снимает страх неизвестности: человек должен понимать,
 * что его ждёт и сколько усилий потребуется лично от него.
 */
export async function Process({
  index,
  tone = 'bone',
  limit,
  overview = false,
}: {
  index?: string;
  tone?: 'cream' | 'bone';
  /** Сколько первых шагов показать. Без ограничения — все */
  limit?: number;
  /** Сжать полный путь в пять этапов для главной страницы */
  overview?: boolean;
}) {
  const [{ processSteps: allSteps }, details] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
  ]);
  // Короткая редакционная схема на главной. Подробные формулировки и
  // все десять шагов остаются на странице «Кухни на заказ».
  const overviewSteps = [
    {
      n: '01',
      phase: 'Старт · разговор и замер',
      title: 'Знакомимся с вашей задачей и помещением',
      text: 'Начинаем с короткого разговора о том, что нужно и как вы пользуетесь кухней. Затем приезжаем, снимаем размеры, проверяем короба, окна, вентиляцию и коммуникации — чтобы проект опирался на реальные условия.',
      yourEffort: 'Рассказать о задаче и впустить нас на замер.',
    },
    {
      n: '02',
      phase: 'Планирование · проект',
      title: 'Собираем планировку под ваши привычки',
      text: 'Продумываем хранение, технику и материалы, готовим планировку и визуализацию. Проект бесплатный: вы видите решение до оплаты и можете вносить правки.',
      yourEffort: 'Рассказать, как вы живёте и что важно на кухне.',
    },
    {
      n: '03',
      phase: 'Согласование · проверка',
      title: 'Доводим проект до согласованного решения',
      text: 'Меняем то, что хочется изменить, сверяем габариты техники, зазоры, углы открывания и стыки. Готовим схему электрики, чтобы передать её вашему мастеру до начала работ.',
      yourEffort: 'Сказать, что изменить, и утвердить проект.',
    },
    {
      n: '04',
      phase: 'Производство · доставка',
      title: 'Контролируем заказ до доставки',
      text: 'После согласования размещаем заказ и контролируем размеры, цвет и комплектацию. Оплата — 50 / 50: первая часть при запуске, вторая — когда заказ готов на фабрике. День доставки согласуем с вами.',
      yourEffort: 'Согласовать запуск заказа и выбрать удобный день доставки.',
    },
    {
      n: '05',
      phase: 'Финал · сборка и связь',
      title: 'Собираем на месте и остаёмся на связи',
      text: 'Доставляем мебель, собираем, подгоняем фасады и убираем за собой; технику подключаем вместе с вашими мастерами. После установки действует гарантия 24 месяца.',
      yourEffort: 'Принять готовую кухню — дальше мы на связи.',
    },
  ];
  const processSteps = overview
    ? overviewSteps
    : limit
      ? allSteps.slice(0, limit)
      : allSteps;
  const trimmed = !overview && processSteps.length < allSteps.length;
  // На главной оставляем последовательность шагов чистой и короткой;
  // дополнительные фотографии используются только в полной версии.
  const processShots = overview
    ? []
    : (() => {
        const emptyCells = (3 - (processSteps.length % 3)) % 3;
        const shotCount = emptyCells + 3;
        return [...details]
          .reverse()
          .filter((d, i, arr) => arr.findIndex((x) => x.id === d.id) === i)
          .slice(0, shotCount);
      })();
  return (
    <Section tone={tone} id="process" aria-labelledby="process-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          id="process-title"
          eyebrow={overview ? 'Пять этапов работы' : 'Как проходит работа'}
          title={
            overview
              ? 'От первого разговора до готовой кухни'
              : trimmed
                ? 'С чего всё начинается'
                : `${['','Один','Два','Три','Четыре','Пять','Шесть','Семь','Восемь','Девять','Десять'][allSteps.length] ?? allSteps.length} шагов, после которых у вас просто есть кухня`
          }
          lead={
            overview
              ? 'От замера и проекта до производства, сборки и гарантии. Показываем, за что отвечаем мы и где потребуется ваше участие.'
              : trimmed
                ? 'Первые шаги — те, что предстоят вам в ближайшее время. Ниже по ссылке весь процесс целиком, включая производство, доставку и сборку.'
                : 'Мы описали процесс целиком — включая то, что потребуется лично от вас. Обычно этого немного.'
          }
        />

        {overview ? (
          <ol className="process-journey mt-12 lg:mt-16">
            {overviewSteps.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={Math.min(i, 4) * 70}
                className="process-journey__item"
              >
                <span className="process-journey__marker" aria-hidden="true">
                  {step.n}
                </span>
                <div className="process-journey__main">
                  <p className="text-eyebrow font-medium uppercase tracking-[0.17em] text-gold">
                    {step.phase}
                  </p>
                  <h3 className="font-display-light mt-3 text-h3 leading-tight text-ink">
                    {step.title}
                  </h3>
                </div>
                <div className="process-journey__copy">
                  <p className="text-eyebrow font-medium uppercase tracking-[0.16em] text-stone">
                    Что происходит
                  </p>
                  <p className="mt-3 text-big leading-relaxed text-stone">
                    {step.text}
                  </p>
                  <div className="mt-5 border-t border-line pt-4 sm:mt-6 sm:pt-5">
                    <p className="label-xs text-gold">Ваше участие</p>
                    <p className="mt-2 text-ui font-medium leading-relaxed text-ink">
                      {step.yourEffort}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        ) : (
          <div className="mt-16 grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            <ol className="contents">
              {processSteps.map((step, i) => (
                <li key={step.n}>
                  <Reveal
                    delay={Math.min(i, 5) * 40}
                    className={`flex h-full flex-col p-6 sm:p-8 ${
                      tone === 'bone' ? 'bg-bone' : 'bg-cream'
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-small font-bold tracking-[0.16em] text-stone">
                        {step.n}
                      </span>
                      <h3 className="font-display text-big leading-snug text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-4 grow text-ui leading-relaxed text-stone">
                      {step.text}
                    </p>
                    <p className="mt-5 border-t border-line pt-4 text-small text-stone">
                      <span className="font-semibold text-ink">От вас:</span>{' '}
                      {step.yourEffort}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>

            {processShots.map((d) => (
              <div key={d.id} className="relative min-h-52 bg-sand">
                <Image
                  src={assetUrl(d.image.src)}
                  alt={d.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={d.image.blurDataURL || undefined}
                  className="object-cover"
                />
                <p className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent p-5 pt-10 text-small font-medium text-cream">
                  {d.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {!trimmed && !overview ? (
          <MarginNote author="Роберт" className="mt-12">
            Десять шагов выглядят внушительно, но восемь из них — наша
            работа, а не ваша. От вас по-настоящему нужны два: впустить
            на замер и один раз сказать «да, вот так».
          </MarginNote>
        ) : null}

        {trimmed || overview ? (
          <Reveal className="mt-8">
            <Link
              href="/kuhni-na-zakaz#process"
              className="inline-flex items-center gap-2 text-ui font-semibold text-gold underline decoration-gold/40 underline-offset-4"
            >
              {overview
                ? `Подробно — все ${allSteps.length} шагов до сборки и гарантии`
                : `Весь процесс целиком — все ${allSteps.length} шагов до сборки и гарантии`}
            </Link>
          </Reveal>
        ) : null}

        <Reveal className={`mt-12 flex flex-col items-start gap-5 rounded-lg p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10 ${
            tone === 'bone' ? 'bg-cream' : 'bg-bone'
          }`}>
          <div className="max-w-xl">
            <p className="font-display text-h3 text-ink">
              {overview ? 'Первый шаг — короткий разговор' : 'Начинается всё с замера'}
            </p>
            <p className="mt-2.5 text-stone">
              {overview
                ? 'Расскажите, что нужно, и мы подскажем, с чего начать. Замер, проект и расчёт бесплатные — решение остаётся за вами.'
                : 'Приедем, снимем размеры и скажем, что реально помещается. Замер и проект — бесплатно, дальше решаете вы.'}
            </p>
          </div>
          <CtaButton
            source="process"
            variant="primary"
            size="lg"
            withArrow
            className="shrink-0 max-sm:w-full"
            modalTitle={overview ? 'Обсудить вашу задачу' : 'Записаться на замер'}
            modalLead={
              overview
                ? 'Оставьте контакт и пару слов о кухне. Роберт или Катя свяжутся, ответят на вопросы и договорятся о следующем шаге.'
                : 'Оставьте контакт и адрес объекта — согласуем удобное время. Замер и проект бесплатные и ни к чему не обязывают.'
            }
            submitLabel={overview ? 'Обсудить задачу' : 'Записаться на замер'}
          >
            {overview ? 'Обсудить задачу' : 'Записаться на замер'}
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
