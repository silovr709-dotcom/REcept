import type { ReactNode } from 'react';

/**
 * ПОМЕТКА НА ПОЛЯХ — «четвёртая стена»
 * ====================================
 * Весь остальной текст сайта написан от лица ателье. Здесь Роберт и
 * Катя выходят из этой роли и говорят с читателем напрямую: называют
 * вслух то, что он сейчас делает (сравнивает вкладки, ищет цену,
 * сомневается), и тем самым признают, что перед ним — сайт, а не
 * витрина с бесконечной правдой.
 *
 * Приём работает на конверсию, а не на украшение: названное вслух
 * сомнение перестаёт быть препятствием. Поэтому пометки стоят ровно
 * в тех местах, где человек принимает решение, и их намеренно мало —
 * четыре на всю страницу. Если их станет много, голос превратится
 * в болтовню и перестанет восприниматься как личный.
 *
 * Вёрстка: обычный блок в потоке с лёгким наклоном. Абсолютное
 * вынесение на поля выглядело бы точнее, но контейнер страницы
 * занимает всю ширину вплоть до 100rem — вынос за его край дал бы
 * горизонтальную прокрутку на ноутбуках, а этого в брифе нельзя.
 */
export function MarginNote({
  children,
  author,
  align = 'left',
  tone = 'dark',
  className = '',
}: {
  children: ReactNode;
  /** Кто пишет: «Роберт», «Катя» или оба */
  author: string;
  align?: 'left' | 'right';
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const ink = tone === 'light' ? 'text-cream/75' : 'text-stone';
  const line = tone === 'light' ? 'bg-cream/25' : 'bg-clay/60';
  const sign = tone === 'light' ? 'text-cream/55' : 'text-clay';

  return (
    <aside
      className={[
        'max-w-[26rem] text-pretty',
        align === 'right' ? 'sm:ml-auto sm:text-right' : '',
        className,
      ].join(' ')}
    >
      {/* Короткая черта «от руки» вместо рамки или иконки */}
      <span
        aria-hidden="true"
        className={`block h-px w-10 ${line} ${align === 'right' ? 'sm:ml-auto' : ''}`}
      />

      <p
        className={`mt-4 font-(family-name:--font-hand) text-[1.375rem] leading-[1.35] sm:text-[1.5rem] ${ink}`}
        style={{ transform: 'rotate(-0.6deg)' }}
      >
        {children}
      </p>

      <p
        className={`mt-2 font-(family-name:--font-hand) text-[1.125rem] ${sign}`}
        style={{ transform: 'rotate(-0.6deg)' }}
      >
        — {author}
      </p>
    </aside>
  );
}
