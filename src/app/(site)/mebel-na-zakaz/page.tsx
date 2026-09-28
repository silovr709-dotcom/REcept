import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Details } from '@/components/sections/Details';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleDetails, getVisibleProjects } from '@/lib/content/store';
import { rooms } from '@/data/rooms';
import { pickImage } from '@/lib/content/images';

export const metadata: Metadata = {
  title: 'Гардеробные и шкафы на заказ',
  description:
    'Корпусная мебель на заказ в Твери: гардеробные, шкафы, мебель для ванной и прихожей. Бесплатный проект, гарантия 24 месяца, доставка и сборка в Твери.',
  alternates: { canonical: '/mebel-na-zakaz' },
  openGraph: {
    images: [{ url: '/og-mebel.jpg', width: 1200, height: 630, alt: 'Гардеробные и шкафы на заказ в Твери' }],
  },
};



export default async function FurniturePage() {
  const [details, projects] = await Promise.all([
    getVisibleDetails(),
    getVisibleProjects(),
  ]);
  const craftDetails = details.slice(0, 6);
  const shot = pickImage(projects, 'kuhnya-neoklassika-greyzh', 5);

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

          <div className="mt-14 grid gap-x-8 gap-y-16 lg:grid-cols-2">
            {rooms.map((room, i) => (
              <Reveal key={room.id} delay={Math.min(i, 3) * 60}>
                <div className="media-reveal relative aspect-4/3 overflow-hidden bg-sand">
                  <Image
                    src={room.image}
                    alt={room.alt}
                    fill
                    loading={i < 2 ? undefined : 'lazy'}
                    priority={i < 2}
                    sizes="(max-width: 1023px) 100vw, 46vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-display mt-7 text-h3 text-ink">{room.title}</h3>
                <p className="mt-3 max-w-lg text-stone">{room.text}</p>
                <ul className="mt-6 grid gap-2.5 border-t border-line pt-5">
                  {room.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[0.9375rem] text-stone">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1 shrink-0 rounded-full bg-ink/40"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Details
        tone="bone"
        items={craftDetails}
        columns={3}
        eyebrow="Как это сделано"
        title="Хранение, подсветка и фурнитура — те же, что и в кухнях"
        lead="Гардеробные и шкафы делаются из тех же материалов и с той же фурнитурой, что и кухни, и проходят тот же контроль. Пока в портфолио опубликованы кухни — вот фрагменты, по которым видно уровень работы."
        showCta={false}
      />

      {/* Честно про фотографии */}
      <Section tone="ink">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <Reveal>
              <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-coal">
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
              <p className="mt-3 text-sm text-cream/60">
                На изображении — проект кухни. Гардеробные и шкафы мы делаем
                из тех же материалов и с той же фурнитурой.
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
