import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section } from '../ui/Section';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';

/**
 * РОБЕРТ И КАТЯ.
 * Не «наша команда», а конкретные люди, за которыми закреплена
 * личная ответственность. Фотографии появятся здесь автоматически,
 * как только их положат в public/images/team/ и впишут в data/content.ts.
 * Выдуманных биографий и ролей мы не пишем.
 */
export async function Founders() {
  const [{ team, founders }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'kuhnya-grafit-s-ostrovom', 3);
  return (
    <Section tone="ink" id="o-nas" aria-labelledby="founders-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <p className="flex items-center gap-3 text-eyebrow font-bold uppercase text-clay">
              <span aria-hidden="true" className="h-px w-6 bg-clay/60" />
              Роберт и Катя
            </p>

            <h2
              id="founders-title"
              className="font-display mt-6 text-h2 text-cream"
            >
              {founders.title}
            </h2>

            <div className="mt-7 grid gap-5 text-lead text-cream/70">
              {founders.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {team.map((person) => (
                <div
                  key={person.name}
                  className="rounded-lg border border-cream/12 bg-cream/[0.03] p-6"
                >
                  <div className="flex items-center gap-4">
                    {person.photo ? (
                      <Image
                        src={person.photo.src}
                        alt={`${person.fullName} — мебельное ателье «РЕцепт», Тверь`}
                        width={56}
                        height={56}
                        placeholder={person.photo.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={person.photo.blurDataURL || undefined}
                        className="size-14 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="font-display grid size-14 shrink-0 place-items-center rounded-full border border-brass/40 text-[1.25rem] text-brasslight"
                      >
                        {person.name.charAt(0)}
                      </span>
                    )}
                    <div>
                      <p className="font-display text-[1.25rem] text-cream">
                        {person.fullName}
                      </p>
                      <p className="text-sm text-cream/60">
                        {person.role ?? 'Ведёт проекты лично'}
                      </p>
                    </div>
                  </div>
                  {person.bio ? (
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-cream/60">
                      {person.bio}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <CtaButton
                source="founders"
                variant="light"
                size="lg"
                withArrow
                className="max-sm:w-full"
                modalTitle="Напишите Роберту и Кате"
                modalLead="Ваше сообщение попадёт напрямую к владельцам ателье — не в колл-центр и не к менеджеру."
                submitLabel="Написать Роберту и Кате"
              >
                Написать Роберту и Кате
              </CtaButton>
            </div>
          </div>

          {shot ? (
          <Reveal>
            <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-coal">
              <Image
                src={shot.image.src}
                alt={shot.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 42vw"
                placeholder={shot.image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={shot.image.blurDataURL || undefined}
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent"
              />
              <p className="absolute inset-x-0 bottom-0 p-7 text-[0.9375rem] text-cream/75">
                Каждая работа в портфолио — кухня, которую Роберт и Катя
                проектировали, привозили и собирали сами.
              </p>
            </div>
          </Reveal>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
