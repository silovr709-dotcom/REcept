import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/PageHero';
import { ProjectCard } from '@/components/ProjectCard';
import { ZoomableImage } from '@/components/ZoomableImage';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleDetails, getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getVisibleProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [projects, site] = await Promise.all([getVisibleProjects(), getSiteView()]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: 'Проект не найден' };

  const description = `${project.title} — работа мебельного ателье «РЕцепт» в Твери. ${project.summary}. ${project.rationale}`.slice(
    0,
    300,
  );

  return {
    title: `${project.title} — кухня на заказ в Твери`,
    description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: `${project.title} — кухня на заказ в Твери`,
      description,
      images: [{ url: project.image.src, alt: project.alt }],
      url: `${site.url}/portfolio/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [projects, allDetails] = await Promise.all([
    getVisibleProjects(),
    getVisibleDetails(),
  ]);
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug).slice(0, 3);
  const projectDetails = allDetails.filter((d) =>
    project.detailIds.includes(d.id),
  );
  const facts = [
    project.area ? { label: 'Площадь', value: project.area } : null,
    project.term ? { label: 'Срок', value: project.term } : null,
    project.budget ? { label: 'Бюджет', value: project.budget } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <article>
        <section className="bg-cream pb-10 pt-28 lg:pt-36">
          <div className="container-page">
            <Breadcrumbs
              items={[
                { name: 'Портфолио', href: '/portfolio' },
                { name: project.title },
              ]}
            />
            <p className="mt-8 flex items-center gap-3 text-eyebrow font-bold uppercase text-brass">
              <span aria-hidden="true" className="h-px w-6 bg-brass/60" />
              {project.category} · Тверь
            </p>
            <h1 className="font-display mt-5 max-w-4xl text-h1 text-ink">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lead text-stone">
              {project.summary}
            </p>
            <p className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bone px-4 py-2 text-[0.8125rem] font-semibold text-ink">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brass" />
                {project.layout} компоновка
              </span>
            </p>
          </div>
        </section>

        <div className="container-page">
          <ZoomableImage
            image={project.image}
            alt={project.alt}
            caption={`${project.title} — работа ателье «РЕцепт», Тверь`}
            sizes="(max-width: 1440px) 100vw, 1400px"
            priority
            wrapperClassName="aspect-4/3 rounded-lg sm:aspect-16/9"
          />
          <p className="mt-3 text-sm text-stone">
            Нажмите на фотографию, чтобы рассмотреть детали
          </p>
        </div>

        <Section tone="cream">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              <div>
                <h2 className="text-eyebrow font-bold uppercase text-brass">
                  Что здесь решено
                </h2>
                <dl className="mt-8 grid gap-8">
                  {project.solutions.map((s, i) => (
                    <Reveal key={s.title} delay={i * 50}>
                      <dt className="font-display text-h3 text-ink">{s.title}</dt>
                      <dd className="mt-2.5 max-w-xl text-stone">{s.text}</dd>
                    </Reveal>
                  ))}
                </dl>

                {/* Фрагменты: фурнитура, фактуры и стыки крупным планом */}
                {projectDetails.length > 0 ? (
                  <div className="mt-12">
                    <h2 className="text-eyebrow font-bold uppercase text-brass">
                      Детали этого проекта
                    </h2>
                    <ul
                      className={`mt-6 grid gap-4 ${
                        projectDetails.length === 1
                          ? 'grid-cols-1'
                          : 'grid-cols-2 sm:gap-5'
                      }`}
                    >
                      {projectDetails.map((d, i) => (
                        <li key={d.id}>
                          <Reveal delay={Math.min(i, 4) * 40}>
                            <ZoomableImage
                              image={d.image}
                              alt={d.alt}
                              caption={`${d.title} — ${d.note.toLowerCase()}`}
                              sizes="(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 26vw"
                              wrapperClassName={`rounded-md ${
                                projectDetails.length === 1
                                  ? 'aspect-16/9'
                                  : 'aspect-4/3'
                              }`}
                            />
                            <p className="mt-2.5 text-[0.875rem] font-semibold leading-snug text-ink">
                              {d.title}
                            </p>
                            <p className="mt-0.5 text-[0.8125rem] leading-snug text-stone">
                              {d.note}
                            </p>
                          </Reveal>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-12 rounded-lg border-l-2 border-brass bg-bone p-7">
                  <p className="text-eyebrow font-bold uppercase text-brass">
                    Почему так
                  </p>
                  <p className="mt-4 text-lead text-ink">{project.rationale}</p>
                </div>

                {project.clientStory ? (
                  <div className="mt-8 rounded-lg bg-bone p-7">
                    <p className="text-eyebrow font-bold uppercase text-brass">
                      Что получил заказчик
                    </p>
                    <p className="mt-4 text-stone">{project.clientStory}</p>
                  </div>
                ) : null}
              </div>

              <aside>
                <div className="rounded-lg border border-line bg-bone p-7 sm:p-8">
                  <h2 className="text-eyebrow font-bold uppercase text-brass">
                    Материалы и фурнитура
                  </h2>
                  <ul className="mt-6 grid gap-3.5">
                    {project.materials.map((m) => (
                      <li key={m} className="flex gap-3 text-[0.9375rem] text-stone">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1 shrink-0 rounded-full bg-brass"
                        />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>

                  {facts.length > 0 ? (
                    <dl className="mt-7 grid gap-3 border-t border-line pt-6 text-sm">
                      {facts.map((f) => (
                        <div key={f.label} className="flex justify-between gap-4">
                          <dt className="text-stone">{f.label}</dt>
                          <dd className="font-semibold text-ink">{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>

                {/* Возврат к действию сразу после доказательства */}
                <div className="mt-6 rounded-lg bg-ink p-7 text-cream sm:p-8">
                  <h2 className="font-display text-h3 text-cream">
                    Хотите обсудить похожую задачу?
                  </h2>
                  <p className="mt-3 text-cream/65">
                    Скажем честно, что из этого применимо в вашем помещении, а
                    что лучше сделать иначе. Расчёт и проект — бесплатно.
                  </p>
                  <CtaButton
                    source={`project-${project.slug}`}
                    variant="brass"
                    size="lg"
                    withArrow
                    className="mt-6 w-full"
                    modalTitle="Обсудим похожую задачу"
                    modalLead={`Вам понравился проект «${project.title}». Расскажите про своё помещение — посмотрим, что из этих решений подойдёт вам.`}
                    submitLabel="Обсудить похожую задачу"
                  >
                    Обсудить похожую задачу
                  </CtaButton>
                </div>
              </aside>
            </div>
          </div>
        </Section>

        <Section tone="bone">
          <div className="container-page">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-h2 text-ink">Другие работы</h2>
              <Link
                href="/portfolio"
                className="shrink-0 text-sm font-semibold text-brass underline underline-offset-4"
              >
                Все проекты
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} ratio="aspect-4/5" />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </article>

      <FinalCta
        title="Давайте спроектируем вашу"
        source={`project-final-${project.slug}`}
      />

      <BreadcrumbJsonLd
        items={[
          { name: 'Портфолио', url: '/portfolio' },
          { name: project.title, url: `/portfolio/${project.slug}` },
        ]}
      />
    </>
  );
}
