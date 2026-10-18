'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import { currentVersion } from '@/lib/cabinet/api';
import { docCategoryLabel, projectStatusLabel, stageStatusLabel, toneOf } from '@/lib/cabinet/labels';
import { formatAgo, formatDate, formatDateTime } from '@/lib/cabinet/format';
import { phones, emailValue } from '@/data/site';
import { Action, EmptyState, Loading, Notice, Panel, Pill, TabBar } from './ui';
import { useProjectData } from './useProjectData';
import { DocumentsSection } from './sections/Documents';
import { SketchesSection } from './sections/Sketches';
import { StagesSection } from './sections/Stages';
import { NotesSection } from './sections/Notes';
import { MoneySection } from './sections/Money';
import { MessagesSection } from './sections/Messages';

/**
 * СТРАНИЦА ПРОЕКТА ГЛАЗАМИ КЛИЕНТА
 * ================================
 * Разделы сделаны вкладками, а не отдельными адресами: на телефоне это
 * один экран и один большой палец, без блужданий по меню. Текущая
 * вкладка пишется в адрес, поэтому ссылку можно сохранить и переслать.
 */

const TABS = [
  { key: 'overview', label: 'Обзор' },
  { key: 'documents', label: 'Документы' },
  { key: 'sketches', label: 'Эскизы' },
  { key: 'stages', label: 'Этапы' },
  { key: 'notes', label: 'Договорённости' },
  { key: 'money', label: 'Стоимость' },
  { key: 'messages', label: 'Вопросы' },
];

export function ProjectScreen({ projectId }: { projectId: string }) {
  const { profile, isStaff } = useCabinet();
  const data = useProjectData(projectId, true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t && TABS.some((x) => x.key === t)) setTab(t);
  }, []);

  function selectTab(key: string) {
    setTab(key);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    window.history.replaceState(null, '', url.toString());
  }

  const openQuestions = useMemo(
    () => data.messages.filter((m) => !m.from_staff && m.status === 'open').length,
    [data.messages],
  );

  const needsDecision = useMemo(
    () => data.docs.filter((d) => d.needs_approval && d.state !== 'approved' && d.is_published).length,
    [data.docs],
  );

  if (data.loading) return <Loading label="Открываем проект…" />;

  if (!data.project) {
    return (
      <EmptyState
        title="Проект не найден"
        action={
          <Link href="/kabinet" className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink underline underline-offset-4">
            Вернуться к списку
          </Link>
        }
      >
        Либо проект удалён, либо у вашей учётной записи нет к нему доступа.
        Если это ошибка — напишите нам, мы откроем доступ.
      </EmptyState>
    );
  }

  const project = data.project;
  const currentStage =
    data.stages.find((s) => s.status === 'in_progress' || s.status === 'waiting_client') ??
    [...data.stages].reverse().find((s) => s.status === 'done') ??
    data.stages[0] ??
    null;

  return (
    <div className="grid gap-8">
      <header className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/kabinet" className="text-[0.8125rem] text-stone transition-colors hover:text-ink">
            ← Все проекты
          </Link>
          {isStaff ? (
            <Link
              href={`/kabinet/admin/proekt?id=${project.id}`}
              className="text-[0.8125rem] text-stone transition-colors hover:text-ink"
            >
              Открыть в панели
            </Link>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone">
              {project.furniture_type}
              {project.code ? ` · ${project.code}` : ''}
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.05] tracking-tight text-ink">
              {project.title}
            </h1>
          </div>
          <Pill tone="active">{projectStatusLabel[project.status]}</Pill>
        </div>

        {project.summary ? (
          <p className="max-w-2xl text-lead leading-relaxed text-stone">{project.summary}</p>
        ) : null}
      </header>

      {data.error ? <Notice tone="error">{data.error}</Notice> : null}

      <TabBar
        items={TABS.map((t) =>
          t.key === 'messages' && openQuestions
            ? { ...t, badge: openQuestions }
            : t.key === 'sketches' && needsDecision
              ? { ...t, badge: needsDecision }
              : t,
        )}
        active={tab}
        onSelect={selectTab}
      />

      <div>
        {tab === 'overview' ? (
          <Overview
            project={project}
            stage={currentStage}
            docs={data.docs}
            notes={data.notes}
            needsDecision={needsDecision}
            onGo={selectTab}
          />
        ) : null}

        {tab === 'documents' ? (
          <DocumentsSection
            projectId={project.id}
            docs={data.docs}
            staff={false}
            reload={data.reload}
          />
        ) : null}

        {tab === 'sketches' ? (
          <SketchesSection
            docs={data.docs}
            approvals={data.approvals}
            staff={false}
            canApprove
            reload={data.reload}
          />
        ) : null}

        {tab === 'stages' ? (
          <StagesSection projectId={project.id} stages={data.stages} staff={false} reload={data.reload} />
        ) : null}

        {tab === 'notes' ? (
          <NotesSection
            projectId={project.id}
            notes={data.notes}
            staff={false}
            authorId={profile?.id ?? ''}
            reload={data.reload}
          />
        ) : null}

        {tab === 'money' ? (
          <MoneySection
            projectId={project.id}
            costs={data.costs}
            payments={data.payments}
            staff={false}
            reload={data.reload}
          />
        ) : null}

        {tab === 'messages' ? (
          <MessagesSection
            projectId={project.id}
            messages={data.messages}
            docs={data.docs}
            staff={false}
            authorId={profile?.id ?? ''}
            reload={data.reload}
          />
        ) : null}
      </div>
    </div>
  );
}

function Overview({
  project,
  stage,
  docs,
  notes,
  needsDecision,
  onGo,
}: {
  project: NonNullable<ReturnType<typeof useProjectData>['project']>;
  stage: ReturnType<typeof useProjectData>['stages'][number] | null;
  docs: ReturnType<typeof useProjectData>['docs'];
  notes: ReturnType<typeof useProjectData>['notes'];
  needsDecision: number;
  onGo: (tab: string) => void;
}) {
  const recent = [...docs]
    .filter((d) => (d.document_versions ?? []).length > 0)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 5);
  const lastNote = notes[0] ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid content-start gap-6">
        {needsDecision ? (
          <Notice title="Ждём вашего решения">
            {needsDecision === 1
              ? 'Один документ готов к согласованию.'
              : `Документов к согласованию: ${needsDecision}.`}{' '}
            <button type="button" className="text-ink underline underline-offset-4" onClick={() => onGo('sketches')}>
              Посмотреть
            </button>
          </Notice>
        ) : null}

        <Panel className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                Текущий этап
              </p>
              <p className="mt-2 font-display text-[1.25rem] leading-snug text-ink">
                {stage ? stage.name : 'Этапы ещё не заданы'}
              </p>
              {stage ? (
                <p className="mt-1 text-[0.875rem] text-stone">
                  {stageStatusLabel[stage.status]} · план:{' '}
                  {stage.planned_on ? formatDate(stage.planned_on) : 'дата уточняется'}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                Последнее обновление
              </p>
              <p className="mt-2 text-body text-ink">{formatDateTime(project.updated_at)}</p>
              <p className="mt-1 text-[0.875rem] text-stone">{formatAgo(project.updated_at)}</p>
            </div>
            {project.address && project.show_address ? (
              <div>
                <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">Объект</p>
                <p className="mt-2 text-body text-ink">{project.address}</p>
              </div>
            ) : null}
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">Тип мебели</p>
              <p className="mt-2 text-body text-ink">{project.furniture_type}</p>
            </div>
          </div>

          {stage?.client_comment ? (
            <p className="border-l-2 border-line pl-4 text-[0.9375rem] leading-relaxed text-stone">
              {stage.client_comment}
            </p>
          ) : null}
        </Panel>

        <section className="grid gap-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-[1.25rem] text-ink">Последние документы</h2>
            <Action size="sm" variant="quiet" onClick={() => onGo('documents')}>
              Все документы
            </Action>
          </div>
          {recent.length === 0 ? (
            <p className="text-[0.9375rem] text-stone">
              Документы появятся здесь сразу после публикации — просить их не нужно.
            </p>
          ) : (
            <ul className="grid divide-y divide-line border border-line">
              {recent.map((doc) => {
                const version = currentVersion(doc);
                return (
                  <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 bg-cream p-4">
                    <div className="min-w-0">
                      <p className="text-body text-ink">{doc.title}</p>
                      <p className="mt-1 text-[0.8125rem] text-stone">
                        {docCategoryLabel[doc.category]}
                        {version ? ` · версия ${version.version} · ${formatAgo(version.created_at)}` : ''}
                      </p>
                    </div>
                    <Pill tone={toneOf(doc.state)}>{doc.state === 'approved' ? 'Согласовано' : 'Актуально'}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {lastNote ? (
          <section className="grid gap-3">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-[1.25rem] text-ink">Последняя договорённость</h2>
              <Action size="sm" variant="quiet" onClick={() => onGo('notes')}>
                Вся история
              </Action>
            </div>
            <Panel>
              <p className="font-display text-[1.0625rem] text-ink">{lastNote.title}</p>
              {lastNote.body ? (
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">{lastNote.body}</p>
              ) : null}
              <p className="mt-2 text-[0.8125rem] text-stone">{formatDateTime(lastNote.created_at)}</p>
            </Panel>
          </section>
        ) : null}
      </div>

      <aside className="grid content-start gap-4">
        <Panel className="grid gap-4">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">Быстрые переходы</p>
          <div className="grid gap-2">
            {[
              { key: 'documents', label: 'Договор и документы' },
              { key: 'sketches', label: 'Эскизы и согласования' },
              { key: 'stages', label: 'Этапы работ' },
              { key: 'money', label: 'Стоимость и оплаты' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onGo(item.key)}
                className="flex items-center justify-between border border-line bg-bone px-4 py-3 text-left text-[0.9375rem] text-ink transition-colors hover:border-ink"
              >
                {item.label}
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="grid gap-4">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Ваш проект ведут
          </p>
          <p className="text-[0.9375rem] leading-relaxed text-stone">
            Роберт и Катя. Вопрос по проекту лучше задать прямо здесь — он
            сохранится в истории вместе с ответом.
          </p>
          <Action variant="primary" onClick={() => onGo('messages')}>
            Задать вопрос по проекту
          </Action>
          <div className="grid gap-1 border-t border-line pt-4 text-[0.9375rem]">
            {phones.map((phone) => (
              <a key={phone.raw} href={`tel:${phone.raw}`} className="text-ink transition-colors hover:text-stone">
                {phone.display}
              </a>
            ))}
            <a href={`mailto:${emailValue}`} className="text-stone transition-colors hover:text-ink">
              {emailValue}
            </a>
          </div>
        </Panel>
      </aside>
    </div>
  );
}
