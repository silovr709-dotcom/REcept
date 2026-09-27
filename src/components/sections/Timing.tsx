import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';

/**
 * ЧЕСТНАЯ ПРИЧИНА НЕ ОТКЛАДЫВАТЬ.
 * Никаких таймеров и «скидок только сегодня». Просто объясняем реальную
 * логику: чем раньше начат проект кухни, тем больше решений ещё возможно.
 */
const stages = [
  {
    stage: 'До ремонта',
    mark: 'Лучший момент',
    best: true,
    text: 'Кухня проектируется первой, а ремонт подстраивается под неё. Мы передаём вашему электрику схему выводов, а плиточнику — размеры фартука. Возможны любые решения: встроенная техника, скрытая вытяжка, подсветка, нестандартные высоты.',
  },
  {
    stage: 'Во время ремонта',
    mark: 'Ещё не поздно',
    best: false,
    text: 'Успеваем скорректировать электрику и подрезать плитку под нужные размеры, если работы ещё не закончены. Часть решений может потребовать переделок — обсудим, что имеет смысл, а что нет.',
  },
  {
    stage: 'Ремонт закончен',
    mark: 'Тоже делаем',
    best: false,
    text: 'Работаем по факту: подстраиваем проект под существующие розетки, выводы и отделку. Вариантов меньше, но хорошая кухня всё равно получается — просто задача становится инженернее.',
  },
];

export function Timing() {
  return (
    <Section tone="bone" aria-labelledby="timing-title">
      <div className="container-page">
        <SectionHeading
          id="timing-title"
          eyebrow="Когда к нам приходить"
          title="Чем раньше начат проект кухни, тем больше решений ещё возможно"
          lead="Это единственная честная причина не откладывать. Никаких «скидок только сегодня» у нас нет и не будет — есть только последовательность работ, которую нельзя запустить назад."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {stages.map((s, i) => (
            <Reveal
              key={s.stage}
              delay={i * 60}
              className={`flex h-full flex-col rounded-lg p-7 sm:p-8 ${
                s.best
                  ? 'border-2 border-brass bg-cream'
                  : 'border border-line bg-cream/70'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-[1.25rem] text-ink">{s.stage}</h3>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider ${
                    s.best ? 'bg-brass text-white' : 'border border-line text-stone'
                  }`}
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
