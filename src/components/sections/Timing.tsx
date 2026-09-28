import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent } from '@/lib/content/store';

/**
 * ЧЕСТНАЯ ПРИЧИНА НЕ ОТКЛАДЫВАТЬ.
 * Никаких таймеров и «скидок только сегодня». Просто объясняем реальную
 * логику: чем раньше начат проект кухни, тем больше решений ещё возможно.
 */


export async function Timing({ tone = 'cream' }: { tone?: 'cream' | 'bone' }) {
  const { timing } = await getContent('texts');
  const stages = timing.stages;
  return (
    <Section tone={tone} aria-labelledby="timing-title">
      <div className="container-page">
        <SectionHeading
          id="timing-title"
          eyebrow="Когда к нам приходить"
          title={timing.title}
          lead={timing.lead}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {stages.map((s, i) => (
            <Reveal
              key={s.stage}
              delay={i * 60}
              className={`flex h-full flex-col pt-7 ${
                s.best ? 'border-t-2 border-ink' : 'border-t border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-[1.25rem] text-ink">{s.stage}</h3>
                <span
                  className={`label-xs shrink-0 ${s.best ? 'text-ink' : 'text-stone'}`}
                >
                  {s.mark}
                </span>
              </div>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-stone">
                {s.text}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-stone">
            Не уверены, на каком вы этапе? Напишите — скажем честно, стоит ли
            начинать сейчас или лучше вернуться через месяц.
          </p>
          <CtaButton
            source="timing"
            variant="primary"
            size="md"
            withArrow
            className="shrink-0 max-sm:w-full"
            modalTitle="Когда лучше начать?"
            modalLead="Расскажите, на каком этапе ремонт. Подскажем, что имеет смысл сделать прямо сейчас, а что подождёт."
            submitLabel="Спросить про сроки"
          >
            Спросить про сроки
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
