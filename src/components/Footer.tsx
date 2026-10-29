import Link from 'next/link';
import { Logo } from './Logo';
import { getSiteView } from '@/lib/content/view';

export async function Footer() {
  const site = await getSiteView();
  const {
    navigation,
    contacts: activeContacts,
    workingHours: WORKING_HOURS,
    terms,
  } = site;
  /* В шапке семь пунктов — предел читаемого меню, поэтому каталог
     фрезеровок живёт подразделом материалов. В подвале место есть,
     и с любой страницы до него должен быть один клик. */
  const footerLinks = [
    ...navigation,
    { href: '/frezerovki', label: 'Фрезеровки' },
    { href: '/kabinet', label: 'Личный кабинет' },
  ];
  const phoneDisplay = site.primaryPhone?.display ?? '';
  const phoneHref = site.primaryPhone ? `tel:${site.primaryPhone.raw}` : '';
  const year = new Date().getFullYear();

  return (
    <footer className="grain reeded plinth relative bg-soot pb-24 pt-(--spacing-section) text-cream lg:pb-14">
      <div className="container-page">
        {/* Подвал начинается не со списка ссылок, а с подписи: имя
            ателье крупной антиквой и телефон рядом. Так низ страницы
            выглядит как колофон книги, а не как служебная зона. */}
        <div className="grid gap-8 border-b border-cream/12 pb-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <p className="font-display-light max-w-[16ch] text-[clamp(1.9rem,1rem+2.6vw,3rem)] leading-[1.06] text-cream">
            Мебельное ателье{' '}
            <span className="accent-italic text-goldsoft">«РЕцепт»</span>,
            Тверь
          </p>
          {phoneDisplay ? (
            <a
              href={phoneHref}
              className="font-display -my-1 flex min-h-11 shrink-0 items-center text-[clamp(1.5rem,1rem+1.5vw,2.25rem)] text-cream transition-colors hover:text-goldsoft"
            >
              {phoneDisplay}
            </a>
          ) : null}
        </div>

        <div className="grid gap-12 pt-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-cream/55">
              Семейное мебельное ателье в Твери. Кухни, гардеробные и корпусная
              мебель на заказ. Роберт и Катя ведут каждый проект лично.
            </p>
            <ul className="mt-7 grid gap-2.5 text-sm text-cream/60">
              <li className="flex items-baseline gap-3">
                <span aria-hidden="true" className="h-px w-5 shrink-0 bg-goldline/60" />
                Гарантия {terms.warrantyMonths} месяца
              </li>
              <li className="flex items-baseline gap-3">
                <span aria-hidden="true" className="h-px w-5 shrink-0 bg-goldline/60" />
                Оплата {terms.payment}
              </li>
              <li className="flex items-baseline gap-3">
                <span aria-hidden="true" className="h-px w-5 shrink-0 bg-goldline/60" />
                Проект бесплатно
              </li>
            </ul>
          </div>

          <nav aria-label="Разделы сайта" className="lg:border-l lg:border-cream/10 lg:pl-16">
            <h2 className="label-xs text-goldsoft">Разделы</h2>
            <ul className="mt-4 grid gap-0.5 sm:mt-6">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-sweep inline-flex min-h-11 items-center text-cream/70 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:border-l lg:border-cream/10 lg:pl-16">
            <h2 className="label-xs text-goldsoft">Связаться</h2>
            {activeContacts.length > 0 ? (
              <ul className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-4">
                {activeContacts.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.href}
                      className="group block py-2.5 sm:py-0"
                      {...(c.href.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className="block text-cream transition-colors group-hover:text-goldsoft">
                        {c.value}
                      </span>
                      <span className="label-xs mt-1 block text-cream/55">
                        {c.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-cream/55">
                Оставьте заявку в форме — Роберт или Катя свяжутся с вами удобным
                для вас способом.
              </p>
            )}

            {WORKING_HOURS ? (
              <p className="mt-6 text-sm text-cream/60">{WORKING_HOURS}</p>
            ) : null}

            <p className="mt-2 text-sm text-cream/60">
              {site.city} и {site.region}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-7 text-xs text-cream/50 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p>
              © {year} {site.requisites.legalEntity ?? site.legalName}
            </p>
            {/*
              Реквизиты оператора: без них политика обработки данных
              формально ни на кого не ссылается. Пока поля пустые — строки нет.
            */}
            {site.requisites.inn || site.requisites.ogrn ? (
              <p>
                {[
                  site.requisites.inn ? `ИНН ${site.requisites.inn}` : null,
                  site.requisites.ogrn ? `ОГРНИП ${site.requisites.ogrn}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            {/*
              Честная строка про изображения. Раньше здесь было написано,
              что все изображения — визуализации; после того как портфолио
              стало полностью реальным, это перестало быть правдой.
            */}
            <p>
              В портфолио — фотографии наших работ. Там, где показана
              визуализация, это подписано прямо на изображении.
            </p>
          </div>
          <Link
            href="/politika-konfidencialnosti"
            className="-my-2 inline-flex min-h-11 items-center py-2 transition-colors hover:text-cream/80"
          >
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
