import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { objections } from '@/data/content';

/**
 * Снимаем главные страхи до того, как человек успеет закрыть вкладку.
 */
export function Objections({ tone = 'cream' }: { tone?: 'cream' | 'bone' }) {
  return (
    <Section tone={tone} aria-labelledby="objections-title">
      <div className="container-page">
        <SectionHeading
          id="objections-title"
          eyebrow="Честно о сомнениях"
          title="«А если…» — нормальные вопросы, на которые есть ответы"
          lead="Кухня — дорогая и долгая покупка. Сомневаться перед ней логично. Вот что обычно беспокоит людей больше всего."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {objections.map((o, i) => (
            <Reveal
              key={o.fear}
              delay={Math.min(i, 3) * 50}
              className={`flex h-full flex-col rounded-lg border border-line p-7 sm:p-8 ${
                tone === 'bone' ? 'bg-cream' : 'bg-bone'
              }`}
            >
              <p className="font-display text-[1.1875rem] leading-snug text-ink">
                «{o.fear}»
              </p>
              <div aria-hidden="true" className="rule-brass my-5 w-full" />
              <p className="text-[0.9375rem] leading-relaxed text-stone">
                {o.answer}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="mx-auto max-w-xl text-lead text-stone">
            Остались другие вопросы? Их можно задать до того, как вы что-то
            решите. Это ни к чему не обязывает.
          </p>
          <CtaButton
            source="objections"
            variant="primary"
            size="lg"
            withArrow
            className="mt-6 max-sm:w-full"
            modalTitle="Задайте вопрос"
            modalLead="Напишите, что вас беспокоит. Ответим честно — даже если ответ будет «в вашем случае мы не подойдём»."
            submitLabel="Задать вопрос"
          >
            Задать вопрос
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
