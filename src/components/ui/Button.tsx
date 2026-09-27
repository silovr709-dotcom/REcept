import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'brass' | 'outline' | 'ghost' | 'light';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 font-semibold ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-300 ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-55 text-center';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-cream hover:bg-coal shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_10px_30px_-12px_rgba(22,19,15,0.55)] hover:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_16px_40px_-14px_rgba(22,19,15,0.6)]',
  brass:
    'bg-brass text-white hover:bg-[#8d6330] shadow-[0_10px_30px_-12px_rgba(160,115,56,0.7)]',
  outline:
    'border border-ink/25 text-ink hover:border-ink/70 hover:bg-ink/[0.04]',
  ghost: 'text-ink hover:bg-ink/[0.05]',
  light:
    'border border-cream/30 text-cream hover:bg-cream/10 hover:border-cream/60',
};

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5 py-2.5 text-[0.9375rem] rounded-full',
  lg: 'min-h-14 px-7 py-3.5 text-[1rem] rounded-full',
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
      <span>{children}</span>
      {withArrow ? (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        >
          <path
            d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
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
