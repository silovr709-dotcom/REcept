import Image from 'next/image';
import Link from 'next/link';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleReviews } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

/**
 * РОБЕРТ И КАТЯ
 * =============
 * Ядро сайта, а не раздел «о компании». За мебелью на заказ человек идёт
 * к людям: он отдаёт сотни тысяч и пускает их в свою квартиру на месяцы.
 * Поэтому здесь не «наша команда», а два конкретных человека с фамилией,
 * телефоном и отзывами, где их называют по имени.
 *
 * Блок рассчитан на то, что фотографий может не быть: тогда работает
 * типографика — имена набраны крупно, как подпись под работой. Как только
 * портреты появятся в админке, вёрстка сама станет фотографической.
 */
export async function Founders({ index }: { index?: string } = {}) {
  const [{ team, founders }, site, reviews] = await Promise.all([
    getContent('texts'),
    getSiteView(),
    getVisibleReviews(),
  ]);

  /** Личный телефон человека, если он указан в контактах */
  const phoneFor = (fullName: string) =>
    site.phones.find((p) => p.who && fullName.includes(p.who.split(' ')[0]));

  // Отзыв, в котором их называют по имени, — лучшее подтверждение личного участия
  const namedReview = reviews.items.find(
    (r) => r.text.includes('Екатерин') || r.text.includes('Роберт'),
  );

  return (
    <Section tone="ink" id="o-nas" aria-labelledby="founders-title">
      <div className="container-page">
        <SectionHeading
          id="founders-title"
          index={index}
          tone="light"
          eyebrow="Кто это делает"
          title={founders.title}
          lead={founders.paragraphs[0]}
        />

        <div className="mt-16 grid gap-px bg-cream/12 lg:grid-cols-2">
          {team.map((person) => {
            const phone = phoneFor(person.fullName);
            return (
              <Reveal key={person.name} className="bg-ink p-8 sm:p-12">
                {person.photo ? (
                  <div className="media-reveal relative mb-8 aspect-4/5 max-w-sm overflow-hidden bg-coal">
                    <Image
                      src={person.photo.src}
                      alt={`${person.fullName} — мебельное ателье «РЕцепт», Тверь`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1023px) 100vw, 40vw"
                      placeholder={person.photo.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={person.photo.blurDataURL || undefined}
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <p className="font-display text-h2 leading-none text-cream">
                  {person.fullName.split(' ')[0]}
                </p>
                <p className="font-display mt-1 text-h3 text-cream/45">
                  {person.fullName.split(' ').slice(1).join(' ')}
                </p>

                {person.role ? (
                  <p className="label-xs mt-6 text-cream/50">{person.role}</p>
                ) : null}

                {person.bio ? (
                  <p className="mt-5 max-w-md text-cream/70">{person.bio}</p>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-cream/12 pt-6">
                  {phone ? (
                    <a
                      href={`tel:${phone.raw}`}
                      className="font-display text-[1.25rem] text-cream transition-colors hover:text-clay"
                    >
                      {phone.display}
                    </a>
                  ) : null}
                  {person.vk ? (
                    <a
                      href={person.vk}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sweep text-sm text-cream/60"
                    >
                      ВКонтакте
                    </a>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Отзыв, где их зовут по именам, — доказательство личного участия */}
        {namedReview ? (
          <Reveal className="mt-16 grid gap-6 border-t border-cream/12 pt-10 lg:grid-cols-[10rem_1fr] lg:gap-12">
            <p className="label-xs text-cream/45">Из отзывов</p>
            <blockquote className="max-w-3xl">
              <p className="font-display text-h3 leading-snug text-cream">
                «{namedReview.text.split('.').slice(0, 2).join('.').trim()}.»
              </p>
              <footer className="mt-4 text-sm text-cream/50">
                {namedReview.author ?? 'Без подписи'} · {namedReview.date} ·{' '}
                <Link href="/otzyvy" className="link-sweep text-cream/70">
                  все отзывы
                </Link>
              </footer>
            </blockquote>
          </Reveal>
        ) : null}

        <Reveal className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lead text-cream/70">
            {founders.paragraphs[1]}
          </p>
          <CtaButton
            source="founders"
            variant="light"
            size="lg"
            withArrow
            className="shrink-0 max-sm:w-full"
            modalTitle="Напишите Роберту и Кате"
            modalLead="Ваше сообщение попадёт напрямую к нам — не в колл-центр и не к менеджеру."
            submitLabel="Написать Роберту и Кате"
          >
            Написать нам напрямую
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
