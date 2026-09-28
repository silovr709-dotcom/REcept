import Image from 'next/image';
import Link from 'next/link';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getVisibleDetails } from '@/lib/content/store';
import type { DetailItem } from '@/lib/content/types';

/**
 * ДЕТАЛИ.
 * Общий план показывает, что кухня красивая. Деталь показывает, что она
 * сделана под конкретное помещение: профиль, кромка, стык, подсветка, фактура.
 * Именно это отличает мебель на заказ от коробки из магазина.
 *
 * Все кадры — фрагменты реальных фотографий наших работ.
 */

// Разные пропорции задают editorial-ритм вместо скучной сетки квадратов
const ratios = ['aspect-4/5', 'aspect-square', 'aspect-square', 'aspect-4/5'];

export async function Details({
  index,
  tone = 'cream',
  items,
  eyebrow = 'Детали',
  title = 'Индивидуальная мебель видна в мелочах',
  lead = 'Профиль-ручка вместо накладной, кромка столешницы, стык фактур, свет под корпусом, рифлёное стекло вместо прозрачного. Это нельзя купить готовым — это проектируется под конкретную кухню.',
  footnote = 'Нажмите на любой фрагмент, чтобы посмотреть проект целиком.',
  showCta = true,
  columns = 4,
  limit,
}: {
  index?: string;
  tone?: 'cream' | 'bone';
  items?: DetailItem[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  footnote?: string;
  showCta?: boolean;
  columns?: 3 | 4;
  limit?: number;
}) {
  const all = await getVisibleDetails();
  const list = items ?? all.slice(0, limit ?? 8);
  if (list.length === 0) return null;

  const cols =
    columns === 3
      ? 'grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-2 lg:grid-cols-4';
  const sizes =
    columns === 3
      ? '(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 30vw'
      : '(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 22vw';

  return (
    <Section tone={tone} aria-labelledby="details-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          id="details-title"
          eyebrow={eyebrow}
          title={title}
          lead={lead}
        />

        <ul className={`mt-12 grid gap-x-4 gap-y-8 sm:gap-x-6 lg:mt-16 ${cols}`}>
          {list.map((d, i) => (
            <li key={d.id}>
              <Reveal delay={Math.min(i, 5) * 40}>
                <Link href={`/portfolio/${d.project}`} className="group block">
                  <div
                    className={`media-reveal relative overflow-hidden rounded-md bg-sand ${ratios[i % ratios.length]}`}
                  >
                    <Image
                      src={d.image.src}
                      alt={d.alt}
                      fill
                      loading="lazy"
                      sizes={sizes}
                      placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={d.image.blurDataURL || undefined}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-3 text-[0.9375rem] font-semibold leading-snug text-ink transition-colors group-hover:text-brass">
                    {d.title}
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-snug text-stone">
                    {d.note}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        {showCta ? (
          <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-stone">{footnote}</p>
            <CtaButton
              source="details"
              variant="primary"
              size="md"
              withArrow
              className="shrink-0 max-sm:w-full"
              modalTitle="Покажем образцы вживую"
              modalLead="Фактуру, металл и кромку лучше один раз потрогать. Договоримся о встрече — привезём образцы и посмотрим их при вашем свете."
              submitLabel="Посмотреть образцы"
            >
              Посмотреть образцы вживую
            </CtaButton>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
