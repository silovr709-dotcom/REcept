'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import {
  fetchAudit,
  fetchMembers,
  removeMember,
  setMemberApproval,
  setUserBlocked,
  updateProject,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { furnitureTypes, projectStatusLabel } from '@/lib/cabinet/labels';
import { formatAgo, formatDateTime, personName } from '@/lib/cabinet/format';
import type { AuditEntry, ProjectMember, ProjectStatus } from '@/lib/cabinet/types';
import {
  Action,
  EmptyState,
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
  Loading,
  Notice,
  Panel,
  Pill,
  TabBar,
} from './ui';
import { useProjectData } from './useProjectData';
import { DocumentsSection } from './sections/Documents';
import { SketchesSection } from './sections/Sketches';
import { StagesSection } from './sections/Stages';
import { NotesSection } from './sections/Notes';
import { MoneySection } from './sections/Money';
import { MessagesSection } from './sections/Messages';

/**
 * РАБОЧЕЕ МЕСТО ПО ПРОЕКТУ
 * ========================
 * Те же разделы, что видит клиент, плюс управление: публикация
 * документов, этапы, деньги, доступы и журнал действий.
 */

const TABS = [
  { key: 'settings', label: 'Проект' },
  { key: 'documents', label: 'Документы' },
  { key: 'sketches', label: 'Эскизы' },
  { key: 'stages', label: 'Этапы' },
  { key: 'notes', label: 'Заметки' },
  { key: 'money', label: 'Деньги' },
  { key: 'messages', label: 'Вопросы' },
  { key: 'access', label: 'Доступ' },
];

export function AdminProjectScreen({ projectId }: { projectId: string }) {
  const { status, isStaff, profile } = useCabinet();
  const data = useProjectData(projectId, status === 'ready' && isStaff);
  const [tab, setTab] = useState('settings');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t && TABS.some((x) => x.key === t)) setTab(t);
  }, []);

  function selectTab(key: string) {
    setTab(key);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    window.history.replaceState(null, '', url.toString());
  }

  if (status === 'loading' || data.loading) return <Loading />;
  if (!isStaff) return <EmptyState title="Раздел только для сотрудников" />;
  if (!data.project) return <EmptyState title="Проект не найден" />;

  const project = data.project;
  const openQuestions = data.messages.filter((m) => !m.from_staff && m.status === 'open').length;

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <div className="flex flex-wrap gap-4">
          <Link href="/kabinet/admin" className="text-[0.8125rem] text-stone transition-colors hover:text-ink">
            ← Панель
          </Link>
          <Link
            href={`/kabinet/admin/klient?id=${project.client_id}`}
            className="text-[0.8125rem] text-stone transition-colors hover:text-ink"
          >
            Карточка клиента
          </Link>
          <Link
            href={`/kabinet/proekt?id=${project.id}`}
            className="text-[0.8125rem] text-stone transition-colors hover:text-ink"
          >
            Как видит клиент
          </Link>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone">
              {project.clients?.display_name ?? 'Клиент'} · {project.furniture_type}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.625rem,1.2rem+2vw,2.5rem)] leading-[1.08] tracking-tight text-ink">
              {project.title}
            </h1>
          </div>
          <Pill tone="active">{projectStatusLabel[project.status]}</Pill>
        </div>
      </header>

      {data.error ? <Notice tone="error">{data.error}</Notice> : null}

      <TabBar
        items={TABS.map((t) => (t.key === 'messages' && openQuestions ? { ...t, badge: openQuestions } : t))}
        active={tab}
        onSelect={selectTab}
      />

      {tab === 'settings' ? <ProjectSettings project={project} reload={data.reload} /> : null}

      {tab === 'documents' ? (
        <DocumentsSection projectId={project.id} docs={data.docs} staff reload={data.reload} />
      ) : null}

      {tab === 'sketches' ? (
        <SketchesSection
          docs={data.docs}
          approvals={data.approvals}
          staff
          canApprove={false}
          reload={data.reload}
        />
      ) : null}

      {tab === 'stages' ? (
        <StagesSection projectId={project.id} stages={data.stages} staff reload={data.reload} />
      ) : null}

      {tab === 'notes' ? (
        <NotesSection
          projectId={project.id}
          notes={data.notes}
          staff
          authorId={profile?.id ?? ''}
          reload={data.reload}
        />
      ) : null}

      {tab === 'money' ? (
        <MoneySection
          projectId={project.id}
          costs={data.costs}
          payments={data.payments}
          staff
          reload={data.reload}
        />
      ) : null}

      {tab === 'messages' ? (
        <MessagesSection
          projectId={project.id}
          messages={data.messages}
          docs={data.docs}
          staff
          authorId={profile?.id ?? ''}
          reload={data.reload}
        />
      ) : null}

      {tab === 'access' ? <AccessSection projectId={project.id} /> : null}
    </div>
  );
}

function ProjectSettings({
  project,
  reload,
}: {
  project: NonNullable<ReturnType<typeof useProjectData>['project']>;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(project);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(project), [project]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Panel className="grid gap-5">
        <LabeledInput
          label="Название"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect
            label="Тип мебели"
            value={draft.furniture_type}
            onChange={(e) => setDraft({ ...draft, furniture_type: e.target.value })}
          >
            {furnitureTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </LabeledSelect>
          <LabeledSelect
            label="Статус"
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as ProjectStatus })}
          >
            {(Object.keys(projectStatusLabel) as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>
                {projectStatusLabel[s]}
              </option>
            ))}
          </LabeledSelect>
          <LabeledInput
            label="Номер договора"
            value={draft.code ?? ''}
            onChange={(e) => setDraft({ ...draft, code: e.target.value })}
          />
          <LabeledInput
            label="Адрес объекта"
            value={draft.address ?? ''}
            onChange={(e) => setDraft({ ...draft, address: e.target.value })}
          />
        </div>

        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={draft.show_address}
            onChange={(e) => setDraft({ ...draft, show_address: e.target.checked })}
            className="mt-1"
          />
          Показывать адрес клиенту
        </label>

        <LabeledTextarea
          label="Описание для клиента"
          rows={3}
          value={draft.summary ?? ''}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
        />

        <LabeledTextarea
          label="Внутренние сведения (клиент не увидит)"
          rows={3}
          value={draft.internal_note ?? ''}
          onChange={(e) => setDraft({ ...draft, internal_note: e.target.value })}
        />

        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={draft.is_archived}
            onChange={(e) => setDraft({ ...draft, is_archived: e.target.checked })}
            className="mt-1"
          />
          Проект завершён — убрать в архив
        </label>

        {error ? <Notice tone="error">{error}</Notice> : null}
        {saved ? <Notice title="Сохранено" /> : null}

        <div>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              setSaved(false);
              try {
                await updateProject(project.id, {
                  title: draft.title,
                  furniture_type: draft.furniture_type,
                  status: draft.status,
                  code: draft.code || null,
                  address: draft.address || null,
                  show_address: draft.show_address,
                  summary: draft.summary || null,
                  internal_note: draft.internal_note || null,
                  is_archived: draft.is_archived,
                });
                await reload();
                setSaved(true);
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Сохранить
          </Action>
        </div>
      </Panel>

      <ProjectLog projectId={project.id} />
    </div>
  );
}

function ProjectLog({ projectId }: { projectId: string }) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetchAudit(projectId, 30)
      .then(setEntries)
      .catch(() => undefined);
  }, [projectId]);

  return (
    <Panel className="grid content-start gap-4">
      <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">Журнал действий</p>
      {entries.length === 0 ? (
        <p className="text-[0.9375rem] text-stone">Пока ничего не происходило.</p>
      ) : (
        <ul className="grid gap-3">
          {entries.map((e) => (
            <li key={e.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-[0.9375rem] leading-snug text-ink">{e.action}</p>
              <p className="mt-1 text-[0.8125rem] text-stone">
                {formatDateTime(e.created_at)}
                {e.meta && typeof e.meta.title === 'string' ? ` · ${e.meta.title}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function AccessSection({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setMembers(await fetchMembers(projectId));
      setError(null);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Loading />;

  return (
    <div className="grid gap-5">
      <Notice>
        Доступ к проекту есть только у перечисленных учётных записей.
        Сотрудники видят все проекты по своей роли и в этом списке не нужны.
      </Notice>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {members.length === 0 ? (
        <EmptyState title="Пока никто не подключён">
          Выпишите приглашение в карточке клиента — после входа человек
          появится в этом списке.
        </EmptyState>
      ) : (
        <ul className="grid gap-3">
          {members.map((m) => (
            <Panel as="li" key={m.user_id} className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-body text-ink">{personName(m.profiles, 'Пользователь')}</p>
                <p className="mt-1 text-[0.8125rem] text-stone">
                  {m.profiles?.email} · подключён {formatAgo(m.created_at)}
                  {m.profiles?.is_blocked ? ' · доступ заблокирован' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Action
                  size="sm"
                  onClick={() => void setMemberApproval(projectId, m.user_id, !m.can_approve).then(load)}
                >
                  {m.can_approve ? 'Запретить согласование' : 'Разрешить согласование'}
                </Action>
                <Action
                  size="sm"
                  variant="quiet"
                  onClick={() => void setUserBlocked(m.user_id, !m.profiles?.is_blocked).then(load)}
                >
                  {m.profiles?.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                </Action>
                <Action
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (!window.confirm('Убрать доступ к проекту?')) return;
                    void removeMember(projectId, m.user_id).then(load);
                  }}
                >
                  Убрать
                </Action>
              </div>
            </Panel>
          ))}
        </ul>
      )}
    </div>
  );
}
