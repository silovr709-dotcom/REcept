import Link from 'next/link';

export function Logo({
  tone = 'dark',
  className = '',
}: {
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="РЕцепт — мебельное ателье в Твери, на главную"
      className={`group inline-flex items-baseline gap-2 ${className}`}
    >
      <span
        className={`font-display text-[1.45rem] leading-none tracking-tight sm:text-[1.6rem] ${
          tone === 'light' ? 'text-cream' : 'text-ink'
        }`}
      >
        <span className="text-brass transition-colors group-hover:text-brasslight">
          РЕ
        </span>
        цепт
      </span>
      <span
        className={`hidden text-[0.625rem] font-semibold uppercase tracking-[0.18em] sm:inline ${
          tone === 'light' ? 'text-cream/60' : 'text-stone'
        }`}
      >
        Тверь
      </span>
    </Link>
  );
}
