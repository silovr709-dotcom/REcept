'use client';

import { useState } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import { changeOwnPassword, updateOwnProfile } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { Action, LabeledInput, Modal, Notice, Panel } from './ui';

/**
 * МОЯ УЧЁТНАЯ ЗАПИСЬ
 * ==================
 * Два действия, которые человек должен уметь делать сам, без писем в
 * мастерскую: поправить имя с телефоном и сменить пароль.
 *
 * Пароль меняет сам Supabase у вошедшего пользователя. Старый пароль
 * при этом не передаётся никуда и нигде не хранится, а новый сайт не
 * запоминает: он уходит прямо в службу входа.
 */

export function AccountPanel() {
  const { profile, refresh } = useCabinet();
  const [editOpen, setEditOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (!profile) return null;

  const roleLabel =
    profile.role === 'admin'
      ? 'администратор'
      : profile.role === 'staff'
        ? 'сотрудник'
        : 'заказчик';

  return (
    <Panel className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Моя учётная запись
          </p>
          <p className="mt-2 text-body text-ink">
            {profile.full_name?.trim() || 'Имя не указано'}
          </p>
          <p className="mt-1 text-[0.8125rem] text-stone">
            {profile.email} · роль: {roleLabel}
            {profile.phone ? ` · ${profile.phone}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Action size="sm" onClick={() => setEditOpen(true)}>
            Изменить данные
          </Action>
          <Action size="sm" variant="primary" onClick={() => setPassOpen(true)}>
            Сменить пароль
          </Action>
        </div>
      </div>

      {done ? <Notice title="Готово">{done}</Notice> : null}

      <ProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={profile.full_name ?? ''}
        initialPhone={profile.phone ?? ''}
        userId={profile.id}
        onSaved={async () => {
          setDone('Данные обновлены.');
          await refresh();
        }}
      />

      <PasswordModal
        open={passOpen}
        onClose={() => setPassOpen(false)}
        onSaved={() => setDone('Пароль изменён. В следующий раз входите с новым паролем.')}
      />
    </Panel>
  );
}

function ProfileModal({
  open,
  onClose,
  initialName,
  initialPhone,
  userId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initialName: string;
  initialPhone: string;
  userId: string;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateOwnProfile(userId, { full_name: name.trim(), phone: phone.trim() });
      await onSaved();
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
      title="Мои данные"
      footer={
        <>
          <Action variant="quiet" onClick={onClose}>
            Отмена
          </Action>
          <Action variant="primary" busy={busy} onClick={() => void save()}>
            Сохранить
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        <LabeledInput
          label="Как к вам обращаться"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <LabeledInput
          label="Телефон"
          hint="Нужен нам только для связи по проекту."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
        />
        <p className="text-[0.8125rem] leading-relaxed text-stone">
          Почта входа не меняется здесь: чтобы её заменить, напишите нам — так
          никто не сможет тихо увести чужой доступ.
        </p>
      </div>
    </Modal>
  );
}

function PasswordModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (password.length < 8) {
      setError('Пароль должен быть не короче восьми символов.');
      return;
    }
    if (password !== repeat) {
      setError('Пароли не совпадают.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changeOwnPassword(password);
      setPassword('');
      setRepeat('');
      onSaved();
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
      title="Смена пароля"
      footer={
        <>
          <Action variant="quiet" onClick={onClose}>
            Отмена
          </Action>
          <Action variant="primary" busy={busy} onClick={() => void save()}>
            Сменить пароль
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        {error ? <Notice tone="error">{error}</Notice> : null}
        <LabeledInput
          label="Новый пароль"
          hint="Не короче восьми символов."
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <LabeledInput
          label="Повторите новый пароль"
          type="password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          autoComplete="new-password"
        />
        <p className="text-[0.8125rem] leading-relaxed text-stone">
          Пароль уходит напрямую в службу входа. Сайт его не видит, не
          пересылает и нигде не сохраняет.
        </p>
      </div>
    </Modal>
  );
}
