import Link from 'next/link';
import { Logo } from './Logo';
import {
  WORKING_HOURS,
  activeContacts,
  navigation,
  site,
} from '@/data/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink pb-24 pt-(--spacing-section) text-cream lg:pb-14">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-cream/55">
              Семейное мебельное ателье в Твери. Кухни, гардеробные и корпусная
              мебель на заказ. Роберт и Катя ведут каждый проект лично.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/60">
              <li>Гарантия 24 месяца</li>
              <li aria-hidden="true">·</li>
              <li>Оплата 50 / 50</li>
              <li aria-hidden="true">·</li>
              <li>Проект бесплатно</li>
            </ul>
          </div>

          <nav aria-label="Разделы сайта">
            <h2 className="text-eyebrow font-bold uppercase text-clay">Разделы</h2>
            <ul className="mt-5 grid gap-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/70 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-eyebrow font-bold uppercase text-clay">Связаться</h2>
            {activeContacts.length > 0 ? (
              <ul className="mt-5 grid gap-3">
                {activeContacts.map((c) => (
                  <li key={c.id}>
                    <a
                      href={c.href!}
                      className="text-cream/70 transition-colors hover:text-cream"
                      {...(c.href!.startsWith('http')
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <span className="text-cream">{c.value}</span>
                      <span className="block text-xs text-cream/60">{c.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-cream/55">
                Оставьте заявку в форме — Роберт или Катя свяжутся с вами удобным
                для вас способом.
              </p>
            )}

            {WORKING_HOURS ? (
              <p className="mt-5 text-sm text-cream/60">{WORKING_HOURS}</p>
            ) : null}

            <p className="mt-5 text-sm text-cream/60">
              {site.city} и {site.region}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-7 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalName}. Фотографии — реальные работы ателье.
          </p>
          <Link
            href="/politika-konfidencialnosti"
            className="transition-colors hover:text-cream/70"
          >
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}
