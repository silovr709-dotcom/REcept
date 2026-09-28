import Link from 'next/link';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getContent } from '@/lib/content/store';

async function countLeads() {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), '.leads', 'leads.jsonl'),
      'utf8',
    );
    return raw.split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
}

export default async function AdminDashboard() {
  const [projects, details, reviews, videos, leads] = await Promise.all([
    getContent('projects'),
    getContent('details'),
    getContent('reviews'),
    getContent('videos'),
    countLeads(),
  ]);

  const tiles = [
    {
      href: '/admin/proekty',
      title: 'Проекты портфолио',
      value: `${projects.filter((p) => !p.hidden).length} на сайте`,
      hint: 'Фото, описание, материалы и решения',
    },
    {
      href: '/admin/detali',
      title: 'Детали и фактуры',
      value: `${details.filter((d) => !d.hidden).length} кадров`,
      hint: 'Крупные планы фурнитуры и материалов',
    },
    {
      href: '/admin/otzyvy',
      title: 'Отзывы и рейтинг',
      value: `${reviews.items.filter((r) => !r.hidden).length} опубликовано`,
      hint: `Рейтинг ${reviews.rating.value}`,
    },
    {
      href: '/admin/video',
      title: 'Видео из ВКонтакте',
      value: `${videos.filter((v) => !v.hidden).length} роликов`,
      hint: 'Показываются на главной и в портфолио',
    },
    {
      href: '/admin/glavnaya',
      title: 'Первый экран',
      value: 'Заголовок и цифры',
      hint: 'То, что человек видит за первые пять секунд',
    },
    {
      href: '/admin/bloki',
      title: 'Блоки страниц',
      value: 'Процесс, преимущества, цена',
      hint: 'Основные смысловые разделы сайта',
    },
    {
      href: '/admin/voprosy',
      title: 'Вопросы и возражения',
      value: 'FAQ и блок «А если…»',
      hint: 'Снимают сомнения перед заявкой',
    },
    {
      href: '/admin/kontakty',
      title: 'Контакты и реквизиты',
      value: 'Телефоны, адрес, соцсети',
      hint: 'Меняются сразу во всех блоках сайта',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Что сегодня меняем?
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Любое изменение появляется на сайте сразу после сохранения — пересобирать
        ничего не нужно.
      </p>

      <Link
        href="/admin/zayavki"
        className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-brass/40 bg-brass/10 p-5 transition-colors hover:border-brass sm:p-6"
      >
        <div>
          <p className="text-eyebrow font-bold uppercase text-brass">Заявки</p>
          <p className="font-display mt-2 text-[1.5rem] text-ink">
            {leads > 0
              ? `${leads} ${leads === 1 ? 'заявка' : leads < 5 ? 'заявки' : 'заявок'} в журнале`
              : 'Журнал заявок пуст'}
          </p>
          <p className="mt-1 text-sm text-stone">
            Резервная копия на случай, если письмо не дошло
          </p>
        </div>
        <span aria-hidden="true" className="shrink-0 text-2xl text-brass">
          →
        </span>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group rounded-xl border border-line bg-cream p-5 transition-colors hover:border-ink/30"
          >
            <p className="font-display text-[1.125rem] text-ink group-hover:text-brass">
              {tile.title}
            </p>
            <p className="mt-1.5 text-[0.9375rem] font-medium text-ink">
              {tile.value}
            </p>
            <p className="mt-1 text-sm text-stone">{tile.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
