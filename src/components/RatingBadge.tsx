import { rating } from '@/data/reviews';
import { yandex } from '@/data/site';

function Stars({ tone }: { tone: 'dark' | 'light' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex gap-0.5 ${tone === 'light' ? 'text-brasslight' : 'text-brass'}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path d="m10 1.5 2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Рейтинг с Яндекс Карт.
 * Цифры не вбиты «для красоты»: это реальные значения карточки организации,
 * и ссылка ведёт туда же, где их можно проверить.
 *
 * Микроразметку aggregateRating мы сознательно НЕ ставим: разметка чужих
 * отзывов на своём сайте противоречит правилам поисковиков.
 */
export function RatingBadge({
  tone = 'dark',
  className = '',
}: {
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <a
      href={yandex.reviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 rounded-full border px-4 py-2 transition-colors ${
        tone === 'light'
          ? 'border-cream/20 hover:border-cream/45'
          : 'border-line bg-cream hover:border-brass/50'
      } ${className}`}
    >
      <span
        className={`font-display text-[1.25rem] leading-none ${
          tone === 'light' ? 'text-cream' : 'text-ink'
        }`}
      >
        {rating.value}
      </span>
      <Stars tone={tone} />
      <span
        className={`text-[0.8125rem] leading-tight ${
          tone === 'light' ? 'text-cream/60' : 'text-stone'
        }`}
      >
        {rating.reviewsCount} отзыва
        <span className="hidden sm:inline"> на Яндекс Картах</span>
      </span>
      <svg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
          tone === 'light' ? 'text-cream/60' : 'text-brass'
        }`}
      >
        <path
          d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
