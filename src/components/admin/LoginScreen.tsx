'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction } from '@/app/admin/actions';
import { Field, Input } from './ui';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 font-semibold text-cream transition-opacity disabled:opacity-60"
    >
      {pending ? 'Проверяем…' : 'Войти'}
    </button>
  );
}

export function LoginScreen({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="font-display text-center text-[1.75rem] text-cream">
          <span className="text-brasslight">РЕ</span>цепт
        </p>
        <p className="mt-2 text-center text-sm text-cream/60">
          Управление сайтом
        </p>

        <div className="mt-8 rounded-xl border border-cream/12 bg-cream p-6 sm:p-8">
          {!configured ? (
            <div className="text-[0.9375rem] text-ink">
              <p className="font-semibold">Админка ещё не настроена</p>
              <p className="mt-3 text-stone">
                Добавьте в файл <code className="text-ink">.env.local</code> две
                строки и перезапустите сайт:
              </p>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-bone p-3 text-xs text-ink">
                {`ADMIN_PASSWORD=ваш_пароль\nAUTH_SECRET=длинная_случайная_строка`}
              </pre>
              <p className="mt-4 text-xs text-stone">
                AUTH_SECRET нужен, чтобы подписывать вход. Подойдёт любая
                случайная строка от 32 символов — её достаточно придумать один
                раз и никому не показывать.
              </p>
            </div>
          ) : (
            <form action={formAction}>
              {state && !state.ok ? (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {state.message}
                </p>
              ) : null}

              <Field label="Пароль">
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </Field>

              <SubmitButton />
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-cream/45">
          Эта страница закрыта от поисковых систем
        </p>
      </div>
    </div>
  );
}
