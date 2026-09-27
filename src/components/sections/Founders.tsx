import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section } from '../ui/Section';
import { team } from '@/data/content';
import { terms } from '@/data/site';
import shot from '@public/images/kitchens/kitchen-04.webp';

/**
 * РОБЕРТ И КАТЯ.
 * Не «наша команда», а конкретные люди, за которыми закреплена
 * личная ответственность. Фотографии появятся здесь автоматически,
 * как только их положат в public/images/team/ и впишут в data/content.ts.
 * Выдуманных биографий и ролей мы не пишем.
 */
export function Founders() {
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
              Вы всегда знаете, кто отвечает за вашу кухню
            </h2>

            <div className="mt-7 grid gap-5 text-lead text-cream/70">
              <p>
                «РЕцепт» — семейное дело. Наша семья занимается мебелью в Твери
                с {terms.furnitureSince} года, а индивидуальными кухнями — с{' '}
                {terms.kitchensSince}-го. Здесь нет отдела продаж и менеджера,
                который уволится через месяц: есть Роберт и Катя, которые ведут
                проект от первого разговора до сборки и остаются на связи после.
              </p>
              <p>
                Поэтому мы не можем позволить себе сделать плохо: следующий
                заказ к нам приходит от тех, кому мы уже что-то сделали, и от их
                знакомых. Это не маркетинговая позиция — это просто способ
                работать, когда за каждым проектом стоит твоя фамилия.
              </p>
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
                        src={person.photo}
                        alt={`${person.name} — мебельное ателье «РЕцепт», Тверь`}
                        width={56}
                        height={56}
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

          <Reveal>
            <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-coal">
              <Image
                src={shot}
                alt="Графитовая кухня с островом — работа мебельного ателье «РЕцепт»"
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 42vw"
                placeholder="blur"
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
        </div>
      </div>
    </Section>
  );
}
