'use client';

import { useId, useState, type ReactNode } from 'react';

export type AccordionItem = {
  q: ReactNode;
  a: ReactNode;
};

/**
 * Доступный аккордеон: кнопка + region, управление с клавиатуры,
 * корректные aria-атрибуты.
 *
 * Внешне это не «список вопросов», а ряд ящиков: у каждого фасад с
 * ручкой, ответ выезжает на доводчике, а не раскрывается рывком.
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
                className={`flex w-full items-start justify-between gap-8 py-8 text-left text-h3 font-display ${qColor} transition-colors ${
                  tone === 'light' ? 'hover:text-goldsoft' : 'hover:text-gold'
                }`}
              >
                <span>{item.q}</span>
                {/* Вместо кружка с плюсом — фасад ящика с ручкой.
                    Закрытый ящик: ручка посередине. Открытый: фасад
                    отъезжает вниз, ручка уходит к нижней кромке */}
                <span
                  aria-hidden="true"
                  className={`relative mt-2 grid h-7 w-9 shrink-0 place-items-center border transition-colors ${
                    tone === 'light'
                      ? 'border-cream/25 bg-cream/5'
                      : 'border-line bg-bone'
                  }`}
                >
                  <span
                    className={`block h-0.5 w-4 rounded-[1px] bg-linear-to-b from-goldsoft to-gold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? 'translate-y-[7px]' : ''
                    }`}
                  />
                </span>
              </button>
            </h3>
            {/* Ящик на доводчике: содержимое выезжает, а не «раскрывается» */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              data-open={isOpen}
              className="drawer-panel"
            >
              <div>
                <div className={`pb-9 ${aColor} max-w-2xl`}>{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
