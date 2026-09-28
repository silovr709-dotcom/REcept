import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleDetails } from '@/lib/content/store';

/**
 * Снимаем главные страхи до того, как человек успеет закрыть вкладку.
 */
export async function Objections({
  index,
  tone = 'cream',
}: {
  index?: string;
  tone?: 'cream' | 'bone';
}) {
  const [{ objections }, details] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
  ]);
  // Кадры с объектов не дают блоку превратиться в сплошную стену текста
  const objectionShots = details.slice(5, 8);
  return (
    <Section tone={tone} aria-labelledby="objections-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          id="objections-title"
          eyebrow="Честно о сомнениях"
          title="«А если…» — нормальные вопросы, на которые есть ответы"
          lead="Кухня — дорогая и долгая покупка. Сомневаться перед ней логично. Вот что обычно беспокоит людей больше всего."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {objections.map((o, i) => (
            <Reveal
              key={o.fear}
              delay={Math.min(i, 3) * 50}
              className="flex h-full flex-col border-t border-line pt-7"
            >
              <p className="font-display text-[1.1875rem] leading-snug text-ink">
                «{o.fear}»
              </p>
              <div className="my-5" />
              <p className="text-[0.9375rem] leading-relaxed text-stone">
                {o.answer}
              </p>
            </Reveal>
          ))}

          {objectionShots.map((d, i) => (
            <Reveal key={d.id} delay={i * 50} className="h-full">
              <figure className="relative h-full min-h-64 overflow-hidden bg-sand">
                <Image
                  src={d.image.src}
                  alt={d.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={d.image.blurDataURL || undefined}
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-12">
                  <p className="text-[0.9375rem] font-semibold text-cream">
                    {d.title}
                  </p>
                </figcaption>
              </figure>
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
