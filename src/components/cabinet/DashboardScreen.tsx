'use client';

import Link from 'next/link';
import { useCabinet } from '@/lib/cabinet/session';
import { projectStatusLabel } from '@/lib/cabinet/labels';
import { formatAgo, personName } from '@/lib/cabinet/format';
import { phones, emailValue } from '@/data/site';
import { EmptyState, Loading, Notice, Panel, Pill } from './ui';
import { AccountPanel } from './AccountPanel';
import { AuthScreen } from './AuthScreen';
import { NotConfigured } from './CabinetShell';

/**
 * ГЛАВНАЯ КАБИНЕТА
 * ================
 * Один проект — сразу карточка с переходом внутрь. Несколько — список.
 * Ни одного — честное объяснение, почему пусто, и что делать дальше.
 */

export function DashboardScreen() {
  const { status, profile, projects, isStaff } = useCabinet();

  if (status === 'loading') return <Loading label="Проверяем доступ…" />;
  if (status === 'unconfigured') return <NotConfigured />;
  if (status === 'anonymous') return <AuthScreen />;

  const active = projects.filter((p) => !p.is_archived);
  const archived = projects.filter((p) => p.is_archived);

  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone">Личный кабинет</p>
        <h1 className="font-display text-[clamp(1.875rem,1.2rem+2.6vw,3.25rem)] leading-[1.05] tracking-tight text-ink">
          Здравствуйте, {personName(profile, 'рады видеть')}
        </h1>
        <p className="max-w-2xl text-lead leading-relaxed text-stone">
          Здесь собрано всё по вашему проекту: документы, эскизы, этапы и
          договорённости. Доступ открыт в любое время — просить файлы у нас не
          нужно.
        </p>
      </header>

      {isStaff ? (
        <Notice title="Вы вошли как сотрудник">
          Клиентская часть показана так, как её видит заказчик.{' '}
          <Link href="/kabinet/admin" className="text-ink underline underline-offset-4">
            Перейти в панель «РЕцепт»
          </Link>
        </Notice>
      ) : null}

      {active.length === 0 ? (
        <EmptyState title="Проектов пока не видно">
          <p>
            Кабинет создан, но к вашей учётной записи ещё не привязан проект.
            Так и задумано: доступ открывается вручную, чтобы чужие материалы
            не попали к постороннему человеку.
          </p>
          <p className="mt-3">
            Напишите нам с той почты, на которую зарегистрированы, — откроем
            доступ. Или перейдите по персональной ссылке, если мы её присылали.
          </p>
        </EmptyState>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2">
          {active.map((project) => (
            <Panel key={project.id} className="grid content-start gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                    {project.furniture_type}
                    {project.code ? ` · ${project.code}` : ''}
                  </p>
                  <h2 className="mt-2 font-display text-[1.375rem] leading-snug text-ink">
                    {project.title}
                  </h2>
                </div>
                <Pill tone="active">{projectStatusLabel[project.status]}</Pill>
              </div>

              {project.summary ? (
                <p className="text-[0.9375rem] leading-relaxed text-stone">{project.summary}</p>
              ) : null}

              <p className="text-[0.8125rem] text-stone">
                Обновлён {formatAgo(project.updated_at)}
              </p>

              <div>
                <Link href={`/kabinet/proekt?id=${project.id}`}>
                  <span className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-coal">
                    Открыть проект
                  </span>
                </Link>
              </div>
            </Panel>
          ))}
        </section>
      )}

      {archived.length ? (
        <section className="grid gap-3">
          <h2 className="font-display text-[1.25rem] text-ink">Завершённые проекты</h2>
          <ul className="grid divide-y divide-line border border-line">
            {archived.map((project) => (
              <li key={project.id} className="flex flex-wrap items-center justify-between gap-3 bg-cream p-4">
                <span className="text-body text-ink">{project.title}</span>
                <Link
                  href={`/kabinet/proekt?id=${project.id}`}
                  className="text-[0.8125rem] text-stone transition-colors hover:text-ink"
                >
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AccountPanel />

      <Panel className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-display text-[1.125rem] text-ink">Нужна помощь с кабинетом?</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-stone">
            Напишите или позвоните — Роберт и Катя на связи.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
            {phones.map((phone) => (
              <a key={phone.raw} href={`tel:${phone.raw}`} className="text-ink transition-colors hover:text-stone">
                {phone.display}
              </a>
            ))}
            <a href={`mailto:${emailValue}`} className="text-stone transition-colors hover:text-ink">
              {emailValue}
            </a>
          </div>
        </div>
        <Link
          href="/kontakty"
          className="inline-flex min-h-11 items-center justify-center border border-ink/25 px-5 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Контакты
        </Link>
      </Panel>
    </div>
  );
}
