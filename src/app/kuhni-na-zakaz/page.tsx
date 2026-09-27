import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { ProjectCard } from '@/components/ProjectCard';
import { CtaButton } from '@/components/CtaButton';
import { Reveal } from '@/components/ui/Reveal';
import { Section, SectionHeading } from '@/components/ui/Section';
import { Details } from '@/components/sections/Details';
import { Process } from '@/components/sections/Process';
import { Price } from '@/components/sections/Price';
import { Timing } from '@/components/sections/Timing';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/JsonLd';
import { featuredProjects } from '@/data/projects';
import shot from '@public/images/kitchens/kitchen-05.webp';

export const metadata: Metadata = {
  title: 'Кухни на заказ в Твери — проект, производство и сборка',
  description:
    'Кухни на заказ в Твери по вашим размерам: бесплатное проектирование и визуализация, схемы электрики, производство, доставка и сборка. Гарантия 24 месяца, оплата 50/50. Роберт и Катя ведут проект лично.',
  alternates: { canonical: '/kuhni-na-zakaz' },
};

const layouts = [
  {
    title: 'Прямые кухни',
    text: 'Один фронт вдоль стены. Подходит для узких помещений и кухонь-гостиных, где важно не занимать комнату мебелью.',
  },
  {
    title: 'Угловые кухни',
    text: 'Самое частое решение для типовых квартир: короткие расстояния между мойкой, плитой и холодильником.',
  },
  {
    title: 'П-образные кухни',
    text: 'Максимум рабочей поверхности и хранения. Требует точности в размерах — ошибка видна сразу.',
  },
  {
    title: 'Кухни с островом',
    text: 'Для просторных помещений и кухонь-гостиных. Остров работает как рабочая зона, бар и место общения.',
  },
];

const includes = [
  'Выезд на замер и фиксация всех размеров, коробов и выводов',
  'Планировка и эргономика с учётом того, как вы готовите',
  'Визуализация — вы видите кухню до оплаты',
  'Подбор материалов, фурнитуры и наполнения',
  'Схема электрики для вашего мастера',
  'Согласование техники и проверка зазоров',
  'Производство по вашим размерам',
  'Доставка и сборка в Твери',
  'Гарантия 24 месяца и связь после установки',
];

export default function KitchensPage() {
  return (
    <>
      <PageHero
        eyebrow="Кухни на заказ · Тверь"
        title="Кухня, спроектированная под вашу квартиру и ваши привычки"
        lead="Не «подбор из каталога под ваши размеры», а проект с нуля: где что стоит, что куда открывается, где розетка для чайника и почему именно здесь. Проектирование бесплатное."
        breadcrumbs={[{ name: 'Кухни' }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <CtaButton
            source="kitchens-top"
            variant="brass"
            size="lg"
            withArrow
            className="max-sm:w-full"
            modalTitle="Рассчитаем вашу кухню"
            modalLead="Расскажите про помещение — посмотрим, что реально сделать, и посчитаем стоимость. Бесплатно и без обязательств."
            submitLabel="Рассчитать мою кухню"
          >
            Рассчитать мою кухню
          </CtaButton>
        </div>
      </PageHero>

      <div className="container-page">
        <div className="relative aspect-16/9 overflow-hidden rounded-lg bg-sand sm:aspect-21/9">
          <Image
            src={shot}
            alt="Большая кухня на заказ в частном доме под Тверью: светло-серые фасады, шкафы под дерево, витрины с подсветкой"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1440px) 100vw, 1400px"
            placeholder="blur"
            className="object-cover"
          />
        </div>
      </div>

      {/* Компоновки */}
      <Section tone="cream" aria-labelledby="layouts-title">
        <div className="container-page">
          <SectionHeading
            id="layouts-title"
            eyebrow="Компоновки"
            title="Сначала планировка, потом красота"
            lead="Форма кухни определяется не вкусом, а геометрией комнаты, окнами, коммуникациями и тем, сколько людей готовит одновременно."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-2 lg:grid-cols-4">
            {layouts.map((l, i) => (
              <Reveal
                key={l.title}
                delay={i * 50}
                className="flex h-full flex-col bg-cream p-7"
              >
                <h3 className="font-display text-[1.1875rem] text-ink">
                  {l.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  {l.text}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-stone">
              Не знаете, какая компоновка подойдёт? Это как раз то, что мы
              определяем на замере — бесплатно.
            </p>
            <CtaButton
              source="kitchens-layouts"
              variant="primary"
              size="md"
              withArrow
              className="shrink-0 max-sm:w-full"
              modalTitle="Записаться на замер"
              submitLabel="Записаться на замер"
            >
              Записаться на замер
            </CtaButton>
          </Reveal>
        </div>
      </Section>

      {/* Что входит */}
      <Section tone="ink" aria-labelledby="includes-title">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHeading
              id="includes-title"
              tone="light"
              eyebrow="Что входит в работу"
              title="Всё, что между «хочу новую кухню» и «кухня стоит»"
              lead="Отдельно за проект, визуализацию и схемы электрики мы не берём денег. Это часть работы, а не платная опция."
            />
            <ul className="grid gap-4 sm:grid-cols-2">
              {includes.map((item, i) => (
                <li key={item}>
                  <Reveal
                    delay={Math.min(i, 5) * 40}
                    className="flex h-full gap-3.5 rounded-md border border-cream/12 bg-cream/[0.03] p-5 text-cream/75"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-brasslight"
                    >
                      <path
                        d="m5 12.5 4.5 4.5L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[0.9375rem] leading-relaxed">{item}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Работы */}
      <Section tone="bone" aria-labelledby="kitchens-works">
        <div className="container-page">
          <SectionHeading
            id="kitchens-works"
            eyebrow="Наши кухни"
            title="Как это выглядит в жизни"
          />
          <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <ProjectCard project={p} ratio="aspect-4/5" />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Details tone="cream" />
      <Process tone="bone" />
      <Timing tone="cream" />
      <Price tone="bone" />
      <Faq limit={6} tone="cream" />
      <FinalCta
        title="Посчитаем вашу кухню"
        source="kitchens-final"
        submitLabel="Рассчитать мою кухню"
      />

      <FaqJsonLd />
      <BreadcrumbJsonLd items={[{ name: 'Кухни', url: '/kuhni-na-zakaz' }]} />
    </>
  );
}
