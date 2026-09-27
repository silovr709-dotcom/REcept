import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import shot from '@public/images/kitchens/kitchen-06.webp';

export const metadata: Metadata = {
  title: 'Гардеробные, шкафы и мебель на заказ в Твери',
  description:
    'Корпусная мебель на заказ в Твери: гардеробные, шкафы-купе и распашные шкафы, мебель для ванной, прихожих, детских и рабочих зон. Проект бесплатно, гарантия 24 месяца, доставка и сборка.',
  alternates: { canonical: '/mebel-na-zakaz' },
};

const rooms = [
  {
    title: 'Гардеробные',
    text: 'Система хранения по вашим вещам, а не по стандартной сетке: высоты штанг, глубины полок, места под обувь, чемоданы и гладильную доску.',
    points: ['Открытые и закрытые системы', 'Наполнение под ваш гардероб', 'Подсветка полок и штанг'],
  },
  {
    title: 'Шкафы',
    text: 'Распашные и купе, встроенные в нишу или отдельно стоящие. До потолка — чтобы не оставалось пыльной зоны сверху.',
    points: ['Встроенные в нишу', 'До потолка, без антресольной щели', 'Двери в цвет стен или контрастом'],
  },
  {
    title: 'Мебель для ванной',
    text: 'Тумбы под раковину, пеналы и зеркальные шкафы во влагостойком исполнении, подогнанные по месту и коммуникациям.',
    points: ['Влагостойкие материалы', 'Подрез под трубы и сифон', 'Подвесные и напольные варианты'],
  },
  {
    title: 'Прихожие, детские, рабочие зоны',
    text: 'Всё остальное, что делается из корпусной мебели: от небольшой входной группы до стола и стеллажа в кабинете.',
    points: ['Единая стилистика с кухней', 'Нестандартные габариты', 'Подгонка по кривым стенам'],
  },
];

export default function FurniturePage() {
  return (
    <>
      <PageHero
        eyebrow="Другие помещения · Тверь"
        title="Не только кухни: гардеробные, шкафы и мебель для остальных комнат"
        lead="Чаще всего это заказывают вместе с кухней — в одной стилистике, из тех же материалов и с одной ответственностью. Но можно и отдельно."
        breadcrumbs={[{ name: 'Другие помещения' }]}
      >
        <CtaButton
          source="furniture-top"
          variant="brass"
          size="lg"
          withArrow
          className="max-sm:w-full"
          modalTitle="Расскажите, что нужно сделать"
          modalLead="Гардеробная, шкаф, мебель для ванной или что-то ещё — опишите задачу, посмотрим и посчитаем. Бесплатно."
          submitLabel="Обсудить мой проект"
        >
          Обсудить мой проект
        </CtaButton>
      </PageHero>

      <Section tone="cream" aria-labelledby="rooms-title">
        <div className="container-page">
          <SectionHeading
            id="rooms-title"
            eyebrow="Направления"
            title="Что мы делаем кроме кухонь"
            lead="Подход тот же: сначала разбираемся, что и как вы храните, потом рисуем, потом производим."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {rooms.map((room, i) => (
              <Reveal
                key={room.title}
                delay={Math.min(i, 3) * 50}
                className="flex h-full flex-col rounded-lg border border-line bg-bone p-7 sm:p-9"
              >
                <h3 className="font-display text-h3 text-ink">{room.title}</h3>
                <p className="mt-4 text-stone">{room.text}</p>
                <ul className="mt-6 grid gap-2.5 border-t border-line pt-5">
                  {room.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[0.9375rem] text-stone">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1 shrink-0 rounded-full bg-brass"
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Честно про фотографии */}
      <Section tone="ink">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal>
              <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-coal">
                <Image
                  src={shot}
                  alt="Кухня в стиле неоклассики, изготовленная ателье «РЕцепт» — пример работы с материалами и фурнитурой"
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  placeholder="blur"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-cream/60">
                На фото — наша кухня. Фотографии гардеробных и шкафов мы
                опубликуем здесь по мере съёмки: показывать чужие работы вместо
                своих не хочется.
              </p>
            </Reveal>

            <div>
              <h2 className="font-display text-h2 text-cream">
                Одна бригада на всю квартиру
              </h2>
              <div className="mt-6 grid gap-4 text-lead text-cream/70">
                <p>
                  Когда кухню, гардеробную и шкаф в прихожей делают три разные
                  компании, вы получаете три разных оттенка «белого», три срока
                  и три версии того, кто виноват.
                </p>
                <p>
                  Когда всё делаем мы — материалы совпадают, стилистика единая, а
                  спрашивать нужно с одних и тех же людей.
                </p>
              </div>
              <CtaButton
                source="furniture-mid"
                variant="light"
                size="lg"
                withArrow
                className="mt-9 max-sm:w-full"
                modalTitle="Посчитаем мебель для всей квартиры"
                modalLead="Напишите, какие помещения нужно закрыть мебелью. Посмотрим объём и предложим порядок работ."
                submitLabel="Обсудить проект"
              >
                Обсудить проект
              </CtaButton>
            </div>
          </div>
        </div>
      </Section>

      <Faq limit={5} />
      <FinalCta
        title="Расскажите, что нужно сделать"
        lead="Гардеробная, шкаф, мебель для ванной или комплект на всю квартиру — опишите задачу. Мы посмотрим помещение, предложим решение и посчитаем стоимость. Бесплатно и без обязательств."
        submitLabel="Обсудить мой проект"
        source="furniture-final"
      />

      <BreadcrumbJsonLd
        items={[{ name: 'Другие помещения', url: '/mebel-na-zakaz' }]}
      />
    </>
  );
}
