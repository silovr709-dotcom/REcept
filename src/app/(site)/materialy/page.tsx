import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Details } from '@/components/sections/Details';
import { Textures } from '@/components/sections/Textures';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleDetails, getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';

export const metadata: Metadata = {
  title: 'Материалы для кухни',
  description:
    'Фасады, столешницы и фурнитура для кухни на заказ в Твери: плёнка, эмаль, шпон, массив, камень. Честно о том, где экономия разумна, а где вернётся проблемой.',
  alternates: { canonical: '/materialy' },
  openGraph: {
    images: [{ url: '/og-materialy.jpg', width: 1200, height: 630, alt: 'Материалы для кухни на заказ: фасады, столешницы, фурнитура' }],
  },
};

const facades = [
  {
    title: 'Плёночные (МДФ в плёнке ПВХ)',
    text: 'Самый доступный вариант с большим выбором цветов и фрезеровок. Чувствительны к перегреву рядом с духовкой — этот момент решается на этапе проекта.',
    tag: 'Бюджет',
  },
  {
    title: 'Эмаль по МДФ',
    text: 'Любой цвет, глубокая матовость, аккуратные кромки и радиусы. Даёт то самое ощущение цельного предмета мебели, а не набора дверок.',
    tag: 'Средний+',
  },
  {
    title: 'Пластик и HPL',
    text: 'Практичная поверхность: устойчива к истиранию и влаге. Хороший компромисс для семей с детьми и активной готовкой.',
    tag: 'Средний',
  },
  {
    title: 'Шпон и массив',
    text: 'Натуральная текстура дерева, уникальный рисунок. Требует аккуратного подбора и стоит дороже — зато со временем выглядит только лучше.',
    tag: 'Премиум',
  },
  {
    title: 'Рифлёные и фрезерованные',
    text: 'Рельеф вместо декора: фактура работает сама по себе и делает даже маленькую кухню характерной.',
    tag: 'Акцент',
  },
  {
    title: 'Стекло в рамке',
    text: 'Прозрачное, тонированное или рифлёное в алюминиевой либо латунной рамке. Разбивает сплошной фронт верхних шкафов.',
    tag: 'Акцент',
  },
];

const tops = [
  {
    title: 'ЛДСП / постформинг',
    text: 'Разумный выбор, когда бюджет ограничен. Главное — правильно обработать стыки и зоны у мойки.',
  },
  {
    title: 'Компакт-плита',
    text: 'Тонкая, прочная, влагостойкая, без видимой кромки. Хорошо смотрится в современных кухнях.',
  },
  {
    title: 'Искусственный камень (акрил, кварц)',
    text: 'Бесшовные стыки, интегрированная мойка, ремонтопригодность. Кварц твёрже и устойчивее к царапинам.',
  },
  {
    title: 'Натуральный камень',
    text: 'Уникальный рисунок и ощущение веса. Требует понимания особенностей: пористость, уход, стыки.',
  },
];

const wisdom = [
  {
    title: 'На чём экономить можно',
    items: [
      'Фасады верхнего яруса — их реже трогают руками',
      'Внутреннее наполнение шкафов, которые вы открываете раз в месяц',
      'Декоративные элементы, без которых кухня не станет хуже работать',
    ],
  },
  {
    title: 'На чём экономить не стоит',
    items: [
      'Фурнитура: направляющие и петли работают по несколько раз в день',
      'Столешница и зона у мойки — здесь больше всего влаги и нагрузки',
      'Кромка и обработка торцов: именно отсюда обычно начинается разрушение',
    ],
  },
];

export default async function MaterialsPage() {
  const [details, projects] = await Promise.all([
    getVisibleDetails(),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'kompaktnaya-kuhnya-zelenye-reyki', 2);
  const shot2 = pickImage(projects, 'kuhnya-grafit-i-belye-reyki', 7);

  return (
    <>
      <PageHero
        eyebrow="Материалы"
        title="Из чего делается кухня — и что из этого важно именно вам"
        lead="Мы не продаём «лучший материал». Мы объясняем разницу, чтобы вы понимали, за что платите и где разумно сэкономить. Конкретный набор подбираем под ваш проект и бюджет."
        breadcrumbs={[{ name: 'Материалы' }]}
      >
        <CtaButton
          source="materials-top"
          variant="brass"
          size="lg"
          withArrow
          className="max-sm:w-full"
          modalTitle="Подберём материалы под ваш бюджет"
          modalLead="Скажите примерный ориентир по бюджету и что для вас важно — предложим сочетание материалов, которое в него укладывается."
          submitLabel="Подобрать материалы"
        >
          Подобрать материалы под бюджет
        </CtaButton>
      </PageHero>

      <Textures />

      <Details
        tone="bone"
        items={details}
        eyebrow="Фактуры вживую"
        title="Материалы, с которыми мы уже работали"
        lead="Это не каталог поставщика и не рендеры: каждый кадр — фрагмент кухни, которую мы сделали. Металл, стекло, камень, дерево и рельеф в реальном освещении реальных квартир."
        footnote="Нажмите на любой фрагмент, чтобы посмотреть проект целиком."
      />

      <Section tone="cream" aria-labelledby="facades-title">
        <div className="container-page">
          <SectionHeading
            id="facades-title"
            eyebrow="Фасады"
            title="Самая заметная и самая дорогая часть кухни"
            lead="Именно фасады формируют и внешний вид, и значительную долю стоимости. Разброс цен здесь самый большой."
          />

          <div className="grid-fronts mt-12 grid overflow-hidden rounded-lg sm:grid-cols-2 lg:grid-cols-3">
            {facades.map((f, i) => (
              <Reveal
                key={f.title}
                delay={Math.min(i, 5) * 40}
                className="flex h-full flex-col bg-bone p-7"
              >
                <span className="self-start border-l border-brass pl-2.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brass">
                  {f.tag}
                </span>
                <h3 className="font-display mt-4 text-[1.1875rem] text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  {f.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="bone">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal>
              <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-sand">
                {shot ? (
                  <Image
                    src={shot.image.src}
                    alt={shot.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1023px) 100vw, 48vw"
                    placeholder={shot.image.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={shot.image.blurDataURL || undefined}
                    className="object-cover"
                  />
                ) : null}
              </div>
            </Reveal>

            <div>
              <SectionHeading
                eyebrow="Столешницы"
                title="То, с чем вы контактируете каждый день"
                lead="Столешница принимает на себя воду, нагрев, ножи и вес. Здесь разница между материалами чувствуется быстрее всего."
              />
              <dl className="mt-9 grid gap-6">
                {tops.map((t) => (
                  <div key={t.title} className="border-l-2 border-brass/30 pl-5">
                    <dt className="font-semibold text-ink">{t.title}</dt>
                    <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-stone">
                      {t.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="ink">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <SectionHeading
                tone="light"
                eyebrow="Честно о бюджете"
                title="Где экономия разумна, а где вернётся проблемой"
                lead="Мы всегда говорим об этом прямо — в том числе когда выгоднее для нас было бы промолчать."
              />
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {wisdom.map((w) => (
                  <Reveal
                    key={w.title}
                    className="rounded-lg border border-cream/12 bg-cream/[0.03] p-6"
                  >
                    <h3 className="font-display text-[1.125rem] text-cream">
                      {w.title}
                    </h3>
                    <ul className="mt-4 grid gap-3">
                      {w.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-[0.9375rem] leading-relaxed text-cream/65"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2.5 size-1 shrink-0 rounded-full bg-brasslight"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>

              <CtaButton
                source="materials-mid"
                variant="light"
                size="lg"
                withArrow
                className="mt-10 max-sm:w-full"
                modalTitle="Соберём кухню под ваш бюджет"
                modalLead="Назовите ориентир — подскажем, какое сочетание материалов и фурнитуры в него укладывается без потери качества."
                submitLabel="Получить расчёт"
              >
                Уложиться в мой бюджет
              </CtaButton>
            </div>

            <Reveal>
              <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-coal">
                {shot2 ? (
                  <Image
                    src={shot2.image.src}
                    alt={shot2.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1023px) 100vw, 40vw"
                    placeholder={shot2.image.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={shot2.image.blurDataURL || undefined}
                    className="object-cover"
                  />
                ) : null}
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="bone">
        <div className="container-page">
          <div className="rounded-lg border border-line bg-cream p-8 sm:p-12">
            <h2 className="font-display max-w-3xl text-h3 text-ink">
              Образцы материалов проще один раз потрогать, чем десять раз
              посмотреть на экране
            </h2>
            <p className="mt-4 max-w-2xl text-stone">
              Цвет на фотографии и цвет в вашей кухне при вашем освещении —
              разные вещи. Поэтому на встрече мы показываем образцы вживую и
              смотрим их при вашем свете.
            </p>
            <CtaButton
              source="materials-samples"
              variant="brass"
              size="lg"
              withArrow
              className="mt-7 max-sm:w-full"
              modalTitle="Посмотреть образцы"
              modalLead="Договоримся о встрече и покажем образцы материалов вживую. Это ни к чему не обязывает."
              submitLabel="Договориться о встрече"
            >
              Посмотреть образцы вживую
            </CtaButton>
          </div>
        </div>
      </Section>

      <FinalCta
        title="Подберём материалы под вашу задачу"
        lead="Расскажите, что для вас важнее: практичность, внешний вид или бюджет. Мы предложим сочетание, которое честно закрывает ваш приоритет, и посчитаем стоимость."
        submitLabel="Подобрать материалы"
        source="materials-final"
      />

      <BreadcrumbJsonLd items={[{ name: 'Материалы', url: '/materialy' }]} />
    </>
  );
}
