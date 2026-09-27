'use client';

import { useMemo, useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './ui/Reveal';
import type { Project } from '@/data/projects';

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
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="mr-1 text-eyebrow font-bold uppercase text-brass">
          Компоновка
        </span>
        {chips.map((chip) => {
          const isActive = active === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setActive(chip.id)}
              aria-pressed={isActive}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[0.875rem] font-medium transition-colors ${
                isActive
                  ? 'border-ink bg-ink text-cream'
                  : 'border-line bg-cream text-ink hover:border-ink/40'
              }`}
            >
              {chip.label}
              <span className={isActive ? 'text-cream/60' : 'text-stone'}>
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        Показано работ: {visible.length}
      </p>

      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
