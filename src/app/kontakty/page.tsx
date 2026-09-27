import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { LeadForm } from '@/components/LeadForm';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import {
  WORKING_HOURS,
  activeContacts,
  hasPhone,
  phoneDisplay,
  phoneHref,
  site,
} from '@/data/site';

export const metadata: Metadata = {
  title: 'Контакты мебельного ателье «РЕцепт» в Твери',
  description:
    'Связаться с мебельным ателье «РЕцепт» в Твери: оставьте заявку или напишите напрямую Роберту и Кате. Обсудим задачу, запишем на замер и посчитаем стоимость кухни бесплатно.',
  alternates: { canonical: '/kontakty' },
};

export default function ContactsPage() {
  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Давайте обсудим вашу кухню"
        lead="Мы отвечаем и тем, кто готов заказывать, и тем, кто пока просто прицениваемся. Второе — совершенно нормально."
        breadcrumbs={[{ name: 'Контакты' }]}
      />

      <Section tone="bone" id="zayavka" className="pt-0! lg:pt-0!">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Форма — главный способ связи */}
            <Reveal className="rounded-lg border border-line bg-cream p-7 sm:p-10">
              <h2 className="font-display text-h3 text-ink">
                Расскажите, какую кухню вы хотите
              </h2>
              <p className="mt-3 text-stone">
                Можно даже без точного проекта и размеров — разберёмся вместе.
                Заполнение занимает меньше минуты.
              </p>
              <div className="mt-8">
                <LeadForm source="contacts-page" submitLabel="Отправить заявку" />
              </div>
            </Reveal>

            {/* Прямые каналы */}
            <div>
              {hasPhone ? (
                <div className="rounded-lg border border-line bg-cream p-7 sm:p-9">
                  <p className="text-eyebrow font-bold uppercase text-brass">
                    Позвонить
                  </p>
                  <a
                    href={phoneHref!}
                    className="font-display mt-4 block text-[1.75rem] leading-tight text-ink transition-colors hover:text-brass sm:text-[2.125rem]"
                  >
                    {phoneDisplay}
                  </a>
                  <p className="mt-3 text-sm text-stone">
                    Ответит Роберт или Катя — не колл-центр.
                  </p>
                </div>
              ) : null}

              {activeContacts.filter((c) => c.id !== 'phone').length > 0 ? (
                <ul
                  className={`grid gap-px overflow-hidden rounded-lg bg-line ${
                    hasPhone ? 'mt-6' : ''
                  }`}
                >
                  {activeContacts
                    .filter((c) => c.id !== 'phone')
                    .map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.href!}
                          {...(c.href!.startsWith('http')
                            ? { target: '_blank', rel: 'noopener noreferrer' }
                            : {})}
                          className="flex items-center justify-between gap-4 bg-cream p-6 transition-colors hover:bg-bone"
                        >
                          <span>
                            <span className="block text-eyebrow font-bold uppercase text-brass">
                              {c.label}
                            </span>
                            <span className="mt-1.5 block font-medium text-ink">
                              {c.value}
                            </span>
                            {c.hint ? (
                              <span className="mt-1 block text-sm text-stone">
                                {c.hint}
                              </span>
                            ) : null}
                          </span>
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                            className="shrink-0 text-brass"
                          >
                            <path
                              d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </li>
                    ))}
                </ul>
              ) : null}

              {activeContacts.length === 0 ? (
                <div className="rounded-lg border border-line bg-cream p-7 sm:p-9">
                  <p className="text-eyebrow font-bold uppercase text-brass">
                    Как с нами связаться
                  </p>
                  <p className="mt-4 text-lead text-ink">
                    Сейчас самый быстрый способ — форма слева.
                  </p>
                  <p className="mt-3 text-stone">
                    Оставьте телефон или ник в Telegram, и Роберт или Катя
                    напишут вам сами — туда, куда вам удобно.
                  </p>
                </div>
              ) : null}

              <div className="mt-6 rounded-lg bg-ink p-7 text-cream sm:p-9">
                <p className="text-eyebrow font-bold uppercase text-clay">
                  Что будет дальше
                </p>
                <ol className="mt-6 grid gap-5">
                  {[
                    'Роберт или Катя свяжутся с вами удобным способом.',
                    'Зададут несколько вопросов о помещении и задаче.',
                    'Предложат, с чего начать: с замера, с планировки или просто с разговора.',
                  ].map((s, i) => (
                    <li key={s} className="flex gap-4">
                      <span className="font-display shrink-0 text-[1.0625rem] text-brasslight">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-cream/70">{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 border-t border-cream/12 pt-5 text-sm text-cream/60">
                  Мы не обещаем «перезвоним за 15 минут» — обещаем, что ответим
                  сами и по делу.
                </p>
              </div>

              <div className="mt-6 grid gap-2 rounded-lg border border-line bg-cream p-7 text-sm text-stone">
                <p>
                  <span className="font-semibold text-ink">Где работаем: </span>
                  {site.city} и {site.region}. Доставка и сборка — в Твери; по
                  области обсуждаем отдельно.
                </p>
                {WORKING_HOURS ? (
                  <p>
                    <span className="font-semibold text-ink">Когда: </span>
                    {WORKING_HOURS}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <BreadcrumbJsonLd items={[{ name: 'Контакты', url: '/kontakty' }]} />
    </>
  );
}
