'use client';

import { useMemo, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './ui/Reveal';
import type { ProjectItem as Project } from '@/lib/content/types';

/**
 * Отбор работ по компоновке.
 * Человек приходит в портфолио с одним вопросом: «а у меня так получится?».
 * Поэтому фильтр не по стилю и не по цвету, а по форме помещения —
 * это то, что у посетителя уже задано и изменить нельзя.
 *
 * Фильтр — прогрессивное улучшение: без JS видны все проекты сразу.
 */
export function PortfolioGrid({
  projects,
  layouts,
}: {
  projects: Project[];
  layouts: Project['layout'][];
}) {
  const [active, setActive] = useState<Project['layout'] | 'all'>('all');

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) map.set(p.layout, (map.get(p.layout) ?? 0) + 1);
    return map;
  }, [projects]);

  const visible = useMemo(
    () => (active === 'all' ? projects : projects.filter((p) => p.layout === active)),
    [projects, active],
  );

  const chips: { id: Project['layout'] | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'Все работы', count: projects.length },
    ...layouts.map((l) => ({ id: l, label: l, count: counts.get(l) ?? 0 })),
  ];

  return (
    <div>
      {/* Фильтр набран строкой, а не плашками: ряд серых «таблеток»
          с цифрами выглядит как панель интерфейса, а здесь нужен
          указатель раздела. Выбранное помечено золотой линией снизу —
          тем же приёмом, что и текущий пункт меню. */}
      <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3 border-b border-line pb-4">
        <span className="label-xs mr-1 text-gold">Компоновка</span>
        {chips.map((chip) => {
          const isActive = active === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActive(chip.id)}
              aria-pressed={isActive}
              className={`relative inline-flex min-h-10 items-baseline gap-2 pb-1 text-ui transition-colors after:absolute after:inset-x-0 after:-bottom-[1.3rem] after:h-px after:transition-colors ${
                isActive
                  ? 'text-ink after:bg-gold'
                  : 'text-stone hover:text-ink after:bg-transparent'
              }`}
            >
              {chip.label}
              <span className="font-display text-small text-clay">
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Заголовок галереи виден только программам чтения с экрана:
          визуально его роль уже выполняет заголовок страницы, но без
          него карточки работ (h3) повисали бы сразу после h1 */}
      <h2 className="sr-only">Работы ателье</h2>

      <p aria-live="polite" className="sr-only">
        Показано работ: {visible.length}
      </p>

      <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-8">
        {visible.map((project, i) => (
          <li
            key={project.slug}
            className={active === 'all' && i % 5 === 0 ? 'lg:col-span-2' : ''}
          >
            <Reveal delay={Math.min(i, 4) * 40}>
              <ProjectCard
                project={project}
                priority={i < 2}
                ratio={
                  active === 'all' && i % 5 === 0 ? 'aspect-16/10' : 'aspect-4/5'
                }
                sizes={
                  active === 'all' && i % 5 === 0
                    ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 62vw'
                    : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 31vw'
                }
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
