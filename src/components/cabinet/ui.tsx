'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

/**
 * КИРПИЧИКИ КАБИНЕТА
 * ==================
 * Та же дизайн-система, что и на публичном сайте: прямой угол, тонкая
 * линия, крупная разрядка в подписях, много воздуха. Никаких ярких
 * градиентов и «админочных» таблиц — человек должен узнать тот же
 * бренд, только в рабочем режиме.
 */

/* ----------------------------- поверхности ----------------------------- */

export function Panel({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <Tag className={`border border-line bg-cream p-5 sm:p-7 ${className}`}>{children}</Tag>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-eyebrow font-semibold uppercase tracking-[0.2em] text-stone ${className}`}>
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  eyebrow,
  action,
  id,
}: {
  children: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 id={id} className="font-display text-sub leading-tight tracking-tight text-ink sm:text-head">
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------- кнопки -------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'quiet' | 'danger';
  size?: 'sm' | 'md';
  busy?: boolean;
};

export function Action({
  variant = 'outline',
  size = 'md',
  busy,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-none font-semibold uppercase ' +
    'tracking-[0.12em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50';
  const sizes = {
    sm: 'min-h-9 px-3.5 py-2 text-caption',
    md: 'min-h-11 px-5 py-2.5 text-caption',
  } as const;
  const variants = {
    primary: 'bg-ink text-cream hover:bg-coal',
    outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-cream',
    quiet: 'text-stone hover:text-ink',
    danger: 'border border-ink/20 text-stone hover:border-ink hover:text-ink',
  } as const;

  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || busy}
      {...rest}
    >
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-3.5 animate-spin border border-current border-t-transparent ${className}`}
    />
  );
}

/* -------------------------------- поля --------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={htmlFor}
        className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone"
      >
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-small leading-snug text-stone">{hint}</p> : null}
      {error ? <p className="text-small leading-snug text-ink">{error}</p> : null}
    </div>
  );
}

const inputClass =
  'w-full rounded-none border border-line bg-bone px-4 py-3 text-body text-ink ' +
  'placeholder:text-stone focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input className={`${inputClass} ${className}`} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', rows = 4, ...rest } = props;
  return <textarea rows={rows} className={`${inputClass} ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <select className={`${inputClass} ${className}`} {...rest}>
      {children}
    </select>
  );
}

/** Поле с подписью одним вызовом — экономит повторы в формах. */
export function LabeledInput({
  label,
  hint,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string | null; id?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fieldId}>
      <Input id={fieldId} {...rest} />
    </Field>
  );
}

export function LabeledTextarea({
  label,
  hint,
  id,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; id?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} hint={hint} htmlFor={fieldId}>
      <Textarea id={fieldId} {...rest} />
    </Field>
  );
}

export function LabeledSelect({
  label,
  hint,
  id,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; id?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} hint={hint} htmlFor={fieldId}>
      <Select id={fieldId} {...rest}>
        {children}
      </Select>
    </Field>
  );
}

/* ----------------------------- состояния ------------------------------- */

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'active' | 'done' | 'wait';
}) {
  const tones = {
    neutral: 'border-line text-stone',
    active: 'border-ink/40 text-ink',
    done: 'border-ink bg-ink text-cream',
    wait: 'border-ink/30 bg-sand text-ink',
  } as const;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap border px-2.5 py-1 text-caption font-semibold uppercase tracking-[0.14em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Notice({
  children,
  tone = 'info',
  title,
}: {
  children?: ReactNode;
  tone?: 'info' | 'warn' | 'error';
  title?: string;
}) {
  const border = tone === 'info' ? 'border-line' : 'border-ink/35';
  return (
    <div className={`border-l-2 ${border} bg-bone px-4 py-3`} role={tone === 'error' ? 'alert' : undefined}>
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
      {children ? <div className="text-ui leading-relaxed text-stone">{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line px-6 py-12 text-center">
      <p className="font-display text-big text-ink">{title}</p>
      {children ? <div className="mx-auto mt-3 max-w-md text-ui leading-relaxed text-stone">{children}</div> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Loading({ label = 'Загружаем…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-1 py-10 text-stone" aria-live="polite">
      <Spinner />
      <span className="text-ui">{label}</span>
    </div>
  );
}

/* -------------------------------- окно --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Закрыть окно"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]"
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[92vh] w-full overflow-y-auto border border-line bg-cream p-5 shadow-2xl outline-none sm:p-8 ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <h2 className="font-display text-sub leading-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 p-2 text-stone transition-colors hover:text-ink"
            aria-label="Закрыть"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
        {children}
        {footer ? <div className="mt-8 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ------------------------------- вкладки ------------------------------- */

export function TabBar({
  items,
  active,
  onSelect,
}: {
  items: Array<{ key: string; label: string; badge?: number }>;
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="-mx-gutter overflow-x-auto px-gutter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1 border-b border-line" role="tablist">
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSelect(item.key)}
              className={`relative whitespace-nowrap px-4 py-3 text-caption font-semibold uppercase tracking-[0.14em] transition-colors ${
                selected ? 'text-ink' : 'text-stone hover:text-ink'
              }`}
            >
              {item.label}
              {item.badge ? (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center bg-ink px-1.5 py-0.5 text-caption text-cream">
                  {item.badge}
                </span>
              ) : null}
              {selected ? <span className="absolute inset-x-3 -bottom-px h-px bg-ink" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- мелкие помощники --------------------------- */

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">{label}</p>
      <div className="text-body text-ink">{children}</div>
    </div>
  );
}

/** Копирование в буфер с понятным подтверждением. */
export function CopyButton({ value, label = 'Скопировать' }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Action
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? 'Скопировано' : label}
    </Action>
  );
}
