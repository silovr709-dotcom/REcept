'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchStaffProfiles,
  findProfileByEmail,
  setProfileRole,
  setUserBlocked,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import type { Profile, UserRole } from '@/lib/cabinet/types';
import {
  Action,
  EmptyState,
  LabeledInput,
  LabeledSelect,
  Loading,
  Modal,
  Notice,
  Panel,
  Pill,
} from './ui';

/**
 * СОТРУДНИКИ
 * ==========
 * Чтобы выдать права второму человеку, не нужно лезть в базу руками.
 * Порядок честный и безопасный: человек сначала сам регистрируется в
 * кабинете обычным способом, а администратор потом находит его по почте
 * и повышает до сотрудника. Так права достаются только живой учётной
 * записи с подтверждённой почтой, а не выдуманному адресу.
 *
 * Право менять роли есть только у администратора — это проверяет
 * политика базы, а не видимость кнопки.
 */

const roleTitle: Record<UserRole, string> = {
  client: 'Заказчик',
  staff: 'Сотрудник',
  admin: 'Администратор',
};

export function StaffPanel({ selfId }: { selfId: string }) {
  const [list, setList] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setList(await fetchStaffProfiles());
      setError(null);
    } catch (e) {
      setError(humanError(e));
      setList([]);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const change = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusyId(null);
    }
  };

  if (list === null) return <Loading label="Смотрим, у кого есть доступ…" />;

  return (
    <div className="grid gap-5">
      <Notice title="Как выдать доступ сотруднику">
        Сначала человек регистрируется в кабинете сам — по обычной ссылке
        входа, со своей почтой и паролем. Потом вы находите его здесь по этой
        же почте и назначаете роль. Пароль коллеги вам знать не нужно.
      </Notice>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.9375rem] text-stone">
          Людей с доступом к панели: {list.length}
        </p>
        <Action variant="primary" onClick={() => setAddOpen(true)}>
          Выдать доступ по почте
        </Action>
      </div>

      {list.length === 0 ? (
        <EmptyState title="Пока доступ есть только у вас" />
      ) : (
        <ul className="grid gap-3">
          {list.map((person) => {
            const self = person.id === selfId;
            return (
              <Panel as="li" key={person.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[1.125rem] leading-snug text-ink">
                    {person.full_name?.trim() || person.email || 'Без имени'}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {person.email}
                    {self ? ' · это вы' : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone={person.is_blocked ? 'neutral' : 'active'}>
                    {person.is_blocked ? 'Доступ закрыт' : roleTitle[person.role]}
                  </Pill>

                  {self ? (
                    <span className="text-[0.8125rem] text-stone">
                      свои права не меняются
                    </span>
                  ) : (
                    <>
                      <Action
                        size="sm"
                        busy={busyId === person.id}
                        onClick={() =>
                          void change(person.id, () =>
                            setProfileRole(person.id, person.role === 'admin' ? 'staff' : 'admin'),
                          )
                        }
                      >
                        {person.role === 'admin' ? 'Сделать сотрудником' : 'Сделать администратором'}
                      </Action>
                      <Action
                        size="sm"
                        variant="danger"
                        busy={busyId === person.id}
                        onClick={() =>
                          void change(person.id, () => setProfileRole(person.id, 'client'))
                        }
                      >
                        Забрать доступ к панели
                      </Action>
                      <Action
                        size="sm"
                        variant="quiet"
                        busy={busyId === person.id}
                        onClick={() =>
                          void change(person.id, () =>
                            setUserBlocked(person.id, !person.is_blocked),
                          )
                        }
                      >
                        {person.is_blocked ? 'Снять блокировку' : 'Заблокировать вход'}
                      </Action>
                    </>
                  )}
                </div>
              </Panel>
            );
          })}
        </ul>
      )}

      <GrantModal open={addOpen} onClose={() => setAddOpen(false)} reload={reload} />
    </div>
  );
}

function GrantModal({
  open,
  onClose,
  reload,
}: {
  open: boolean;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grant = async () => {
    const value = email.trim();
    if (!value) {
      setError('Укажите почту, с которой человек зарегистрировался.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const found = await findProfileByEmail(value);
      if (!found) {
        setError(
          'С такой почтой в кабинете никто не зарегистрирован. Попросите коллегу сначала завести вход на странице «Войти», потом выдайте права.',
        );
        return;
      }
      await setProfileRole(found.id, role);
      await reload();
      setEmail('');
      onClose();
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Выдать доступ к панели"
      footer={
        <>
          <Action variant="quiet" onClick={onClose}>
            Отмена
          </Action>
          <Action variant="primary" busy={busy} onClick={() => void grant()}>
            Выдать доступ
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        <LabeledInput
          label="Почта сотрудника"
          hint="Ровно та, с которой он зарегистрировался в кабинете."
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          inputMode="email"
        />
        <LabeledSelect
          label="Роль"
          hint="Сотрудник ведёт проекты. Администратор дополнительно раздаёт права."
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="staff">Сотрудник</option>
          <option value="admin">Администратор</option>
        </LabeledSelect>
      </div>
    </Modal>
  );
}
