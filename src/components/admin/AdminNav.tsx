'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const groups: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: 'Заявки',
    items: [{ href: '/admin/zayavki', label: 'Заявки с сайта' }],
  },
  {
    title: 'Контент',
    items: [
      { href: '/admin/proekty', label: 'Проекты портфолио' },
      { href: '/admin/detali', label: 'Детали и фактуры' },
      { href: '/admin/otzyvy', label: 'Отзывы и рейтинг' },
      { href: '/admin/video', label: 'Видео из ВКонтакте' },
    ],
  },
  {
    title: 'Тексты',
    items: [
      { href: '/admin/glavnaya', label: 'Первый экран' },
      { href: '/admin/bloki', label: 'Блоки страниц' },
      { href: '/admin/voprosy', label: 'Вопросы и возражения' },
    ],
  },
  {
    title: 'Настройки',
    items: [
      { href: '/admin/kontakty', label: 'Контакты и реквизиты' },
      { href: '/admin/rezervnaya-kopiya', label: 'Резервная копия' },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Разделы админки"
      className="lg:w-60 lg:shrink-0"
    >
      <div className="flex gap-6 overflow-x-auto pb-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:pb-0">
        {groups.map((group) => (
          <div key={group.title} className="min-w-max lg:min-w-0">
            <p className="mb-2 text-eyebrow font-bold uppercase text-stone">
              {group.title}
            </p>
            <ul className="flex gap-1.5 lg:flex-col">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`block whitespace-nowrap rounded-lg px-3 py-2 text-[0.9375rem] transition-colors lg:whitespace-normal ${
                        active
                          ? 'bg-ink text-cream'
                          : 'text-ink hover:bg-ink/[0.06]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
