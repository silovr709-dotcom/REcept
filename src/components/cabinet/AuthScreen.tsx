'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabase, humanError } from '@/lib/cabinet/supabase';
import { acceptInvite } from '@/lib/cabinet/api';
import { useCabinet } from '@/lib/cabinet/session';
import { Action, LabeledInput, Notice, Panel } from './ui';

/**
 * ВХОД В КАБИНЕТ
 * ==============
 * Четыре состояния на одном экране: вход, регистрация по приглашению,
 * запрос письма для восстановления и установка нового пароля.
 *
 * Регистрация сама по себе не открывает ничего: пока сотрудник не
 * свяжет учётную запись с клиентом (ссылкой-приглашением или заранее
 * выписанным приглашением на эту почту), человек видит пустой кабинет.
 */

type Mode = 'signin' | 'signup' | 'reset' | 'newpassword';

function basePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? '';
}

export function AuthScreen({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const { status } = useCabinet();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Ссылка-приглашение и ссылка восстановления приходят с параметрами в адресе.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      try {
        sessionStorage.setItem('recept:invite', token);
      } catch {
        /* приватный режим — просто не запоминаем */
      }
      setMode('signup');
    } else {
      try {
        const saved = sessionStorage.getItem('recept:invite');
        if (saved) setInviteToken(saved);
      } catch {
        /* нечего читать */
      }
    }
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    if (hash.get('type') === 'recovery' || params.get('type') === 'recovery') {
      setMode('newpassword');
    }
    if (hash.get('error_description')) {
      setError(decodeURIComponent(hash.get('error_description') ?? ''));
    }
  }, []);

  // Пользователь уже вошёл, а в адресе был токен приглашения — применяем.
  useEffect(() => {
    if (status !== 'ready' || !inviteToken) return;
    (async () => {
      try {
        await acceptInvite(inviteToken);
        sessionStorage.removeItem('recept:invite');
        window.location.replace(`${basePath()}/kabinet/`);
      } catch (e) {
        setError(humanError(e));
      }
    })();
  }, [status, inviteToken]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabase();
    if (!supabase) {
      setError('Кабинет пока не подключён');
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
        if (inviteToken) {
          await acceptInvite(inviteToken).catch(() => undefined);
          sessionStorage.removeItem('recept:invite');
        }
        window.location.assign(`${basePath()}/kabinet/`);
        return;
      }

      if (mode === 'signup') {
        if (password.length < 8) throw new Error('Пароль должен быть не короче 8 знаков');
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim(), phone: phone.trim() },
            emailRedirectTo: `${window.location.origin}${basePath()}/kabinet/vhod/`,
          },
        });
        if (err) throw err;
        if (data.session) {
          if (inviteToken) await acceptInvite(inviteToken).catch(() => undefined);
          window.location.assign(`${basePath()}/kabinet/`);
          return;
        }
        setMessage(
          'Мы отправили письмо на указанную почту. Откройте ссылку из письма — после этого вход заработает.',
        );
        return;
      }

      if (mode === 'reset') {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}${basePath()}/kabinet/vhod/?type=recovery`,
        });
        if (err) throw err;
        setMessage(
          'Если такая почта зарегистрирована, на неё придёт письмо со ссылкой для смены пароля.',
        );
        return;
      }

      if (mode === 'newpassword') {
        if (password.length < 8) throw new Error('Пароль должен быть не короче 8 знаков');
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
        setMessage('Пароль изменён. Сейчас откроем кабинет.');
        setTimeout(() => window.location.assign(`${basePath()}/kabinet/`), 1200);
      }
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }

  const titles: Record<Mode, string> = {
    signin: 'Вход в личный кабинет',
    signup: inviteToken ? 'Создание кабинета по приглашению' : 'Регистрация',
    reset: 'Восстановление пароля',
    newpassword: 'Новый пароль',
  };

  const leads: Record<Mode, string> = {
    signin: 'Здесь собраны документы, эскизы, этапы и договорённости по вашему проекту.',
    signup: inviteToken
      ? 'Приглашение найдено. Задайте пароль — и проект откроется в кабинете.'
      : 'Если с нами уже заключён договор, зарегистрируйтесь на ту же почту, которую вы нам оставляли.',
    reset: 'Пришлём ссылку для смены пароля на вашу почту.',
    newpassword: 'Придумайте новый пароль — не короче восьми знаков.',
  };

  return (
    <div className="mx-auto w-full max-w-md py-6 sm:py-12">
      <Panel>
        <h1 className="font-display text-head leading-tight tracking-tight text-ink">
          {titles[mode]}
        </h1>
        <p className="mt-3 text-ui leading-relaxed text-stone">{leads[mode]}</p>

        {inviteToken && mode !== 'newpassword' ? (
          <div className="mt-5">
            <Notice title="У вас персональная ссылка">
              Доступ к проекту откроется сразу после входа. Ссылка одноразовая и
              привязана к вашему заказу.
            </Notice>
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-6 grid gap-5" noValidate>
          {mode === 'signup' ? (
            <>
              <LabeledInput
                label="Как к вам обращаться"
                id="cab-name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
              />
              <LabeledInput
                label="Телефон (необязательно)"
                id="cab-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7"
              />
            </>
          ) : null}

          {mode !== 'newpassword' ? (
            <LabeledInput
              label="Почта"
              id="cab-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          ) : null}

          {mode !== 'reset' ? (
            <LabeledInput
              label={mode === 'newpassword' ? 'Новый пароль' : 'Пароль'}
              id="cab-password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signin' ? undefined : 8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={mode === 'signin' ? undefined : 'Не короче 8 знаков'}
            />
          ) : null}

          {error ? <Notice tone="error">{error}</Notice> : null}
          {message ? <Notice>{message}</Notice> : null}

          <Action type="submit" variant="primary" busy={busy} className="w-full">
            {mode === 'signin'
              ? 'Войти'
              : mode === 'signup'
                ? 'Создать кабинет'
                : mode === 'reset'
                  ? 'Прислать ссылку'
                  : 'Сохранить пароль'}
          </Action>
        </form>

        <div className="mt-6 grid gap-2 border-t border-line pt-5 text-ui text-stone">
          {mode !== 'signin' ? (
            <button type="button" className="text-left transition-colors hover:text-ink" onClick={() => setMode('signin')}>
              У меня уже есть кабинет — войти
            </button>
          ) : null}
          {mode !== 'signup' ? (
            <button type="button" className="text-left transition-colors hover:text-ink" onClick={() => setMode('signup')}>
              Я впервые — зарегистрироваться
            </button>
          ) : null}
          {mode !== 'reset' ? (
            <button type="button" className="text-left transition-colors hover:text-ink" onClick={() => setMode('reset')}>
              Забыли пароль
            </button>
          ) : null}
        </div>
      </Panel>

      <p className="mt-6 px-1 text-small leading-relaxed text-stone">
        Кабинет нужен только нашим заказчикам. Чтобы посмотреть работы и
        условия, регистрация не нужна —{' '}
        <Link href="/" className="text-ink underline underline-offset-4">
          вернуться на сайт
        </Link>
        .
      </p>
    </div>
  );
}
