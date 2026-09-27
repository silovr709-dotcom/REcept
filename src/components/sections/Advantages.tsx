import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { advantages } from '@/data/content';

/**
 * УТП. Не 15 одинаковых иконок, а «условие → что это даёт вам».
 */
export function Advantages() {
  const [first, ...rest] = advantages;

  return (
    <Section tone="cream" aria-labelledby="advantages-title">
      <div className="container-page">
        <SectionHeading
          id="advantages-title"
          eyebrow="Почему с нами спокойнее"
          title="Восемь условий, каждое из которых что-то для вас значит"
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
              className="flex h-full flex-col rounded-lg border border-line bg-cream p-7 sm:p-8"
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
        </div>
      </div>
    </Section>
  );
}
