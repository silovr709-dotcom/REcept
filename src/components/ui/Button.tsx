import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * КНОПКИ
 * ======
 * Кнопка — то место, где сайт чаще всего выдаёт свою цену. Скруглённая
 * «таблетка» с градиентом стоит ноль рублей и выглядит ровно на столько
 * же. Поэтому геометрия здесь чертёжная: прямой угол, тонкая линия,
 * спокойный кегль.
 *
 * Надписи набраны обычными буквами, а не капителью в разрядку. Это
 * сознательная смена тона: КАПС В РАЗРЯДКУ кричит, а дорогая вещь не
 * повышает голос. Капитель осталась там, где она уместна по смыслу, —
 * в надзаголовках разделов.
 *
 * Поведение при наведении — смена плотности цвета и сдвиг стрелки на
 * три точки. Никаких заливок, которые наезжают снизу: движение должно
 * быть в мебели на фотографиях, а не в интерфейсе вокруг них.
 */

type Variant =
  | 'primary'
  | 'gold'
  | 'outline'
  | 'ghost'
  | 'light'
  | 'light-solid';
type Size = 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-3 ' +
  'rounded-none border font-medium leading-tight tracking-[0.01em] ' +
  'transition-[background-color,border-color,color] duration-400 ' +
  'ease-[cubic-bezier(0.22,0.61,0.36,1)] active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-55 text-center';

const variants: Record<Variant, string> = {
  // Основное действие: плотная синь
  primary: 'border-ink bg-ink text-cream hover:border-soot hover:bg-soot',
  // Второе по силе на светлой странице: та же синь, но контуром
  gold: 'border-gold/45 bg-transparent text-ink hover:border-gold hover:bg-gold/6',
  outline:
    'border-ink/22 bg-transparent text-ink hover:border-ink hover:bg-ink/4',
  ghost: 'border-transparent bg-transparent text-ink hover:text-gold',
  // На фотографии и на тёмном поле: тонкая светлая рамка
  light:
    'border-cream/40 bg-transparent text-cream hover:border-goldsoft hover:bg-cream/8',
  // На фотографии: плотная светлая плашка — главное действие первого экрана
  'light-solid': 'border-bone bg-bone text-ink hover:border-sand hover:bg-sand',
};

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-6 py-3 text-[0.9375rem]',
  lg: 'min-h-14 px-8 py-4 text-[1rem]',
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
          className="relative z-10 shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-x-[3px]"
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
