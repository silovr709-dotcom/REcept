import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Details } from '@/components/sections/Details';
import { PhotoBand } from '@/components/PhotoBand';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleDetails, getVisibleProjects } from '@/lib/content/store';
import { assetUrl, pickImage } from '@/lib/content/images';
import {
  materialFamilies,
  millings,
  hardwareGroups,
  countertopLines,
} from '@/data/materials';
import { MarginNote } from '@/components/ui/MarginNote';
import { CropFrame } from '@/components/ui/CropFrame';
import { crops } from '@/data/crops';
import { teamShots, teamShotAlt } from '@/data/team-shots';

export const metadata: Metadata = {
  title: 'Материалы для кухни',
  description:
    'Фасады, столешницы и фурнитура для кухни на заказ в Твери: плёнка, эмаль, шпон, массив, камень. Честно о том, где экономия разумна, а где вернётся проблемой.',
  alternates: { canonical: '/materialy' },
  openGraph: {
    images: [{ url: '/og-materialy.jpg', width: 1200, height: 630, alt: 'Материалы для кухни на заказ: фасады, столешницы, фурнитура' }],
  },
};

/*
  У каждого типа фасада — свой кадр. Раньше здесь шли шесть абзацев
  подряд, и разница между плёнкой, эмалью и шпоном, о которой весь
  текст, оставалась словами. Половина кадров — макро из блока
  «Фактуры вживую», половина — фрагменты реальных объектов.
*/
const facades = [
  {
    shot: 'woodGrey' as const,
    title: 'Плёночные (МДФ в плёнке ПВХ)',
    text: 'Самый доступный вариант с большим выбором цветов и фрезеровок. Чувствительны к перегреву рядом с духовкой — этот момент решается на этапе проекта.',
    tag: 'Бюджет',
  },
  {
    texture: 'lacquer',
    title: 'Эмаль по МДФ',
    text: 'Любой цвет, глубокая матовость, аккуратные кромки и радиусы. Даёт то самое ощущение цельного предмета мебели, а не набора дверок.',
    tag: 'Средний+',
  },
  {
    shot: 'graphiteWood' as const,
    title: 'Пластик и HPL',
    text: 'Практичная поверхность: устойчива к истиранию и влаге. Хороший компромисс для семей с детьми и активной готовкой.',
    tag: 'Средний',
  },
  {
    texture: 'veneer',
    title: 'Шпон и массив',
    text: 'Натуральная текстура дерева, уникальный рисунок. Требует аккуратного подбора и стоит дороже — зато со временем выглядит только лучше.',
    tag: 'Премиум',
  },
  {
    texture: 'reeded',
    title: 'Рифлёные и фрезерованные',
    text: 'Рельеф вместо декора: фактура работает сама по себе и делает даже маленькую кухню характерной.',
    tag: 'Акцент',
  },
  {
    shot: 'ribbedGlassGold' as const,
    title: 'Стекло в рамке',
    text: 'Прозрачное, тонированное или рифлёное в алюминиевой либо латунной рамке. Разбивает сплошной фронт верхних шкафов.',
    tag: 'Акцент',
  },
];

const tops = [
  {
    shot: 'woodTopGreen' as const,
    title: 'ЛДСП / постформинг',
    text: 'Разумный выбор, когда бюджет ограничен. Главное — правильно обработать стыки и зоны у мойки.',
  },
  {
    shot: 'graphiteWood' as const,
    title: 'Компакт-плита',
    text: 'Тонкая, прочная, влагостойкая, без видимой кромки. Хорошо смотрится в современных кухнях.',
  },
  {
    shot: 'quartzTop' as const,
    title: 'Искусственный камень (акрил, кварц)',
    text: 'Бесшовные стыки, интегрированная мойка, ремонтопригодность. Кварц твёрже и устойчивее к царапинам.',
  },
  {
    shot: 'marbleSplash' as const,
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

/** Фрезеровки, сгруппированные по категории сложности */
const millingGroups = Object.entries(
  millings.reduce<Record<number, typeof millings>>((acc, m) => {
    (acc[m.category] ||= []).push(m);
    return acc;
  }, {}),
).sort(([a], [b]) => Number(a) - Number(b));

export default async function MaterialsPage() {
  const heroProjects = await getVisibleProjects();
  // Снимок в шапку страницы: тот же приём, что на первом экране
  // главной и на карточке ссылки в мессенджере
  const heroShot = pickImage(heroProjects, 'temno-siniaya-kuhnya-latun', 9);
  const [details, projects] = await Promise.all([
    getVisibleDetails(),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'kompaktnaya-kuhnya-zelenye-reyki', 2);
  const shot2 = pickImage(projects, 'kuhnya-grafit-i-belye-reyki', 7);
  const band = pickImage(projects, 'kuhnya-s-moykoy-u-okna', 13);

  return (
    <>
      <PageHero
        eyebrow="Материалы"
        title="Из чего делается кухня — и что из этого важно именно вам"
        lead="Мы не продаём «лучший материал». Мы объясняем разницу, чтобы вы понимали, за что платите и где разумно сэкономить. Конкретный набор подбираем под ваш проект и бюджет."
        breadcrumbs={[{ name: 'Материалы' }]}
        image={heroShot?.image}
        imageAlt=""
        imagePosition="object-[50%_55%]"
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

      <Details
        tone="bone"
        items={details}
        eyebrow="Фактуры вживую"
        title="Материалы, с которыми мы уже работали"
        lead="Металл, стекло, камень, дерево и рельеф крупным планом. Именно на таком расстоянии видна разница между эмалью и плёнкой, между шпоном и имитацией."
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

          <div className="mt-16 grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {facades.map((f, i) => {
              const texture = f.texture
                ? details.find((d) => d.id === f.texture)
                : undefined;
              return (
                <Reveal
                  key={f.title}
                  delay={Math.min(i, 5) * 40}
                  className="flex h-full flex-col bg-bone"
                >
                  {texture ? (
                    <div className="relative aspect-16/10 overflow-hidden bg-sand">
                      <Image
                        src={assetUrl(texture.image.src)}
                        alt={texture.alt}
                        fill
                        loading="lazy"
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        placeholder={
                          texture.image.blurDataURL ? 'blur' : 'empty'
                        }
                        blurDataURL={texture.image.blurDataURL || undefined}
                        className="object-cover"
                      />
                    </div>
                  ) : f.shot ? (
                    <CropFrame crop={crops[f.shot]} />
                  ) : null}

                  <div className="flex grow flex-col p-8 sm:p-9">
                    <span className="self-start border-l border-brass pl-2.5 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-brass">
                      {f.tag}
                    </span>
                    <h3 className="font-display mt-4 text-[1.1875rem] text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                      {f.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Реальный каталог, а не обещание «любого цвета». Цифры взяты из
          рабочего каталога производства, на котором мы размещаем заказы,
          и учитывают только действующие позиции. Цен здесь нет
          сознательно: см. комментарий в src/data/materials.ts */}
      <Section tone="ink" aria-labelledby="choice-title">
        <div className="container-page">
          <SectionHeading
            tone="light"
            id="choice-title"
            eyebrow="Выбор"
            title="Не «любой цвет на выбор», а конкретные цифры"
            lead="Так выглядит ассортимент, доступный к заказу сегодня. Снятые с производства позиции мы не считаем — показывать выбор, которого уже нет, нечестно."
          />

          <div className="mt-16 grid gap-px bg-cream/12 sm:grid-cols-2 lg:mt-24">
            {materialFamilies.map((f, i) => (
              <Reveal key={f.id} delay={Math.min(i, 4) * 50} className="bg-ink p-8 sm:p-10 lg:p-12">
                <p className="font-display text-h2 leading-none text-cream">
                  {f.count > 0 ? f.count : 'RAL'}
                </p>
                <p className="label-xs mt-3 text-cream/60">
                  {f.count > 0 ? 'вариантов отделки' : 'любой цвет по вееру'}
                </p>
                <h3 className="font-display mt-7 text-[1.1875rem] text-cream">
                  {f.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-cream/65">
                  {f.text}
                </p>
                {f.brands.length > 0 ? (
                  <p className="mt-4 text-[0.875rem] text-cream/60">
                    Производители: {f.brands.join(', ')}
                  </p>
                ) : null}
                {f.caveat ? (
                  <p className="mt-4 border-t border-cream/12 pt-4 text-[0.875rem] leading-relaxed text-cream/55">
                    {f.caveat}
                  </p>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Фурнитура — то, из-за чего кухня живёт десять лет или три.
          Снаружи её не видно, поэтому про неё и молчат. */}
      <Section tone="bone" aria-labelledby="hardware-title">
        <div className="container-page">
          <SectionHeading
            id="hardware-title"
            eyebrow="Что внутри"
            title="Разницу между кухнями видно не снаружи, а через год"
            lead="Два одинаковых с виду фасада могут висеть на петле за сто рублей и на петле за тысячу. Разницу вы обнаружите не в салоне, а когда дверца начнёт провисать. Здесь есть выбор, и мы говорим вслух, из чего он состоит."
          />

          <div className="mt-16 grid gap-px overflow-hidden bg-line sm:grid-cols-2 lg:mt-24 lg:grid-cols-3">
            {hardwareGroups.map((h, i) => (
              <Reveal
                key={h.id}
                delay={Math.min(i, 5) * 40}
                className="flex h-full flex-col bg-bone p-8 sm:p-10"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[1.1875rem] text-ink">
                    {h.title}
                  </h3>
                  <span className="label-xs shrink-0 text-stone">
                    {h.count}
                  </span>
                </div>
                <p className="mt-3 grow text-[0.9375rem] leading-relaxed text-stone">
                  {h.text}
                </p>
                {h.brands.length > 0 ? (
                  <p className="mt-5 border-t border-line pt-4 text-[0.875rem] text-stone">
                    <span className="text-ink">От базовых к верхним:</span>{' '}
                    {h.brands.join(' → ')}
                  </p>
                ) : null}
              </Reveal>
            ))}

            {/* Шесть карточек ровно закрывают два ряда по три — третий
                ряд отдан самой фурнитуре. Подписи честные: это кадры
                с наших объектов, а не иллюстрации к конкретной марке */}
            {(['brassGola', 'openNiche', 'woodBacksplash'] as const).map(
              (id) => (
                <CropFrame
                  key={id}
                  crop={crops[id]}
                  ratio="aspect-16/10 sm:aspect-4/3"
                  caption
                />
              ),
            )}
          </div>

          <MarginNote author="Роберт" className="mt-12">
            Мы не ставим всем подряд самую дорогую фурнитуру и не делаем
            вид, что ставим. На замере честно скажем, где переплата
            окупится, а где вы просто заплатите за название.
          </MarginNote>
        </div>
      </Section>

      {/* После двух подряд разделов с мелкими карточками глазу нужен
          один большой кадр — иначе страница читается как таблица */}
      {band ? (
        <PhotoBand
          image={band.image}
          alt={band.alt}
          overlay="quote"
          height="lg"
          caption="Материалы выбираются не по названию в прайсе, а по тому, как они выглядят вместе в вашем свете."
        />
      ) : null}

      {/* Каталог фрезеровок: имена, а не картинки. Превью в исходнике —
          развороты каталога производства, их публикация требует
          отдельного разрешения правообладателя. */}
      <Section tone="cream" aria-labelledby="millings-title">
        <div className="container-page">
          <SectionHeading
            id="millings-title"
            eyebrow="Фрезеровки"
            title={`${millings.length} рисунков фасада — и все можно посмотреть вживую`}
            lead="Фрезеровка — это рельеф, выбранный на плите МДФ. Она определяет характер кухни сильнее, чем цвет: одна и та же белая кухня с «Аркой» и со «Стрит» выглядит как мебель из разных эпох. Образцы привозим на замер."
          />

          <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-16">
            {millingGroups.map(([category, items]) => (
              <Reveal key={category}>
                <div className="flex items-baseline justify-between border-b border-line pb-3">
                  <h3 className="font-display text-[1.1875rem] text-ink">
                    {category} категория
                  </h3>
                  <span className="label-xs text-stone">{items.length} шт</span>
                </div>
                <ul className="mt-5 flex flex-wrap gap-x-2.5 gap-y-2">
                  {items.map((m) => (
                    <li
                      key={m.slug}
                      className="border border-line bg-bone px-3 py-1.5 text-[0.9375rem] text-ink"
                    >
                      {m.name}
                      {m.coatings.length === 1 ? (
                        <span className="ml-2 text-[0.75rem] text-stone">
                          только {m.coatings[0]}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-stone">
              Категория — это сложность рисунка: чем она выше, тем дороже
              обходится фасад. Разброс между первой и четвёртой заметный, и
              на большой кухне выбор фрезеровки влияет на смету не меньше,
              чем выбор цвета. Что именно вы выиграете или потеряете в
              деньгах на своём метраже — посчитаем на замере.
            </p>
          </Reveal>

          {/* Шестьдесят названий фрезеровок подряд — самая «списочная»
              часть сайта. Ответ на неё и буквальный, и зрительный:
              Катя протягивает образец прямо в объектив */}
          <div className="mt-14 grid gap-10 border-t border-line pt-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-16">
            <Reveal>
              <figure className="relative aspect-4/5 overflow-hidden bg-sand">
                <Image
                  src={assetUrl(teamShots.katyaSample.src)}
                  alt={teamShotAlt.katyaSample}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 34vw"
                  placeholder={
                    teamShots.katyaSample.blurDataURL ? 'blur' : 'empty'
                  }
                  blurDataURL={teamShots.katyaSample.blurDataURL || undefined}
                  className="object-cover"
                />
              </figure>
            </Reveal>

            <MarginNote author="Катя">
              Названия вам ничего не скажут, и это нормально. На замере мы
              привозим образцы и прикладываем их к стене — выбирать по
              картинке в интернете бессмысленно.
            </MarginNote>
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
                    src={assetUrl(shot.image.src)}
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
                stacked
                eyebrow="Столешницы"
                title="То, с чем вы контактируете каждый день"
                lead="Столешница принимает на себя воду, нагрев, ножи и вес. Здесь разница между материалами чувствуется быстрее всего."
              />
              <div className="mt-9 grid gap-5 sm:grid-cols-2">
                {countertopLines.map((c) => (
                  <div key={c.id} className="bg-cream p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-[1.0625rem] text-ink">
                        {c.title}
                      </h3>
                      <span className="label-xs text-stone">{c.count}</span>
                    </div>
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-stone">
                      {c.text}
                    </p>
                    <p className="mt-3 text-[0.8125rem] text-stone">
                      {c.brands.join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              <dl className="mt-9 grid gap-6">
                {tops.map((t) => (
                  <div key={t.title} className="flex items-start gap-5">
                    <CropFrame
                      crop={crops[t.shot]}
                      ratio="aspect-square"
                      sizes="80px"
                      className="w-20 shrink-0"
                    />
                    <div>
                      <dt className="font-semibold text-ink">{t.title}</dt>
                      <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-stone">
                        {t.text}
                      </dd>
                    </div>
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
                    src={assetUrl(shot2.image.src)}
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
