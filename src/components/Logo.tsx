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
        className={`font-logo text-[1.45rem] leading-none tracking-tight sm:text-[1.6rem] ${
          tone === 'light' ? 'text-cream' : 'text-ink'
        }`}
      >
        {/* На тёмной фотографии тёмно-оливковый «РЕ» просто пропадал,
            и в шапке читалось «цепт». Над фото берём светлый тон. */}
        <span
          className={`transition-colors ${
            tone === 'light'
              ? 'text-goldsoft group-hover:text-cream'
              : 'text-gold group-hover:text-goldsoft'
          }`}
        >
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
