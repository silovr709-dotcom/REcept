'use client';

import { useActionState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/app/admin/actions';

/* ----------------------------- поля ----------------------------- */

const base =
  'w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-stone/60 focus:border-brass';

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.8125rem] font-semibold text-ink">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-stone">{hint}</span> : null}
    </label>
  );
}

export function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={`${base} resize-y leading-relaxed ${props.className ?? ''}`}
    />
  );
}

export function Checkbox({
  label,
  ...props
}: React.ComponentProps<'input'> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem] text-ink">
      <input
        type="checkbox"
        {...props}
        className="size-4 rounded border-line accent-[#8f6530]"
      />
      {label}
    </label>
  );
}

export function Card({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-cream p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.375rem] text-ink">{title}</h2>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-stone">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

/* --------------------------- сохранение --------------------------- */

function SaveBar({ extra }: { extra?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-8 flex flex-wrap items-center gap-3 border-t border-line bg-cream/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-cream transition-opacity disabled:opacity-60"
      >
        {pending ? 'Сохраняем…' : 'Сохранить и опубликовать'}
      </button>
      {extra}
      <span className="text-xs text-stone">
        Изменения появятся на сайте сразу после сохранения
      </span>
    </div>
  );
}

/**
 * Обёртка формы админки: сама показывает результат сохранения
 * и блокирует кнопку на время запроса.
 */
export function AdminForm({
  action,
  children,
  extraActions,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  extraActions?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction}>
      {state ? (
        <p
          role="status"
          className={`mb-5 rounded-lg border px-4 py-3 text-[0.9375rem] ${
            state.ok
              ? 'border-brass/40 bg-brass/10 text-ink'
              : 'border-red-300 bg-red-50 text-red-800'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {children}
      <SaveBar extra={extraActions} />
    </form>
  );
}
