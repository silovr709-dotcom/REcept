'use client';

import { useId, useState, type ReactNode } from 'react';

export type AccordionItem = {
  q: ReactNode;
  a: ReactNode;
};

/**
 * Доступный аккордеон: кнопка + region, управление с клавиатуры,
 * корректные aria-атрибуты.
 */
export function Accordion({
  items,
  tone = 'dark',
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  tone?: 'dark' | 'light';
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  const border = tone === 'light' ? 'border-cream/15' : 'border-line';
  const qColor = tone === 'light' ? 'text-cream' : 'text-ink';
  const aColor = tone === 'light' ? 'text-cream/70' : 'text-stone';

  return (
    <div className={`border-t ${border}`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const btnId = `${baseId}-btn-${i}`;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div key={i} className={`border-b ${border}`}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`flex w-full items-start justify-between gap-6 py-6 text-left text-h3 font-display ${qColor} transition-colors ${
                  tone === 'light' ? 'hover:text-brasslight' : 'hover:text-brass'
                }`}
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className={`mt-1.5 grid size-7 shrink-0 place-items-center rounded-full border ${
                    tone === 'light' ? 'border-cream/25' : 'border-line'
                  } transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!isOpen}
              className={`pb-7 ${aColor} max-w-3xl`}
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
