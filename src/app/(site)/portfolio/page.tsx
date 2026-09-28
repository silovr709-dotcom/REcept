import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { PortfolioGrid } from '@/components/PortfolioGrid';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { CtaButton } from '@/components/CtaButton';
import { VideoWall } from '@/components/sections/VideoWall';
import { Testimonials } from '@/components/sections/Testimonials';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleProjects } from '@/lib/content/store';
import type { ProjectItem } from '@/lib/content/types';

export const metadata: Metadata = {
  title: 'Портфолио: кухни на заказ в Твери',
  description:
    'Реальные кухни, изготовленные мебельным ателье «РЕцепт» в Твери: компактные кухни, угловые и П-образные, кухни-гостиные с островом. Материалы, решения и подход к каждому проекту.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const projects = await getVisibleProjects();
  const projectLayouts = Array.from(
    new Set(projects.map((p) => p.layout)),
  ) as ProjectItem['layout'][];

  return (
    <>
      <PageHero
        eyebrow="Портфолио"
        title="Кухни, которые уже стоят в квартирах и домах Твери"
        lead="Это не рендеры из каталога, а фотографии наших работ. Откройте любой проект: внутри — материалы, решения и логика, по которой они выбраны."
        breadcrumbs={[{ name: 'Портфолио' }]}
      >
        <CtaButton
          source="portfolio-top"
          variant="brass"
          size="lg"
          withArrow
          className="max-sm:w-full"
          modalTitle="Обсудим вашу кухню"
          modalLead="Расскажите про помещение — подскажем, какие из этих решений подойдут в вашем случае."
          submitLabel="Обсудить мою кухню"
        >
          Обсудить свою кухню
        </CtaButton>
      </PageHero>

      <Section tone="bone">
        <div className="container-page">
          <PortfolioGrid projects={projects} layouts={projectLayouts} />

          <Reveal className="mt-16 rounded-lg border border-line bg-cream p-8 text-center sm:p-12">
            <h2 className="font-display mx-auto max-w-2xl text-h3 text-ink">
              Не нашли похожую задачу? Это нормально — одинаковых кухонь не бывает
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone">
              Пришлите фото помещения или планировку. Посмотрим, что реально
              сделать в ваших размерах, и посчитаем стоимость. Бесплатно.
            </p>
            <CtaButton
              source="portfolio-bottom"
              variant="brass"
              size="lg"
              withArrow
              className="mt-7 max-sm:w-full"
              modalTitle="Посмотрим вашу задачу"
              modalLead="Можно приложить фото помещения или планировку — так разговор будет предметнее."
              submitLabel="Показать моё помещение"
            >
              Показать своё помещение
            </CtaButton>
          </Reveal>
        </div>
      </Section>

      <VideoWall />
      <Testimonials tone="cream" />

      <FinalCta
        title="С какой из этих кухонь начнём вашу?"
        source="portfolio-final"
      />
      <BreadcrumbJsonLd items={[{ name: 'Портфолио', url: '/portfolio' }]} />
    </>
  );
}
