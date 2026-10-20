'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import {
  createClient,
  createProject,
  fetchAdminOverview,
  fetchAudit,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { furnitureTypes, projectStatusLabel } from '@/lib/cabinet/labels';
import { formatAgo } from '@/lib/cabinet/format';
import type { Client, ProjectWithClient } from '@/lib/cabinet/types';
import {
  Action,
  EmptyState,
  Field,
  Input,
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
  Loading,
  Modal,
  Notice,
  Panel,
  Pill,
  TabBar,
} from './ui';
import { AuthScreen } from './AuthScreen';
import { NotConfigured } from './CabinetShell';
import { StaffPanel } from './StaffPanel';

/**
 * ПАНЕЛЬ «РЕцепт»
 * ===============
 * Рабочее место Роберта и Кати. Всё в одном окне: поиск, клиенты,
 * проекты и открытые вопросы — чтобы не открывать десять страниц
 * ради одного действия.
 *
 * Доступ сюда определяется ролью в базе. Если роль не сотрудник,
 * страница просто не покажет данные: запросы вернут пусто, потому что
 * так настроены политики, а не потому что мы спрятали кнопку.
 */

export function AdminScreen() {
  const { status, isStaff, profile } = useCabinet();
  const [tab, setTab] = useState('projects');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<{
    projects: ProjectWithClient[];
    clients: Client[];
    messages: Awaited<ReturnType<typeof fetchAdminOverview>>['messages'];
  } | null>(null);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof fetchAudit>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState(false);
  const [newProject, setNewProject] = useState(false);

  const reload = useMemo(
    () => async () => {
      try {
        const [overview, log] = await Promise.all([fetchAdminOverview(), fetchAudit(undefined, 25)]);
        setData(overview);
        setAudit(log);
        setError(null);
      } catch (e) {
        setError(humanError(e));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (status === 'ready' && isStaff) void reload();
    else if (status !== 'loading') setLoading(false);
  }, [status, isStaff, reload]);

  if (status === 'loading') return <Loading label="Проверяем доступ…" />;
  if (status === 'unconfigured') return <NotConfigured />;
  if (status === 'anonymous') return <AuthScreen />;

  if (!isStaff) {
    return (
      <EmptyState
        title="Раздел только для сотрудников"
        action={
          <Link href="/kabinet" className="text-eyebrow font-semibold uppercase tracking-[0.16em] text-ink underline underline-offset-4">
            Вернуться в кабинет
          </Link>
        }
      >
        Доступ к панели выдаётся вручную в базе данных. Если вы Роберт или
        Катя и видите это сообщение — проверьте, что вашей учётной записи
        присвоена роль admin.
      </EmptyState>
    );
  }

  if (loading) return <Loading label="Собираем данные…" />;

  const q = query.trim().toLowerCase();
  const projects = (data?.projects ?? []).filter((p) =>
    !q
      ? true
      : p.title.toLowerCase().includes(q) ||
        (p.code ?? '').toLowerCase().includes(q) ||
        (p.clients?.display_name ?? '').toLowerCase().includes(q) ||
        projectStatusLabel[p.status].toLowerCase().includes(q),
  );
  const clients = (data?.clients ?? []).filter((c) =>
    !q
      ? true
      : c.display_name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q),
  );
  const messages = data?.messages ?? [];

  return (
    <div className="grid gap-8">
      <header className="grid gap-4">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone">Панель «РЕцепт»</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.05] tracking-tight text-ink">
            Клиенты и проекты
          </h1>
          <div className="flex flex-wrap gap-2">
            <Action onClick={() => setNewClient(true)}>Новый клиент</Action>
            <Action variant="primary" onClick={() => setNewProject(true)}>
              Новый проект
            </Action>
          </div>
        </div>
      </header>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="max-w-xl">
        <Field label="Поиск по клиентам, проектам и статусам" htmlFor="admin-search">
          <Input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Фамилия, название проекта, «производство»…"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Проектов в работе" value={(data?.projects ?? []).filter((p) => !p.is_archived).length} />
        <Stat label="Клиентов" value={(data?.clients ?? []).length} />
        <Stat label="Открытых вопросов" value={messages.length} />
        <Stat
          label="Ждут согласования"
          value={(data?.projects ?? []).filter((p) => p.status === 'design').length}
        />
      </div>

      <TabBar
        items={[
          { key: 'projects', label: 'Проекты' },
          { key: 'clients', label: 'Клиенты' },
          { key: 'messages', label: 'Вопросы', badge: messages.length || undefined },
          { key: 'audit', label: 'Журнал' },
          ...(profile?.role === 'admin' ? [{ key: 'staff', label: 'Сотрудники' }] : []),
        ]}
        active={tab}
        onSelect={setTab}
      />

      {tab === 'projects' ? (
        projects.length === 0 ? (
          <EmptyState title="Проектов не найдено">
            Создайте первый проект — этапы разложатся автоматически.
          </EmptyState>
        ) : (
          <ul className="grid gap-3">
            {projects.map((p) => (
              <Panel as="li" key={p.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[1.125rem] leading-snug text-ink">{p.title}</p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {p.clients?.display_name ?? 'Без клиента'} · {p.furniture_type}
                    {p.code ? ` · ${p.code}` : ''} · обновлён {formatAgo(p.updated_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone={p.is_archived ? 'neutral' : 'active'}>
                    {p.is_archived ? 'Архив' : projectStatusLabel[p.status]}
                  </Pill>
                  <Link
                    href={`/kabinet/admin/proekt?id=${p.id}`}
                    className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                  >
                    Открыть
                  </Link>
                </div>
              </Panel>
            ))}
          </ul>
        )
      ) : null}

      {tab === 'clients' ? (
        clients.length === 0 ? (
          <EmptyState title="Клиентов не найдено" />
        ) : (
          <ul className="grid gap-3">
            {clients.map((c) => (
              <Panel as="li" key={c.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[1.125rem] leading-snug text-ink">{c.display_name}</p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {[c.phone, c.email].filter(Boolean).join(' · ') || 'Контакты не указаны'}
                  </p>
                </div>
                <Link
                  href={`/kabinet/admin/klient?id=${c.id}`}
                  className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                >
                  Карточка
                </Link>
              </Panel>
            ))}
          </ul>
        )
      ) : null}

      {tab === 'messages' ? (
        messages.length === 0 ? (
          <EmptyState title="Открытых вопросов нет">Все обращения клиентов разобраны.</EmptyState>
        ) : (
          <ul className="grid gap-3">
            {messages.map((m) => (
              <Panel as="li" key={m.id} className="grid gap-2">
                <p className="text-[0.8125rem] text-stone">
                  {m.projects?.title ?? 'Проект'} · {formatAgo(m.created_at)}
                </p>
                <p className="text-body leading-relaxed text-ink">{m.body}</p>
                <Link
                  href={`/kabinet/admin/proekt?id=${m.project_id}&tab=messages`}
                  className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                >
                  Ответить
                </Link>
              </Panel>
            ))}
          </ul>
        )
      ) : null}

      {tab === 'audit' ? (
        audit.length === 0 ? (
          <EmptyState title="Журнал пуст" />
        ) : (
          <ul className="grid divide-y divide-line border border-line">
            {audit.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 bg-cream p-4">
                <span className="text-[0.9375rem] text-ink">{describeAction(entry.action, entry.meta)}</span>
                <span className="text-[0.8125rem] text-stone">{formatAgo(entry.created_at)}</span>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === 'staff' && profile?.role === 'admin' ? <StaffPanel selfId={profile.id} /> : null}

      <NewClientModal open={newClient} onClose={() => setNewClient(false)} reload={reload} />
      <NewProjectModal
        open={newProject}
        clients={data?.clients ?? []}
        onClose={() => setNewProject(false)}
        reload={reload}
      />

      <p className="text-[0.8125rem] text-stone">
        Вы вошли как {profile?.email} · роль {profile?.role === 'admin' ? 'администратор' : 'сотрудник'}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Panel>
      <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">{label}</p>
      <p className="mt-2 font-display text-[1.75rem] text-ink">{value}</p>
    </Panel>
  );
}

function describeAction(action: string, meta: Record<string, unknown> | null) {
  const names: Record<string, string> = {
    'document.created': 'Создан документ',
    'document.published': 'Документ опубликован',
    'document.unpublished': 'Документ снят с публикации',
    'document.deleted': 'Документ удалён',
    'document.approved': 'Клиент согласовал документ',
    'document.changes_requested': 'Клиент запросил изменения',
    'version.uploaded': 'Загружена новая версия',
    'stage.status': 'Изменён этап',
    'invite.accepted': 'Принято приглашение',
  };
  const title = names[action] ?? action;
  const extra =
    (meta?.title as string) ?? (meta?.name as string) ?? (meta?.file as string) ?? '';
  return extra ? `${title}: ${extra}` : title;
}

function NewClientModal({
  open,
  onClose,
  reload,
}: {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый клиент"
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!name.trim()) {
                setError('Нужно имя или название');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                const id = await createClient({
                  display_name: name.trim(),
                  full_name: name.trim(),
                  phone: phone.trim() || null,
                  email: email.trim() || null,
                  internal_note: note.trim() || null,
                });
                await reload();
                onClose();
                window.location.assign(
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/kabinet/admin/klient/?id=${id}`,
                );
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Создать
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <LabeledInput label="Имя клиента" value={name} onChange={(e) => setName(e.target.value)} />
        <LabeledInput label="Телефон" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <LabeledInput
          label="Почта"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="На эту почту можно будет выслать приглашение"
        />
        <LabeledTextarea
          label="Внутренняя заметка"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}

function NewProjectModal({
  open,
  clients,
  onClose,
  reload,
}: {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>(furnitureTypes[0]);
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId && clients.length) setClientId(clients[0].id);
  }, [clients, clientId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый проект"
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!clientId) {
                setError('Сначала создайте клиента');
                return;
              }
              if (!title.trim()) {
                setError('Нужно название проекта');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                const id = await createProject({
                  client_id: clientId,
                  title: title.trim(),
                  furniture_type: type,
                  code: code.trim() || null,
                  address: address.trim() || null,
                });
                await reload();
                onClose();
                window.location.assign(
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/kabinet/admin/proekt/?id=${id}`,
                );
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Создать
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <LabeledSelect label="Клиент" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          {clients.length === 0 ? <option value="">Сначала создайте клиента</option> : null}
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.display_name}
            </option>
          ))}
        </LabeledSelect>
        <LabeledInput
          label="Название проекта"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Кухня на Калинина"
        />
        <LabeledSelect label="Тип мебели" value={type} onChange={(e) => setType(e.target.value)}>
          {furnitureTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </LabeledSelect>
        <LabeledInput
          label="Номер договора"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          hint="Необязательно, но помогает искать"
        />
        <LabeledInput label="Адрес объекта" value={address} onChange={(e) => setAddress(e.target.value)} />
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
