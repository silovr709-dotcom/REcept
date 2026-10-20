import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { MarginNote } from '../ui/MarginNote';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';
import { Photo } from '../ui/Photo';

/**
 * ЦЕНТРАЛЬНЫЙ ПРОДАЮЩИЙ БЛОК.
 * Главная мысль: чтобы получить хорошую кухню, не нужно самому
 * становиться специалистом по кухням и координатором стройки.
 */
export async function Headache({ index }: { index?: string } = {}) {
  const [{ headache }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const backdrop = pickImage(projects, 'temno-siniaya-kuhnya-latun', 9);

  return (
    <Section
      tone="ink"
      aria-labelledby="headache-title"
      className="relative isolate overflow-hidden"
    >
      {/* Поле со светом, а не фотография под плотным завалом. Снимок,
          приглушённый до 20% и накрытый градиентом, не читается как
          фотография — он читается как грязь на плоскости. Свет и зерно
          дают ту же глубину честнее и в сто раз легче по весу. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(85%_60%_at_78%_8%,rgba(199,170,112,0.14),transparent_62%),radial-gradient(70%_60%_at_0%_100%,rgba(5,12,24,0.6),transparent_70%)]"
      />

      <div className="container-page">
        <SectionHeading
          index={index}
          id="headache-title"
          tone="light"
          eyebrow={headache.eyebrow}
          title={headache.title}
          lead={headache.lead}
        />

        {/* Было две карточки со скруглением и полупрозрачной заливкой —
            самый узнаваемый элемент бесплатного шаблона. Стало две
            колонки, разделённые линией в один пиксель: тот же смысл,
            но это уже вёрстка разворота, а не интерфейс. */}
        <div className="mt-12 grid gap-x-14 gap-y-10 lg:mt-16 lg:grid-cols-2">
          <Reveal className="border-t border-cream/18 pt-7">
            <h3 className="text-eyebrow font-medium uppercase tracking-[0.18em] text-cream/55">
              Как это обычно происходит
            </h3>
            <ul className="mt-7 grid gap-5">
              {headache.pains.map((pain) => (
                <li key={pain} className="flex gap-4 text-cream/55">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-cream/40"
                  >
                    <path
                      d="M7 7l10 10M17 7L7 17"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={80}
            className="border-t border-goldline/55 pt-7 lg:border-l lg:border-l-cream/12 lg:pl-14"
          >
            <h3 className="text-eyebrow font-medium uppercase tracking-[0.18em] text-goldsoft">
              Как это происходит с «РЕцептом»
            </h3>
            <ul className="mt-7 grid gap-5">
              {headache.reliefs.map((relief) => (
                <li key={relief} className="flex gap-4 text-cream/85">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-goldsoft"
                  >
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{relief}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Главная мысль блока сказана не от лица ателье, а голосом Кати:
            после двух колонок списков человеку нужен живой человек,
            а не ещё один абзац корпоративного текста */}
        <Reveal className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
          <MarginNote author="Катя" tone="light">
            Вам не нужно разбираться в петлях, доводчиках и углах открывания
            двери холодильника. Расскажите, как вы живёте и что вас бесит на
            нынешней кухне, — остальное правда наша работа.
          </MarginNote>
          <CtaButton
            source="headache"
            variant="light"
            size="lg"
            withArrow
            className="w-full shrink-0 sm:w-auto"
            modalTitle="Расскажите про вашу задачу"
            modalLead="Достаточно пары фраз: где кухня, что не устраивает сейчас и чего хочется. Дальше разберёмся вместе."
            submitLabel="Обсудить мою задачу"
          >
            Обсудить мою задачу
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
