import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleDetails } from '@/lib/content/store';
import { assetUrl } from '@/lib/content/images';
import { MarginNote } from '../ui/MarginNote';

/**
 * ЦЕНА И ПРОЗРАЧНОСТЬ.
 * Мы не прячем цену ради заявки — мы честно объясняем, почему её
 * невозможно назвать без проекта, и что человек получит вместо неё.
 * Никаких «скидок только сегодня» и зачёркнутых цифр.
 */
export async function Price({
  index,
  tone = 'cream',
}: {
  index?: string;
  tone?: 'cream' | 'bone';
}) {
  const [{ price }, details] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
  ]);
  const priceExplanation = price;
  const priceFactors = price.factors;
  // Разговор про деньги — самый текстовый экран страницы, и в сетке
  // из двух колонок правая ячейка второго ряда оставалась пустой.
  // Туда встаёт макро-кадр того, за что в этой смете и платят:
  // фурнитура и то, как сходятся детали.
  const priceShot = details[8] ?? details.at(-1) ?? null;
  return (
    <Section tone={tone} id="price" aria-labelledby="price-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading
              index={index}
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
            <div className="border-t border-line pt-9">
              <h3 className="text-eyebrow font-bold uppercase text-brass">
                Из чего складывается стоимость
              </h3>
              <dl className="mt-7 grid gap-6">
                {priceFactors.map((f, i) => (
                  <div key={f.title} className="flex gap-5">
                    <span className="shrink-0 pt-1 text-[0.6875rem] font-bold tracking-[0.16em] text-stone">
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

          <Reveal>
            <MarginNote author="Роберт">
              Знаю, зачем вы открыли этот раздел — за цифрой. Я бы тоже её
              искал. Но честная цифра появляется только после замера, всё
              остальное — гадание, за которое потом неловко.
            </MarginNote>
          </Reveal>

          {priceShot ? (
            <Reveal>
              <figure className="relative aspect-4/3 overflow-hidden bg-sand lg:aspect-16/10">
                <Image
                  src={assetUrl(priceShot.image.src)}
                  alt={priceShot.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  placeholder={priceShot.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={priceShot.image.blurDataURL || undefined}
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-12 text-[0.9375rem] font-medium text-cream">
                  Разницу в смете видно вот здесь — в фурнитуре и в том, как
                  сходятся детали
                </figcaption>
              </figure>
            </Reveal>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
