import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleDetails } from '@/lib/content/store';

/**
 * УТП. Не 15 одинаковых иконок, а «условие → что это даёт вам».
 */
export async function Advantages({
  tone = 'bone',
  limit,
}: {
  tone?: 'cream' | 'bone';
  /** Сколько условий показать. Без ограничения — все */
  limit?: number;
}) {
  const [{ advantages: allAdvantages }, details] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
  ]);
  const advantages = limit ? allAdvantages.slice(0, limit) : allAdvantages;

  // Числительное словом: «6 условий» посреди живого текста выглядит как опечатка
  const WORDS = [
    '', 'Одно', 'Два', 'Три', 'Четыре', 'Пять', 'Шесть',
    'Семь', 'Восемь', 'Девять', 'Десять',
  ];
  const count = WORDS[advantages.length] ?? String(advantages.length);
  const noun = advantages.length === 1 ? 'условие' : 'условий';
  const advantageShots = details.slice(1, 3);
  const [first, ...rest] = advantages;
  if (!first) return null;

  return (
    <Section tone={tone} aria-labelledby="advantages-title">
      <div className="container-page">
        <SectionHeading
          id="advantages-title"
          eyebrow="Почему с нами спокойнее"
          title={`${count} ${noun}, каждое из которых что-то для вас значит`}
          lead="Это не «преимущества компании». Это то, что вы почувствуете на себе во время работы."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Главное преимущество — крупным планом */}
          <Reveal className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-lg bg-ink p-8 text-cream sm:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brass/20 blur-3xl"
              />
              <div className="relative max-w-3xl">
                <p className="text-eyebrow font-bold uppercase text-brasslight">
                  Главное
                </p>
                <h3 className="font-display mt-5 text-h2 text-cream">
                  {first.title}
                </h3>
                <p className="mt-5 text-lead text-cream/70">{first.benefit}</p>
              </div>
            </div>
          </Reveal>

          {rest.map((adv, i) => (
            <Reveal
              key={adv.id}
              delay={Math.min(i, 4) * 50}
              className={`flex h-full flex-col rounded-lg border border-line p-7 sm:p-8 ${
                tone === 'bone' ? 'bg-cream' : 'bg-bone'
              }`}
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-brass/12">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m5 12.5 4.5 4.5L19 7"
                    stroke="#8F6530"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-display mt-5 text-[1.1875rem] text-ink">
                {adv.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                {adv.benefit}
              </p>
            </Reveal>
          ))}

          {advantageShots.map((d, i) => (
            <Reveal key={d.id} delay={i * 60} className="h-full">
              <figure className="relative h-full min-h-56 overflow-hidden rounded-lg bg-sand">
                <Image
                  src={d.image.src}
                  alt={d.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 33vw"
                  placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={d.image.blurDataURL || undefined}
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-12">
                  <p className="text-[0.9375rem] font-semibold text-cream">
                    {d.title}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-cream/70">{d.note}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
