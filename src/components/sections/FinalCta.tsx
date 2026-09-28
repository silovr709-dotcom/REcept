import Image from 'next/image';
import { LeadForm } from '../LeadForm';
import { getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { pickImage } from '@/lib/content/images';

/**
 * ФИНАЛЬНЫЙ ЭКРАН.
 * Это не «спасибо за внимание», а приглашение к разговору.
 * Форма здесь короткая, а рядом объяснено, что произойдёт дальше.
 */
export async function FinalCta({
  title = 'Давайте разберём вашу кухню',
  lead = 'Расскажите, что у вас за помещение и чего хочется. Мы посмотрим, что реально сделать в ваших размерах, предложим варианты и посчитаем стоимость. Бесплатно и без обязательств — дальше решаете вы.',
  submitLabel = 'Обсудить мою кухню',
  source = 'final',
}: {
  title?: string;
  lead?: string;
  submitLabel?: string;
  source?: string;
}) {
  const [site, projects] = await Promise.all([
    getSiteView(),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'p-obraznaya-kuhnya-bezh', 8);
  const activeContacts = site.contacts;
  const hasPhone = Boolean(site.primaryPhone);
  const phoneDisplay = site.primaryPhone?.display ?? '';
  const phoneHref = site.primaryPhone ? `tel:${site.primaryPhone.raw}` : '';

  return (
    <section
      id="zayavka"
      aria-labelledby="final-cta-title"
      className="relative overflow-hidden bg-ink py-(--spacing-section) text-cream"
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]">
        {shot ? (
          <Image
            src={shot.image.src}
            alt=""
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/60" />
      </div>

      <div className="container-page relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          <div>
            <p className="flex items-center gap-3 text-eyebrow font-bold uppercase text-clay">
              <span aria-hidden="true" className="h-px w-6 bg-clay/60" />
              Следующий шаг
            </p>

            <h2
              id="final-cta-title"
              className="font-display mt-6 text-h2 text-cream"
            >
              {title}
            </h2>

            <p className="mt-6 max-w-xl text-lead text-cream/70">{lead}</p>

            <ol className="mt-10 grid gap-5 border-t border-cream/12 pt-8">
              {[
                'Вы оставляете контакт — это занимает меньше минуты.',
                'Роберт или Катя связываются и задают несколько вопросов о помещении.',
                'Вместе решаем, с чего начать: с замера, с планировки или просто с разговора.',
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-display shrink-0 text-[1.125rem] leading-tight text-brasslight">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-cream/70">{step}</span>
                </li>
              ))}
            </ol>

            {(hasPhone || activeContacts.length > 0) && (
              <div className="mt-9 border-t border-cream/12 pt-8">
                <p className="text-sm text-cream/60">
                  Или свяжитесь напрямую — это тоже нормально:
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                  {hasPhone ? (
                    <a
                      href={phoneHref}
                      className="font-display text-[1.375rem] text-cream transition-colors hover:text-brasslight"
                    >
                      {phoneDisplay}
                    </a>
                  ) : null}
                  {activeContacts
                    .filter((c) => c.id !== 'phone')
                    .map((c) => (
                      <a
                        key={c.id}
                        href={c.href}
                        {...(c.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="self-center text-cream/70 underline decoration-brass/50 underline-offset-4 transition-colors hover:text-cream"
                      >
                        {c.label}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-cream/12 bg-cream/[0.04] p-6 backdrop-blur-sm sm:p-9">
            <h3 className="font-display text-h3 text-cream">
              Расскажите, какую кухню вы хотите
            </h3>
            <p className="mt-3 text-cream/60">
              Можно даже без точного проекта — разберёмся вместе.
            </p>
            <div className="mt-7">
              <LeadForm tone="light" submitLabel={submitLabel} source={source} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
