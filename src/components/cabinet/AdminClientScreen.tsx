'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import {
  createInvite,
  fetchClient,
  fetchClientProjects,
  fetchInvites,
  revokeInvite,
  updateClient,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { projectStatusLabel } from '@/lib/cabinet/labels';
import { formatDate, formatDateTime } from '@/lib/cabinet/format';
import type { Client, Project, ProjectInvite } from '@/lib/cabinet/types';
import {
  Action,
  CopyButton,
  EmptyState,
  KeyValue,
  LabeledInput,
  LabeledSelect,
  Loading,
  Modal,
  Notice,
  Panel,
  Pill,
} from './ui';

/**
 * КАРТОЧКА КЛИЕНТА
 * ================
 * Здесь же выдаётся доступ в кабинет. Два пути, оба безопасные:
 * — персональная ссылка с одноразовым токеном;
 * — приглашение на почту: человек просто регистрируется сам, и доступ
 *   применяется автоматически при совпадении адреса.
 */

export function AdminClientScreen({ clientId }: { clientId: string }) {
  const { status, isStaff } = useCabinet();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, p, i] = await Promise.all([
        fetchClient(clientId),
        fetchClientProjects(clientId),
        fetchInvites(clientId),
      ]);
      setClient(c);
      setProjects(p);
      setInvites(i);
      setError(null);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (status === 'ready' && isStaff) void load();
    else if (status !== 'loading') setLoading(false);
  }, [status, isStaff, load]);

  if (status === 'loading' || loading) return <Loading />;
  if (!isStaff) return <EmptyState title="Раздел только для сотрудников" />;
  if (!client) return <EmptyState title="Клиент не найден" />;

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <Link href="/kabinet/admin" className="text-[0.8125rem] text-stone transition-colors hover:text-ink">
          ← Панель
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] leading-[1.05] tracking-tight text-ink">
            {client.display_name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Action onClick={() => setEditOpen(true)}>Изменить данные</Action>
            <Action variant="primary" onClick={() => setInviteOpen(true)}>
              Пригласить в кабинет
            </Action>
          </div>
        </div>
      </header>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <Panel className="grid gap-5 sm:grid-cols-3">
        <KeyValue label="Телефон">{client.phone || '—'}</KeyValue>
        <KeyValue label="Почта">{client.email || '—'}</KeyValue>
        <KeyValue label="Город">{client.city || '—'}</KeyValue>
        {client.internal_note ? (
          <div className="sm:col-span-3">
            <KeyValue label="Внутренняя заметка">{client.internal_note}</KeyValue>
          </div>
        ) : null}
      </Panel>

      <section className="grid gap-3">
        <h2 className="font-display text-[1.25rem] text-ink">Проекты клиента</h2>
        {projects.length === 0 ? (
          <EmptyState title="Проектов пока нет">
            Создайте проект в панели — он автоматически привяжется к этому клиенту.
          </EmptyState>
        ) : (
          <ul className="grid gap-3">
            {projects.map((p) => (
              <Panel as="li" key={p.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-[1.0625rem] text-ink">{p.title}</p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {p.furniture_type} · создан {formatDate(p.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
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
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-[1.25rem] text-ink">Приглашения</h2>
        {invites.length === 0 ? (
          <p className="text-[0.9375rem] text-stone">
            Приглашений не выписано. Нажмите «Пригласить в кабинет» — получится
            персональная ссылка.
          </p>
        ) : (
          <ul className="grid gap-3">
            {invites.map((invite) => {
              const url = inviteUrl(invite.token);
              const dead = Boolean(invite.revoked_at) || new Date(invite.expires_at) < new Date();
              return (
                <Panel as="li" key={invite.id} className="grid gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-body text-ink">{invite.email || 'Ссылка без привязки к почте'}</p>
                      <p className="mt-1 text-[0.8125rem] text-stone">
                        Действует до {formatDate(invite.expires_at)}
                        {invite.accepted_at ? ` · принято ${formatDateTime(invite.accepted_at)}` : ''}
                      </p>
                    </div>
                    <Pill tone={invite.accepted_at ? 'done' : dead ? 'neutral' : 'wait'}>
                      {invite.accepted_at ? 'Принято' : dead ? 'Недействительно' : 'Ждёт'}
                    </Pill>
                  </div>

                  {!invite.accepted_at && !dead ? (
                    <>
                      <p className="break-all border border-line bg-bone px-3 py-2 text-[0.8125rem] text-stone">
                        {url}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton value={url} label="Скопировать ссылку" />
                        <a
                          href={mailtoLink(client.display_name, invite.email, url)}
                          className="inline-flex min-h-9 items-center justify-center border border-ink/25 px-3.5 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-cream"
                        >
                          Письмо клиенту
                        </a>
                        <Action
                          size="sm"
                          variant="quiet"
                          onClick={() => void revokeInvite(invite.id).then(load)}
                        >
                          Отозвать
                        </Action>
                      </div>
                    </>
                  ) : null}
                </Panel>
              );
            })}
          </ul>
        )}
      </section>

      <InviteModal
        open={inviteOpen}
        client={client}
        projects={projects}
        onClose={() => setInviteOpen(false)}
        reload={load}
      />

      <EditClientModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        reload={load}
      />
    </div>
  );
}

function inviteUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${base}/kabinet/vhod/?invite=${token}`;
}

function mailtoLink(name: string, email: string | null, url: string) {
  const subject = encodeURIComponent('Доступ в личный кабинет «РЕцепт»');
  const body = encodeURIComponent(
    `Здравствуйте, ${name}!\n\n` +
      'Мы завели для вашего проекта личный кабинет. В нём лежат договор, эскизы, ' +
      'схемы, этапы работ и все договорённости — доступ круглосуточный.\n\n' +
      `Ссылка для входа: ${url}\n\n` +
      'Ссылка персональная: откройте её, задайте пароль — и проект появится в кабинете.\n\n' +
      'Роберт и Катя, мебельное ателье «РЕцепт»',
  );
  return `mailto:${email ?? ''}?subject=${subject}&body=${body}`;
}

function InviteModal({
  open,
  client,
  projects,
  onClose,
  reload,
}: {
  open: boolean;
  client: Client;
  projects: Project[];
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [email, setEmail] = useState(client.email ?? '');
  const [projectId, setProjectId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ProjectInvite | null>(null);

  return (
    <Modal
      open={open}
      onClose={() => {
        setCreated(null);
        onClose();
      }}
      title="Приглашение в кабинет"
      footer={
        created ? (
          <Action
            variant="primary"
            onClick={() => {
              setCreated(null);
              onClose();
            }}
          >
            Готово
          </Action>
        ) : (
          <>
            <Action onClick={onClose}>Отмена</Action>
            <Action
              variant="primary"
              busy={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  const invite = await createInvite({
                    client_id: client.id,
                    project_id: projectId || null,
                    email: email.trim() || null,
                  });
                  setCreated(invite);
                  await reload();
                } catch (e) {
                  setError(humanError(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Создать приглашение
            </Action>
          </>
        )
      }
    >
      {created ? (
        <div className="grid gap-4">
          <Notice title="Приглашение готово">
            Отправьте ссылку клиенту любым привычным способом. Она одноразовая
            и действует 30 дней.
          </Notice>
          <p className="break-all border border-line bg-bone px-3 py-2 text-[0.8125rem] text-stone">
            {inviteUrl(created.token)}
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={inviteUrl(created.token)} label="Скопировать ссылку" />
            <a
              href={mailtoLink(client.display_name, created.email, inviteUrl(created.token))}
              className="inline-flex min-h-9 items-center justify-center border border-ink/25 px-3.5 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              Открыть письмо
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          <LabeledInput
            label="Почта клиента"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="Если указать — доступ применится автоматически при регистрации на эту почту"
          />
          <LabeledSelect
            label="Проект"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            hint="Можно выдать доступ сразу ко всем проектам клиента"
          >
            <option value="">Все проекты клиента</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </LabeledSelect>
          {error ? <Notice tone="error">{error}</Notice> : null}
        </div>
      )}
    </Modal>
  );
}

function EditClientModal({
  open,
  client,
  onClose,
  reload,
}: {
  open: boolean;
  client: Client;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(client);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setDraft(client), [client]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Данные клиента"
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await updateClient(client.id, {
                  display_name: draft.display_name,
                  full_name: draft.full_name,
                  phone: draft.phone,
                  email: draft.email,
                  city: draft.city,
                  internal_note: draft.internal_note,
                  is_archived: draft.is_archived,
                });
                await reload();
                onClose();
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Сохранить
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <LabeledInput
          label="Имя"
          value={draft.display_name}
          onChange={(e) => setDraft({ ...draft, display_name: e.target.value })}
        />
        <LabeledInput
          label="Телефон"
          value={draft.phone ?? ''}
          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
        />
        <LabeledInput
          label="Почта"
          value={draft.email ?? ''}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
        />
        <LabeledInput
          label="Город"
          value={draft.city ?? ''}
          onChange={(e) => setDraft({ ...draft, city: e.target.value })}
        />
        <LabeledInput
          label="Внутренняя заметка"
          value={draft.internal_note ?? ''}
          onChange={(e) => setDraft({ ...draft, internal_note: e.target.value })}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
