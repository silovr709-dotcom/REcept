import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import {
  getContent,
  getVisibleDetails,
  getVisibleProjects,
} from '@/lib/content/store';
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
  const [{ price }, details, projects] = await Promise.all([
    getContent('texts'),
    getVisibleDetails(),
    getVisibleProjects(),
  ]);
  const priceExplanation = price;
  const priceFactors = price.factors;
  // Разговор про деньги — самый текстовый экран страницы, и в сетке
  // из двух колонок правая ячейка второго ряда оставалась пустой.
  // Туда встаёт макро-кадр того, за что в этой смете и платят:
  // фурнитура и то, как сходятся детали.
  const priceShot = details[8] ?? details.at(-1) ?? null;

  /*
    Список «из чего складывается стоимость» был самым плотным
    текстовым куском страницы: шесть абзацев подряд без единой
    зацепки для глаза. Теперь у каждого пункта свой кадр — ровно то,
    за что в этой строке сметы и платят. Снимки не придуманы под
    текст: это наши же макро-кадры и проекты, просто поставленные
    рядом со строкой, которую они объясняют.
  */
  const byId = (id: string) => details.find((d) => d.id === id);
  const factorShots = [
    projects[0]
      ? { src: projects[0].image.src, alt: projects[0].title }
      : null,
    byId('lacquer') ?? byId('reeded'),
    byId('stone') ?? byId('wood-stone'),
    byId('hardware'),
    byId('brass') ?? byId('veneer'),
    projects[1]
      ? { src: projects[1].image.src, alt: projects[1].title }
      : null,
  ].map((item) =>
    item
      ? 'image' in item
        ? { src: item.image.src, alt: item.alt }
        : item
      : null,
  );
  return (
    <Section tone={tone} id="price" aria-labelledby="price-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading
              stacked
              index={index}
              id="price-title"
              eyebrow="Стоимость"
              title={priceExplanation.headline}
            />
            <div className="mt-7 grid gap-5 text-lead text-stone">
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
                    className="mt-1 shrink-0 text-gold"
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
                variant="gold"
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
              <h3 className="text-eyebrow font-medium uppercase tracking-[0.18em] text-gold">
                Из чего складывается стоимость
              </h3>
              <dl className="mt-7 grid gap-7">
                {priceFactors.map((f, i) => {
                  const shot = factorShots[i];
                  return (
                    <div key={f.title} className="flex items-start gap-5">
                      {shot ? (
                        <span className="relative block size-20 shrink-0 overflow-hidden bg-sand sm:size-24">
                          <Image
                            src={assetUrl(shot.src)}
                            alt={shot.alt}
                            fill
                            loading="lazy"
                            sizes="96px"
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="shrink-0 pt-1 text-caption font-bold tracking-[0.16em] text-stone">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                      <div>
                        <dt className="flex items-baseline gap-3 font-semibold text-ink">
                          <span className="text-caption font-bold tracking-[0.16em] text-stone">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {f.title}
                        </dt>
                        <dd className="mt-1 text-ui leading-relaxed text-stone">
                          {f.text}
                        </dd>
                      </div>
                    </div>
                  );
                })}
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
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-6 pt-12 text-ui font-medium text-cream">
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
