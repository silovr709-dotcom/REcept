import Link from 'next/link';
import type { ReactNode } from 'react';

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
          <Link href="/" className="transition-colors hover:text-brass">
            Главная
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-brass">
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

export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  breadcrumbs: { name: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="bg-cream pb-14 pt-28 lg:pb-20 lg:pt-36">
      <div className="container-page">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mt-8 flex items-center gap-3 text-eyebrow font-bold uppercase text-brass">
          <span aria-hidden="true" className="h-px w-6 bg-brass/60" />
          {eyebrow}
        </p>
        <h1 className="font-display mt-5 max-w-4xl text-h1 text-ink">{title}</h1>
        {lead ? (
          <div className="mt-6 max-w-2xl text-lead text-stone">{lead}</div>
        ) : null}
        {children ? <div className="mt-9">{children}</div> : null}
      </div>
    </section>
  );
}
