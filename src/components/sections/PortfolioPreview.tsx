import { ButtonLink } from '../ui/Button';
import { CtaButton } from '../CtaButton';
import { ProjectCard } from '../ProjectCard';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getVisibleProjects } from '@/lib/content/store';

/**
 * ПОРТФОЛИО НА ГЛАВНОЙ
 * ====================
 * Раньше здесь показывались шесть работ из восемнадцати — две трети
 * портфолио оставались за кадром, хотя именно за ним на такой сайт
 * и заходят.
 *
 * Теперь лента показывает всё. Чтобы длинный список не превратился в
 * однообразную сетку, кадры идут повторяющимся ритмом из трёх рядов:
 * широкий с узким, узкий с широким, два равных. Строки смещены по
 * вертикали — взгляд идёт зигзагом и не устаёт.
 */

// Ширина колонки и вертикальное смещение для каждого места в ритме
const rhythm = [
  { span: 'lg:col-span-7', offset: '', ratio: 'aspect-4/3' },
  { span: 'lg:col-span-5', offset: 'lg:mt-24', ratio: 'aspect-4/5' },
  { span: 'lg:col-span-5', offset: '', ratio: 'aspect-4/5' },
  { span: 'lg:col-span-7', offset: 'lg:mt-16', ratio: 'aspect-4/3' },
  { span: 'lg:col-span-6', offset: '', ratio: 'aspect-3/2' },
  { span: 'lg:col-span-6', offset: 'lg:mt-20', ratio: 'aspect-3/2' },
];

export async function PortfolioPreview({ limit }: { limit?: number } = {}) {
  const all = await getVisibleProjects();
  const projects = limit ? all.slice(0, limit) : all;
  if (projects.length === 0) return null;
  const trimmed = projects.length < all.length;

  return (
    <Section tone="bone" aria-labelledby="portfolio-title">
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="03"
            id="portfolio-title"
            eyebrow="Проекты"
            title="Разные бюджеты, разные метражи, один подход"
            lead="От компактной кухни в углу до кухни-гостиной с островом. Посмотрите, как решались задачи, похожие на вашу."
          />
          <ButtonLink
            href="/portfolio"
            variant="outline"
            size="md"
            withArrow
            className="shrink-0 max-lg:w-full"
          >
            {trimmed ? `Все ${all.length} проектов` : 'Открыть портфолио'}
          </ButtonLink>
        </div>

        <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-6">
          {projects.map((project, i) => {
            const slot = rhythm[i % rhythm.length];
            return (
              <Reveal
                key={project.slug}
                delay={(i % 2) * 60}
                className={`${slot.span} ${slot.offset}`}
              >
                <ProjectCard
                  project={project}
                  priority={i < 2}
                  ratio={slot.ratio}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 46vw"
                />
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-24 border-t border-line pt-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
              variant="primary"
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
