import Image from 'next/image';
import Link from 'next/link';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { atelierShots } from '@/data/atelier';

/**
 * Подписи поверх снимков — по одной на человека, в том же порядке, что
 * и карточки. Короткие намеренно: это реплика, брошенная читателю,
 * а не ещё один абзац текста. Обе опираются на то, что уже заявлено
 * на сайте, — личный замер и правки проекта без счёта.
 */
const handNotes = [
  'На замер приеду я сам',
  'Проект нарисую я. И перерисую, если не понравится',
];

import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleReviews } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { assetUrl } from '@/lib/content/images';

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
    <Section tone="bone" id="o-nas" aria-labelledby="founders-title">
      <div className="container-page">
        <SectionHeading
          id="founders-title"
          index={index}
          tone="dark"
          eyebrow="Кто это делает"
          title={founders.title}
          lead={founders.paragraphs[0]}
        />

        <div className="mt-14 grid gap-px bg-line lg:grid-cols-2">
          {team.map((person, i) => {
            const phone = phoneFor(person.fullName);
            return (
              <Reveal key={person.name} className="bg-bone p-8 sm:p-12">
                {(() => {
                  // Настоящий портрет, если он уже загружен. Иначе —
                  // кадр работы: лица на нём нет, поэтому никто не выдаёт
                  // себя за Роберта или Катю (см. src/data/atelier.ts).
                  const portrait = person.photo;
                  const fallback = atelierShots[i % atelierShots.length];
                  const src = portrait
                    ? assetUrl(portrait.src)
                    : fallback.image.src;
                  const alt = portrait
                    ? `${person.fullName} — мебельное ателье «РЕцепт», Тверь`
                    : fallback.alt;
                  const blur = portrait
                    ? portrait.blurDataURL
                    : fallback.image.blurDataURL;
                  const note = handNotes[i % handNotes.length];

                  return (
                    // Обёртка нужна, чтобы подпись могла выйти за край
                    // снимка. Сам снимок обрезает содержимое, поэтому
                    // текст лежит рядом с ним, а не внутри.
                    <div className="relative mb-16 max-w-sm sm:max-w-md lg:max-w-lg">
                      <div className="mat-light">
                        <div className="media-reveal relative aspect-4/5 overflow-hidden bg-sand">
                          <Image
                            src={src}
                            alt={alt}
                            fill
                            loading="lazy"
                            sizes="(max-width: 1023px) 100vw, 40vw"
                            placeholder={blur ? 'blur' : 'empty'}
                            blurDataURL={blur || undefined}
                            className="photo-calm object-cover"
                          />
                        </div>
                      </div>

                      {/* «Четвёртая стена»: человек со снимка обращается
                          к читателю поверх собственной фотографии —
                          как будто расписался на отпечатке. Это текст,
                          а не часть картинки: он читается экранными
                          дикторами и переводится вместе со страницей. */}
                      <p
                        // Привязка к верхнему краю, а не к нижнему:
                        // подпись Кати не влезает в одну строку, и при
                        // якоре снизу вторая строка уезжала вверх,
                        // на лицо. Теперь она растёт вниз, в поле.
                        className="absolute left-4 right-0 top-[calc(100%-1.75rem)] origin-left font-(family-name:--font-hand) text-sub leading-snug text-ink sm:left-6 sm:text-sub"
                        style={{ transform: 'rotate(-1.2deg)' }}
                      >
                        <span className="bg-bone/90 box-decoration-clone px-2 py-0.5">
                          {note}
                        </span>
                      </p>
                    </div>
                  );
                })()}

                <p className="font-display-light text-h2 leading-none text-ink">
                  {person.fullName.split(' ')[0]}
                </p>
                <p className="font-display mt-1 text-h3 text-stone">
                  {person.fullName.split(' ').slice(1).join(' ')}
                </p>

                {person.role ? (
                  <p className="label-xs mt-6 text-gold">{person.role}</p>
                ) : null}

                {person.bio ? (
                  <p className="mt-5 max-w-md text-stone">{person.bio}</p>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-6">
                  {phone ? (
                    <a
                      href={`tel:${phone.raw}`}
                      className="font-display text-sub text-ink transition-colors hover:text-gold"
                    >
                      {phone.display}
                    </a>
                  ) : null}
                  {person.vk ? (
                    <a
                      href={person.vk}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-sweep text-sm text-stone"
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
          <Reveal className="mt-14 grid gap-6 border-t border-line pt-10 lg:grid-cols-[10rem_1fr] lg:gap-12">
            <p className="label-xs text-gold">Из отзывов</p>
            <blockquote className="max-w-3xl">
              <p className="font-display text-h3 leading-snug text-ink">
                «{namedReview.text.split('.').slice(0, 2).join('.').trim()}.»
              </p>
              <footer className="mt-4 text-sm text-stone">
                {namedReview.author ?? 'Без подписи'} · {namedReview.date} ·{' '}
                <Link href="/otzyvy" className="link-sweep text-gold">
                  все отзывы
                </Link>
              </footer>
            </blockquote>
          </Reveal>
        ) : null}

        <Reveal className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-lead text-stone">
            {founders.paragraphs[1]}
          </p>
          <CtaButton
            source="founders"
            variant="primary"
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
