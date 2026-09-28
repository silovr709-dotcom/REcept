import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { LeadForm } from '@/components/LeadForm';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { PhotoBand } from '@/components/PhotoBand';
import { Details } from '@/components/sections/Details';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { getVisibleDetails, getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';
import { YandexMapWidget } from '@/components/YandexWidgets';
import { RatingBadge } from '@/components/RatingBadge';
import { getSiteView } from '@/lib/content/view';

export const metadata: Metadata = {
  title: 'Контакты мебельного ателье «РЕцепт» в Твери',
  description:
    'Связаться с мебельным ателье «РЕцепт» в Твери: оставьте заявку или напишите напрямую Роберту и Кате. Обсудим задачу, запишем на замер и посчитаем стоимость кухни бесплатно.',
  alternates: { canonical: '/kontakty' },
};

export default async function ContactsPage() {
  const [site, details, projects] = await Promise.all([
    getSiteView(),
    getVisibleDetails(),
    getVisibleProjects(),
  ]);
  const {
    contacts: activeContacts,
    phones,
    address: addressValue,
    addressMapUrl,
    workingHours: WORKING_HOURS,
  } = site;
  const contactDetails = details.slice(0, 4);
  const band = pickImage(projects, 'uglovaya-kuhnya-do-potolka', 6);

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
              <div className="rounded-lg border border-line bg-cream p-7 sm:p-9">
                <p className="text-eyebrow font-bold uppercase text-brass">
                  Позвонить
                </p>
                <ul className="mt-5 grid gap-4">
                  {phones.map((phone, i) => (
                    <li key={phone.raw}>
                      <a
                        href={`tel:${phone.raw}`}
                        className="font-display block text-[1.5rem] leading-tight text-ink transition-colors hover:text-brass sm:text-[1.75rem]"
                      >
                        {phone.display}
                      </a>
                      <p className="mt-0.5 text-sm text-stone">
                        {phone.who ?? (i === 0 ? 'Основной номер' : 'Дополнительный номер')}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-sm text-stone">
                  Ответят Роберт или Катя — не колл-центр и не менеджер.
                </p>
              </div>

              {activeContacts.filter((c) => c.id !== 'phone').length > 0 ? (
                <ul className="mt-6 grid gap-px overflow-hidden rounded-lg bg-line">
                  {activeContacts
                    .filter((c) => c.id !== 'phone')
                    .map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.href}
                          {...(c.href.startsWith('http')
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

              <div className="mt-6 grid gap-3 rounded-lg border border-line bg-cream p-7 text-sm text-stone">
                <p>
                  <span className="font-semibold text-ink">Адрес: </span>
                  <a
                    href={addressMapUrl ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-brass/40 underline-offset-4"
                  >
                    {addressValue}
                  </a>
                  . Здесь можно посмотреть образцы фасадов, столешниц и фурнитуры.
                </p>
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
                ) : (
                  <p>
                    <span className="font-semibold text-ink">Часы работы: </span>
                    актуальные всегда видны в карточке на карте ниже.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <RatingBadge />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream" aria-labelledby="map-title">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
            <div>
              <h2
                id="map-title"
                className="font-display text-h2 text-ink"
              >
                Нас можно найти на проспекте Калинина
              </h2>
              <p className="mt-5 text-lead text-stone">
                Заезжайте посмотреть образцы: фактуру фасада, кромку столешницы
                и работу фурнитуры проще один раз потрогать, чем десять раз
                посмотреть на экране. Перед визитом лучше позвонить.
              </p>
              <a
                href={addressMapUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 font-semibold text-brass underline decoration-brass/40 underline-offset-4"
              >
                Построить маршрут на Яндекс Картах
              </a>
            </div>
            <YandexMapWidget />
          </div>
        </div>
      </Section>

      <Details
        tone="bone"
        items={contactDetails}
        eyebrow="Пока вы думаете"
        title="Посмотрите, как мы работаем с деталями"
        lead="Фрагменты наших кухонь в Твери. По ним видно то, что не покажет общий план: профили, стыки, подсветку и фактуры."
        showCta={false}
      />

      {band ? (
        <PhotoBand
          image={band.image}
          alt={band.alt}
          overlay="quote"
          caption="Начните с простого вопроса. Дальше разберёмся вместе."
        />
      ) : null}

      <BreadcrumbJsonLd items={[{ name: 'Контакты', url: '/kontakty' }]} />
    </>
  );
}
