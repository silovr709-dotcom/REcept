import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * КНОПКИ
 * ======
 * Скруглённые «таблетки» — самый узнаваемый признак шаблонного сайта:
 * так выглядит любой лендинг, собранный из готовых блоков. Мастерская,
 * которая делает мебель по миллиметровым размерам, не может общаться
 * с человеком языком типовых элементов.
 *
 * Поэтому геометрия здесь чертёжная: прямой угол, тонкая линия, крупный
 * межбуквенный интервал и капитель — как подпись на техническом листе.
 * Заливка при наведении наезжает снизу, а не «подсвечивается».
 */

type Variant = 'primary' | 'brass' | 'outline' | 'ghost' | 'light';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-3 overflow-hidden ' +
  'rounded-none font-semibold uppercase leading-none ' +
  'transition-colors duration-300 active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-55 text-center';

/** Слой заливки, который наезжает снизу при наведении */
const sweep =
  'before:absolute before:inset-0 before:-z-0 before:origin-bottom ' +
  'before:scale-y-0 before:transition-transform before:duration-400 ' +
  'before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100 ' +
  'focus-visible:before:scale-y-100';

const variants: Record<Variant, string> = {
  // Основное действие: плотный графит, при наведении наезжает бронзовый слой
  primary: `bg-ink text-cream ${sweep} before:bg-brass`,
  // Исторический вариант — оставлен для совместимости, выглядит как основной
  brass: `bg-ink text-cream ${sweep} before:bg-brass`,
  outline: `border border-ink/30 text-ink ${sweep} before:bg-ink hover:text-cream hover:border-ink`,
  ghost: 'text-ink hover:text-brass',
  light: `border border-cream/35 text-cream ${sweep} before:bg-cream hover:text-ink hover:border-cream`,
};

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-6 py-3 text-[0.6875rem] tracking-[0.14em]',
  lg: 'min-h-14 px-8 py-4 text-[0.75rem] tracking-[0.13em]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Стрелка справа — намёк на движение вперёд */
  withArrow?: boolean;
};

function Inner({ children, withArrow }: { children: ReactNode; withArrow?: boolean }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      {withArrow ? (
        <svg
          aria-hidden="true"
          width="18"
          height="8"
          viewBox="0 0 18 8"
          fill="none"
          className="relative z-10 shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
        >
          <path
            d="M0 4h16.5M13 1l3.5 3L13 7"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="square"
          />
        </svg>
      ) : null}
    </>
  );
}

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  withArrow,
  ...rest
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      <Inner withArrow={withArrow}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  withArrow,
  href,
  ...rest
}: CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, 'href'>) {
  const isExternal = /^(https?:|tel:|mailto:)/.test(href);
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (isExternal) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        <Inner withArrow={withArrow}>{children}</Inner>
      </a>
    );
  }

  return (
    <Link href={href} className={cls} {...rest}>
      <Inner withArrow={withArrow}>{children}</Inner>
    </Link>
  );
}
