import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ImageRef } from '@/lib/content/types';
import { Photo } from './ui/Photo';

export function Breadcrumbs({
  items,
  tone = 'dark',
}: {
  items: { name: string; href?: string }[];
  tone?: 'dark' | 'light';
}) {
  return (
    <nav aria-label="Хлебные крошки">
      <ol
        className={`flex flex-wrap items-center gap-2 text-[0.8125rem] ${
          tone === 'light' ? 'text-cream/60' : 'text-stone'
        }`}
      >
        <li>
          <Link href="/" className="transition-colors hover:text-navy">
            Главная
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-navy">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="opacity-80">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * ШАПКА СТРАНИЦЫ
 * ==============
 * Два вида. Без снимка — светлая типографическая полоса: так было
 * везде. Со снимком — заголовок лежит прямо на фотографии, как на
 * первом экране главной и как на карточках, которые видит человек,
 * когда ему присылают ссылку в мессенджере. Раньше эти карточки
 * выглядели заметно живее самих страниц; теперь приём один и тот же.
 *
 * Тёмный вариант помечает себя `data-hero="dark"`. По этой метке
 * шапка сайта понимает, что наверху под ней фотография, и
 * переключает логотип, меню и кнопку в светлый тон — списка
 * страниц нигде вести не нужно.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
  image,
  imageAlt = '',
  imagePosition = 'object-center',
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs: { name: string; href?: string }[];
  children?: ReactNode;
  image?: ImageRef | null;
  imageAlt?: string;
  /** Класс object-position: кадры широкие, а полоса низкая */
  imagePosition?: string;
}) {
  if (!image) {
    return (
      <section className="bg-cream pb-14 pt-28 lg:pb-20 lg:pt-36">
        <div className="container-page">
          <Breadcrumbs items={breadcrumbs} />
          <p className="mt-8 flex items-center gap-3 text-eyebrow font-bold uppercase text-navy">
            <span aria-hidden="true" className="h-px w-6 bg-navy/60" />
            {eyebrow}
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-h1 text-ink">
            {title}
          </h1>
          {lead ? (
            <div className="mt-6 max-w-2xl text-lead text-stone">{lead}</div>
          ) : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section
      data-hero="dark"
      className="relative isolate overflow-hidden bg-ink pb-16 pt-28 lg:pb-24 lg:pt-40"
    >
      <Photo
        image={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className={`-z-20 object-cover ${imagePosition}`}
      />
      {/* Снизу плотно — там лежит заголовок; сверху ровно столько,
          чтобы не потерялась прозрачная шапка сайта */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/95 via-ink/78 to-ink/55"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-ink/85 via-ink/45 to-transparent lg:h-48"
      />

      <div className="container-page">
        <Breadcrumbs items={breadcrumbs} tone="light" />
        <p className="mt-8 flex items-center gap-3 text-eyebrow font-bold uppercase text-navylight">
          <span aria-hidden="true" className="h-px w-6 bg-navylight/60" />
          {eyebrow}
        </p>
        <h1 className="font-display mt-5 max-w-4xl text-h1 text-cream">
          {title}
        </h1>
        {lead ? (
          <div className="mt-6 max-w-2xl text-lead text-cream/75">{lead}</div>
        ) : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}
