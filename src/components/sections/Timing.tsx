import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleDetails } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';

/**
 * ЧЕСТНАЯ ПРИЧИНА НЕ ОТКЛАДЫВАТЬ.
 * Никаких таймеров и «скидок только сегодня». Просто объясняем реальную
 * логику: чем раньше начат проект кухни, тем больше решений ещё возможно.
 */


export async function Timing({ tone = 'cream' }: { tone?: 'cream' | 'bone' }) {
  const [{ timing }, details] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
  ]);
  const stages = timing.stages;
  /*
    Этапы ремонта редко укладываются в три колонки ровно, и хвост
    строки раньше оставался пустым полем. Свободные ячейки занимает
    работа: разговор про сроки всё равно про неё.
  */
  const emptyCells = (3 - (stages.length % 3)) % 3;
  const timingShots = details.slice(5, 5 + emptyCells);
  return (
    <Section tone={tone} aria-labelledby="timing-title">
      <div className="container-page">
        <SectionHeading
          id="timing-title"
          eyebrow="Когда к нам приходить"
          title={timing.title}
          lead={timing.lead}
        />

        <div className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-3 lg:gap-10">
          {stages.map((s, i) => (
            <Reveal
              key={s.stage}
              delay={i * 60}
              className={`flex h-full flex-col pt-7 ${
                s.best ? 'border-t-2 border-ink' : 'border-t border-line'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-sub text-ink">{s.stage}</h3>
                <span
                  className={`label-xs shrink-0 ${s.best ? 'text-ink' : 'text-stone'}`}
                >
                  {s.mark}
                </span>
              </div>
              <p className="mt-4 text-ui leading-relaxed text-stone">
                {s.text}
              </p>
            </Reveal>
          ))}

          {timingShots.map((d, i) => (
            <Reveal key={d.id} delay={(stages.length + i) * 60} className="h-full">
              <figure className="relative h-full min-h-56 overflow-hidden bg-sand">
                <Image
                  src={assetUrl(d.image.src)}
                  alt={d.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 33vw"
                  placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={d.image.blurDataURL || undefined}
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent p-5 pt-12 text-small font-medium text-cream">
                  {d.title}
                </figcaption>
              </figure>
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
