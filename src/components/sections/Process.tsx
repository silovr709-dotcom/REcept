import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { processSteps } from '@/data/content';

/**
 * Процесс снимает страх неизвестности: человек должен понимать,
 * что его ждёт и сколько усилий потребуется лично от него.
 */
export function Process() {
  return (
    <Section tone="cream" id="process" aria-labelledby="process-title">
      <div className="container-page">
        <SectionHeading
          id="process-title"
          eyebrow="Как проходит работа"
          title="Десять шагов, после которых у вас просто есть кухня"
          lead="Мы описали процесс целиком — включая то, что потребуется лично от вас. Обычно этого немного."
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, i) => (
            <li key={step.n}>
              <Reveal
                delay={Math.min(i, 5) * 40}
                className="flex h-full flex-col bg-cream p-6 sm:p-8"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-[1.75rem] leading-none text-brass/80">
                    {step.n}
                  </span>
                  <h3 className="font-display text-[1.1875rem] leading-snug text-ink">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-4 grow text-[0.9375rem] leading-relaxed text-stone">
                  {step.text}
                </p>
                <p className="mt-5 border-t border-line pt-4 text-[0.8125rem] text-stone">
                  <span className="font-semibold text-ink">От вас:</span>{' '}
                  {step.yourEffort}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-12 flex flex-col items-start gap-5 rounded-lg bg-bone p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            <p className="font-display text-h3 text-ink">
              Начинается всё с замера
            </p>
            <p className="mt-2.5 text-stone">
              Приедем, снимем размеры и скажем, что реально помещается. Замер и
              проект — бесплатно, дальше решаете вы.
            </p>
          </div>
          <CtaButton
            source="process"
            variant="primary"
            size="lg"
            withArrow
            className="shrink-0 max-sm:w-full"
            modalTitle="Записаться на замер"
            modalLead="Оставьте контакт и адрес объекта — согласуем удобное время. Замер и проект бесплатные и ни к чему не обязывают."
            submitLabel="Записаться на замер"
          >
            Записаться на замер
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
