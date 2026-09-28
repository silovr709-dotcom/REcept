import type { ReactNode } from 'react';

type Tone = 'cream' | 'bone' | 'ink' | 'sand';

const tones: Record<Tone, string> = {
  cream: 'bg-cream text-ink',
  bone: 'bg-bone text-ink',
  sand: 'bg-sand text-ink',
  ink: 'bg-ink text-cream',
};

/**
 * Секция без собственного оформления: ни рамок, ни теней, ни подложек.
 * Ритм страницы держат только крупные отступы и смена фона, а всё
 * внимание уходит на фотографии и заголовки.
 */
export function Section({
  children,
  tone = 'cream',
  id,
  className = '',
  as: Tag = 'section',
  'aria-labelledby': labelledBy,
}: {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'footer';
  'aria-labelledby'?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={[tones[tone], 'py-(--spacing-section)', className].join(' ')}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  className = '',
  tone = 'dark',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <p
      className={`flex items-center gap-3 text-eyebrow font-bold uppercase ${
        tone === 'dark' ? 'text-stone' : 'text-cream/60'
      } ${className}`}
    >
      {/* Засечка как на обмерном чертеже, а не декоративная линия */}
      <span
        aria-hidden="true"
        className={`inline-block h-3 w-px ${tone === 'dark' ? 'bg-brass' : 'bg-brasslight'}`}
      />
      {children}
    </p>
  );
}

/**
 * Заголовок раздела.
 *
 * Асимметричная раскладка: слева узкая колонка с номером и надписью,
 * справа сам заголовок и вступление. Симметричный блок по центру
 * контейнера — самая «сайтовая» из возможных композиций; сдвиг и
 * сквозная нумерация сразу читаются как редакторская вёрстка.
 *
 * Номер не декоративный: он показывает, что разделы образуют
 * последовательность, а не случайный набор.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  tone = 'dark',
  align = 'left',
  className = '',
  id,
}: {
  eyebrow?: string;
  /** Порядковый номер раздела, например «03» */
  index?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  className?: string;
  id?: string;
}) {
  if (align === 'center') {
    return (
      <div className={`mx-auto max-w-3xl text-center ${className}`}>
        {eyebrow ? (
          <Eyebrow tone={tone} className="justify-center">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h2
          id={id}
          className={`font-display mt-5 text-h2 ${tone === 'light' ? 'text-cream' : 'text-ink'}`}
        >
          {title}
        </h2>
        {lead ? (
          <div
            className={`mx-auto mt-5 text-lead ${tone === 'light' ? 'text-cream/70' : 'text-stone'}`}
          >
            {lead}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 lg:grid-cols-[10rem_1fr] lg:gap-12 ${className}`}>
      <div className="flex items-baseline gap-4 lg:flex-col lg:gap-3">
        {index ? (
          <span
            className={`label-xs ${tone === 'light' ? 'text-cream/45' : 'text-stone/70'}`}
          >
            {index}
          </span>
        ) : null}
        {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      </div>

      <div className="max-w-3xl">
        <h2
          id={id}
          className={`font-display text-h2 ${tone === 'light' ? 'text-cream' : 'text-ink'}`}
        >
          {title}
        </h2>
        {lead ? (
          <div
            className={`mt-6 text-lead ${tone === 'light' ? 'text-cream/70' : 'text-stone'}`}
          >
            {lead}
          </div>
        ) : null}
      </div>
    </div>
  );
}
