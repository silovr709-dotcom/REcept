import type { ReactNode } from 'react';

type Tone = 'cream' | 'bone' | 'ink' | 'sand';

const tones: Record<Tone, string> = {
  cream: 'bg-cream text-ink',
  bone: 'bg-bone text-ink',
  sand: 'bg-sand text-ink',
  ink: 'bg-ink text-cream',
};

/**
 * СЕКЦИЯ КАК ФАСАД
 * ================
 * Страница собрана не из «блоков», а из фасадов корпуса. Каждая секция
 * получает то, по чему глаз узнаёт мебель без ручек:
 *
 * — теневой зазор по верхней кромке и светлую фаску под ним;
 * — перепад освещённости сверху вниз, как на крашеной плоскости;
 * — петли на левой кромке, на четверти и три четверти высоты;
 * — лёгкое выдвижение навстречу, пока фасад входит в кадр.
 *
 * Благодаря этому структура читается как мебель ещё до того,
 * как человек начал разбирать текст.
 */
export function Section({
  children,
  tone = 'cream',
  id,
  className = '',
  as: Tag = 'section',
  'aria-labelledby': labelledBy,
  /** Петли уместны не везде: на узких вставках они мешают */
  hinges = true,
}: {
  children: ReactNode;
  tone?: Tone;
  id?: string;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'footer';
  'aria-labelledby'?: string;
  hinges?: boolean;
}) {
  const dark = tone === 'ink';

  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={[
        'front front-pull',
        dark ? 'front-dark front-surface-dark' : 'front-surface',
        tones[tone],
        'py-(--spacing-section)',
        className,
      ].join(' ')}
    >
      {hinges ? (
        <span
          aria-hidden="true"
          className="hinges pointer-events-none absolute inset-y-0 left-0 w-0"
        />
      ) : null}
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

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = 'dark',
  align = 'left',
  className = '',
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={`${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}
    >
      {eyebrow ? (
        <Eyebrow tone={tone} className={align === 'center' ? 'justify-center' : ''}>
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
          className={`mt-5 text-lead ${
            tone === 'light' ? 'text-cream/70' : 'text-stone'
          } ${align === 'center' ? 'mx-auto' : ''}`}
        >
          {lead}
        </div>
      ) : null}
    </div>
  );
}
