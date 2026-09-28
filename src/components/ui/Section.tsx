import type { ReactNode } from 'react';

type Tone = 'cream' | 'bone' | 'ink' | 'sand';

const tones: Record<Tone, string> = {
  cream: 'bg-cream text-ink',
  bone: 'bg-bone text-ink',
  sand: 'bg-sand text-ink',
  ink: 'bg-ink text-cream',
};

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
      className={`${tones[tone]} py-(--spacing-section) ${className}`}
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
