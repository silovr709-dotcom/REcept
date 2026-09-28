import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent } from '@/lib/content/store';

/**
 * ЦЕНТРАЛЬНЫЙ ПРОДАЮЩИЙ БЛОК.
 * Главная мысль: чтобы получить хорошую кухню, не нужно самому
 * становиться специалистом по кухням и координатором стройки.
 */
export async function Headache() {
  const { headache } = await getContent('texts');

  return (
    <Section tone="ink" aria-labelledby="headache-title">
      <div className="container-page">
        <SectionHeading
          id="headache-title"
          tone="light"
          eyebrow={headache.eyebrow}
          title={headache.title}
          lead={headache.lead}
        />

        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          <Reveal className="rounded-lg border border-cream/12 bg-cream/[0.03] p-7 sm:p-9">
            <h3 className="text-eyebrow font-bold uppercase text-cream/60">
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
                    className="mt-1 shrink-0 text-cream/25"
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
            className="rounded-lg border border-brass/35 bg-linear-to-b from-brass/12 to-transparent p-7 sm:p-9"
          >
            <h3 className="text-eyebrow font-bold uppercase text-brasslight">
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
                    className="mt-1 shrink-0 text-brasslight"
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

        <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-lead text-cream/70">
            Ваша задача — рассказать, как вы живёте. Всё остальное мы возьмём на
            себя.
          </p>
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
