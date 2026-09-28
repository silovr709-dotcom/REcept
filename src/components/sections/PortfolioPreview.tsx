import { ButtonLink } from '../ui/Button';
import { CtaButton } from '../CtaButton';
import { ProjectCard } from '../ProjectCard';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getVisibleProjects } from '@/lib/content/store';

/**
 * Портфолио на главной — это доказательство, а не каталог.
 * Шесть работ, разные задачи и бюджеты, и сразу после — возврат к действию.
 */
export async function PortfolioPreview() {
  const projects = await getVisibleProjects();
  const [a, b, c, d, e, f] = projects.slice(0, 6);

  return (
    <Section tone="bone" aria-labelledby="portfolio-title">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="portfolio-title"
            eyebrow="Наши работы"
            title="Разные бюджеты, разные метражи, один подход"
            lead="От компактной кухни в углу до кухни-гостиной с островом. Посмотрите, как решались задачи, похожие на вашу."
          />
          <ButtonLink
            href="/portfolio"
            variant="outline"
            size="md"
            withArrow
            className="shrink-0 max-sm:w-full"
          >
            Все проекты
          </ButtonLink>
        </div>

        {/* Editorial-сетка: разные размеры кадров задают ритм */}
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-12">
          {a ? (
            <Reveal className="lg:col-span-7">
              <ProjectCard
                project={a}
                ratio="aspect-4/3"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 55vw"
              />
            </Reveal>
          ) : null}

          {b ? (
            <Reveal delay={60} className="lg:col-span-5 lg:mt-16">
              <ProjectCard
                project={b}
                ratio="aspect-4/5"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 40vw"
              />
            </Reveal>
          ) : null}

          {c ? (
            <Reveal className="lg:col-span-4">
              <ProjectCard project={c} ratio="aspect-4/5" />
            </Reveal>
          ) : null}

          {d ? (
            <Reveal delay={60} className="lg:col-span-8 lg:mt-14">
              <ProjectCard
                project={d}
                ratio="aspect-4/3"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 62vw"
              />
            </Reveal>
          ) : null}

          {e ? (
            <Reveal className="lg:col-span-7">
              <ProjectCard project={e} ratio="aspect-16/9" />
            </Reveal>
          ) : null}

          {f ? (
            <Reveal delay={60} className="lg:col-span-5">
              <ProjectCard project={f} ratio="aspect-16/9" />
            </Reveal>
          ) : null}
        </div>

        {/* После визуального доказательства — возврат к действию */}
        <Reveal className="mt-16 rounded-lg border border-line bg-cream p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-h3 text-ink">
                Похожая задача? Давайте посчитаем вашу
              </h3>
              <p className="mt-3 text-stone">
                Пришлите планировку или просто фото помещения — скажем, что
                реально сделать в ваших размерах и сколько это будет стоить.
                Расчёт бесплатный.
              </p>
            </div>
            <CtaButton
              source="portfolio-preview"
              variant="brass"
              size="lg"
              withArrow
              className="shrink-0 max-lg:w-full"
              modalTitle="Обсудим похожую задачу"
              modalLead="Расскажите, какое у вас помещение и что хочется получить. Можно приложить фото или планировку — так разговор будет предметнее."
              submitLabel="Обсудить похожую задачу"
            >
              Обсудить похожую задачу
            </CtaButton>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
