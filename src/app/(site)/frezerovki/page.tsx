import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { MarginNote } from '@/components/ui/MarginNote';
import { FinalCta } from '@/components/sections/FinalCta';
import { Faq } from '@/components/sections/Faq';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { assetUrl, pickImage } from '@/lib/content/images';
import { getVisibleProjects } from '@/lib/content/store';
import { PhotoBand } from '@/components/PhotoBand';
import {
  millings,
  millingCategories,
  millingsByCategory,
  millingImage,
  MILLING_IMAGE_WIDTH,
  MILLING_IMAGE_HEIGHT,
} from '@/data/millings';
import { millingRoom, millingRoomCount } from '@/data/milling-rooms';
import { RenderBadge } from '@/components/ui/RenderBadge';

export const metadata: Metadata = {
  title: 'Фрезеровки фасадов',
  description:
    'Каталог фрезеровок фасадов для кухни на заказ в Твери: 60 рисунков в четырёх категориях, выкраски и кадры целых кухонь в каждом рисунке.',
  alternates: { canonical: '/frezerovki' },
  openGraph: {
    images: [
      {
        url: '/og-materialy.jpg',
        width: 1200,
        height: 630,
        alt: 'Фрезеровки фасадов для кухни на заказ',
      },
    ],
  },
};

/**
 * СТРАНИЦА «ФРЕЗЕРОВКИ»
 * =====================
 * Раздел, которого людям не хватало больше всего: на «Материалах»
 * фрезеровки существовали в виде списка имён. Имя «Пирамида» ничего
 * не говорит, пока не увидишь, что это за рельеф и как он живёт на
 * целой кухне при боковом свете.
 *
 * Поэтому у каждого рисунка здесь выкраска из каталога фабрики, а у
 * части рисунков — ещё и кадр целой кухни в этой фрезеровке. Таких
 * кадров пока меньше, чем рисунков, и это честно сказано в тексте:
 * врать про «фото наших работ» нельзя, в портфолио лежат именно
 * объекты с адресами проектов.
 */
export default async function MillingsPage() {
  const projects = await getVisibleProjects();
  const band = pickImage(projects, 'kuhnya-neoklassika-greyzh', 5);
  /* Обложка раздела — настоящая кухня с рельефными фасадами: страница
     про рисунок фрезы, и начинаться она должна с рельефа, а не
     с пустого кремового листа. */
  const heroShot = pickImage(projects, 'kompaktnaya-kuhnya-zelenye-reyki', 2);

  return (
    <>
      <PageHero
        eyebrow="Фрезеровки"
        title={`${millings.length} рисунков фасада`}
        lead="Фрезеровка — рельеф, выбранный фрезой в плите МДФ. Она определяет характер кухни сильнее цвета: одна и та же белая кухня с «Аркой» и со «Стрит» выглядит как мебель из разных эпох. Здесь весь каталог целиком."
        breadcrumbs={[
          { name: 'Материалы', href: '/materialy' },
          { name: 'Фрезеровки' },
        ]}
        image={heroShot?.image}
        imageAlt=""
        imagePosition="object-[50%_62%]"
      >
        <CtaButton
          source="millings-top"
          variant="light-solid"
          size="lg"
          withArrow
          modalTitle="Привезти образцы фрезеровок"
          modalLead="Скажите, какие рисунки интересны, — привезём образцы на замер. Замер и проект бесплатные, без обязательств."
          submitLabel="Записаться на замер"
        >
          Посмотреть образцы вживую
        </CtaButton>
      </PageHero>

      {/* Три вещи, которые нужно понять до того, как листать каталог */}
      <Section tone="bone" aria-labelledby="millings-how-title">
        <div className="container-page">
          <SectionHeading
            id="millings-how-title"
            eyebrow="Как это устроено"
            title="Что стоит знать до выбора рисунка"
          />

          <div className="mt-14 grid gap-x-14 gap-y-10 lg:mt-16 lg:grid-cols-3">
            {[
              {
                index: '01',
                title: 'Категория — это сложность, а не рубли',
                text: 'Все рисунки разложены по четырём категориям. Чем выше категория, тем дольше фреза идёт по полотну и тем дороже выходит фасад. Конкретную цифру считает прайс фабрики на ваших размерах — публиковать его мы не вправе, но на замере назовём разницу по вашей кухне.',
              },
              {
                index: '02',
                title: 'ПВХ или эмаль — разные возможности',
                text: 'Часть рисунков делается и в плёнке ПВХ, и в эмали, часть — только в эмали: плёнка не ложится в глубокий рельеф. У каждой карточки это подписано, так что выбор рисунка и выбор покрытия нужно делать вместе.',
              },
              {
                index: '03',
                title: 'У рисунка есть границы по размеру',
                text: 'Фрезеровка задаёт минимальные и максимальные габариты фасада. На кухне до потолка это важнее, чем кажется: иногда именно рисунок решает, будет ли верхний ряд одной дверью или двумя.',
              },
            ].map((item) => (
              <Reveal
                key={item.index}
                className="border-t border-goldline/45 pt-6"
              >
                <p className="label-xs text-gold">{item.index}</p>
                <h3 className="font-display mt-5 text-sub leading-snug text-ink">
                  {item.title}
                </h3>
                <p className="mt-4 text-ui leading-relaxed text-stone">
                  {item.text}
                </p>
              </Reveal>
            ))}
          </div>

          <MarginNote author="Роберт" className="mt-14">
            Самая частая ошибка — выбирать рисунок по названию в списке.
            «Арка» и «Арка Р» звучат как одно и то же, а выглядят по-разному.
            Поэтому ниже у каждого рисунка стоит его выкраска, а у части —
            целая кухня: так видно, что рельеф делает со светом.
          </MarginNote>
        </div>
      </Section>

      {/* Каталог по категориям */}
      {millingCategories.map((category, categoryIndex) => {
        const items = millingsByCategory(category.id);
        if (items.length === 0) return null;

        return (
          <Section
            key={category.id}
            tone={categoryIndex % 2 === 0 ? 'cream' : 'bone'}
            aria-labelledby={`millings-cat-${category.id}`}
          >
            <div className="container-page">
              <SectionHeading
                id={`millings-cat-${category.id}`}
                index={`0${category.id}`}
                eyebrow={`${items.length} рисунков`}
                title={category.title}
                lead={category.text}
              />

              <ul className="mt-14 grid grid-flow-row-dense gap-5 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
                {items.map((m) => {
                  const room = millingRoom(m.slug);

                  return (
                    <li
                      key={m.slug}
                      className={room ? 'sm:col-span-2' : undefined}
                      id={`frezerovka-${m.slug}`}
                    >
                      <Reveal className="flex h-full flex-col border border-line bg-cream">
                        {room ? (
                          <div className="relative aspect-3/2 overflow-hidden bg-sand">
                            <Image
                              src={room.image}
                              alt={room.alt}
                              fill
                              loading="lazy"
                              placeholder="blur"
                              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, 66vw"
                              className="object-cover"
                            />
                            {/* Интерьер — проектная визуализация, выкраска рядом — настоящая */}
                            <RenderBadge className="bottom-3 left-auto right-3" />
                            {/* Выкраска поверх кадра: рядом сразу видно,
                                что именно фрезеровано и как это выглядит
                                на целой кухне */}
                            <div className="absolute bottom-0 left-0 w-28 border-r border-t border-line bg-cream p-2 sm:w-36 sm:p-3">
                              <Image
                                src={assetUrl(millingImage(m.slug))}
                                alt={`Выкраска фрезеровки «${m.name}»`}
                                width={MILLING_IMAGE_WIDTH}
                                height={MILLING_IMAGE_HEIGHT}
                                loading="lazy"
                                sizes="144px"
                                className="h-auto w-full"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-bone p-4">
                            <Image
                              src={assetUrl(millingImage(m.slug))}
                              alt={`Фрезеровка «${m.name}»: витрина и глухой фасад`}
                              width={MILLING_IMAGE_WIDTH}
                              height={MILLING_IMAGE_HEIGHT}
                              loading="lazy"
                              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
                              className="h-auto w-full"
                            />
                          </div>
                        )}

                        <div className="flex grow flex-col p-6 sm:p-7">
                          <div className="flex items-baseline justify-between gap-4">
                            <h3 className="font-display text-big text-ink">
                              {m.name}
                            </h3>
                            <span className="label-xs shrink-0 text-stone">
                              {m.category} кат.
                            </span>
                          </div>

                          {room ? (
                            <p className="mt-3 text-ui leading-relaxed text-stone">
                              {room.caption}
                            </p>
                          ) : null}

                          <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-small text-stone">
                            <div className="flex gap-1.5">
                              <dt className="sr-only">Покрытие</dt>
                              <dd>
                                {m.coatings.length === 1
                                  ? `только ${m.coatings[0]}`
                                  : m.coatings.join(' или ')}
                              </dd>
                            </div>
                            <div className="flex gap-1.5">
                              <dt className="sr-only">Толщина плиты</dt>
                              <dd>МДФ {m.thickness} мм</dd>
                            </div>
                          </dl>
                        </div>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Section>
        );
      })}

      {band ? (
        <PhotoBand
          image={band.image}
          alt={band.alt}
          overlay="quote"
          height="md"
          caption="Рисунок выбирают глазами и руками. Образцы привозим на замер — вместе с цветом и фурнитурой, чтобы смотреть всё в вашем свете."
        />
      ) : null}

      {/* Честная сноска про природу кадров */}
      <Section tone="ink" aria-labelledby="millings-honest-title">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
            <div>
              <SectionHeading
                tone="light"
                id="millings-honest-title"
                eyebrow="Честно"
                title="Что именно вы видите на этой странице"
                stacked
              />
              <div className="mt-10 grid gap-5 text-cream/75">
                <p>
                  Маленькие выкраски — изображения из каталога фабрики, которая
                  делает нам фасады. Один и тот же рисунок там показан дважды:
                  витриной и глухим полотном.
                </p>
                <p>
                  Кадры целых кухонь собраны для всех{' '}
                  {millingRoomCount === millings.length
                    ? millings.length
                    : `${millingRoomCount} из ${millings.length}`}{' '}
                  рисунков: они показывают, как рельеф ведёт себя в цвете и при
                  боковом свете. Это иллюстрации рисунка, а не фотографии сданных
                  заказов — наши работы лежат в портфолио, у каждой свой адрес и
                  своя история.
                </p>
                <p>
                  Цвет, фурнитура и столешница на этих кадрах подобраны нами, а
                  не заданы фабрикой: тот же рисунок можно покрасить в любой
                  другой цвет. Приглянулся конкретный — напишите, привезём
                  образец и соберём с ним ваш проект.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-end border-l border-cream/15 pl-8 lg:pl-12">
              <p className="font-display text-sub leading-snug text-cream">
                Не угадывайте рисунок по названию
              </p>
              <p className="mt-4 text-ui leading-relaxed text-cream/70">
                Назовите два-три варианта, которые приглянулись, — привезём
                образцы на замер и приложим их к вашему цвету. Расчёт и проект
                бесплатные.
              </p>
              <div className="mt-8">
                <CtaButton
                  source="millings-honest"
                  variant="light-solid"
                  size="md"
                  withArrow
                  modalTitle="Показать образцы фрезеровок"
                  modalLead="Напишите, какие рисунки интересны. Привезём образцы на замер и покажем, как они выглядят в вашем цвете."
                  submitLabel="Записаться на замер"
                >
                  Обсудить рисунок
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Faq limit={4} tone="cream" />

      <FinalCta
        title="Подберём рисунок под вашу кухню"
        source="millings-final"
        submitLabel="Обсудить фрезеровку"
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Материалы', url: '/materialy' },
          { name: 'Фрезеровки', url: '/frezerovki' },
        ]}
      />
    </>
  );
}
