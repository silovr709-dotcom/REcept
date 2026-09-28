import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent } from '@/lib/content/store';

/**
 * ЦЕНА И ПРОЗРАЧНОСТЬ.
 * Мы не прячем цену ради заявки — мы честно объясняем, почему её
 * невозможно назвать без проекта, и что человек получит вместо неё.
 * Никаких «скидок только сегодня» и зачёркнутых цифр.
 */
export async function Price({ tone = 'cream' }: { tone?: 'cream' | 'bone' }) {
  const { price } = await getContent('texts');
  const priceExplanation = price;
  const priceFactors = price.factors;
  return (
    <Section tone={tone} id="price" aria-labelledby="price-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading
              id="price-title"
              eyebrow="Стоимость"
              title={priceExplanation.headline}
            />
            <div className="mt-6 grid gap-4 text-lead text-stone">
              {priceExplanation.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <ul className="mt-9 grid gap-3">
              {priceExplanation.guarantees.map((g) => (
                <li key={g} className="flex items-start gap-3 text-ink">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-brass"
                  >
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-medium">{g}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <CtaButton
                source="price"
                variant="brass"
                size="lg"
                withArrow
                className="max-sm:w-full"
                modalTitle="Посчитаем вашу кухню"
                modalLead="Расскажите про помещение — пришлём расчёт с расшифровкой: из чего складывается сумма и на чём можно сэкономить без потери качества."
                submitLabel="Получить расчёт"
              >
                Получить расчёт
              </CtaButton>
              <p className="mt-3 max-w-sm text-sm text-stone">
                Расчёт бесплатный. Мы не берём предоплату за проект и не
                используем «скидки только сегодня».
              </p>
            </div>
          </div>

          <Reveal>
            <div
              className={`rounded-lg border border-line p-7 sm:p-9 ${
                tone === 'bone' ? 'bg-cream' : 'bg-bone'
              }`}
            >
              <h3 className="text-eyebrow font-bold uppercase text-brass">
                Из чего складывается стоимость
              </h3>
              <dl className="mt-7 grid gap-6">
                {priceFactors.map((f, i) => (
                  <div key={f.title} className="flex gap-5">
                    <span className="font-display shrink-0 text-[1.125rem] leading-tight text-brass">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <dt className="font-semibold text-ink">{f.title}</dt>
                      <dd className="mt-1 text-[0.9375rem] leading-relaxed text-stone">
                        {f.text}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
