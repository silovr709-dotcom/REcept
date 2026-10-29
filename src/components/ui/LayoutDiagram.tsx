/**
 * СХЕМЫ КОМПОНОВОК
 * ================
 * Четыре карточки «прямая / угловая / П-образная / с островом»
 * раньше были четырьмя абзацами текста подряд — а речь в них идёт
 * ровно о геометрии, то есть о том, что проще один раз увидеть.
 *
 * Это намеренно схема, а не фотография: фотография показала бы
 * конкретную чужую кухню и увела бы разговор в цвет фасадов, тогда
 * как здесь нужно показать только форму и проход. Рисуем вручную —
 * никаких стоковых иконок, вес линии и пропорции те же, что и
 * в остальной графике сайта.
 */
const WALL = 'currentColor';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 84"
      role="img"
      aria-hidden="true"
      className="h-auto w-full text-ink"
    >
      {/* Стены комнаты */}
      <rect
        x="4"
        y="4"
        width="112"
        height="76"
        fill="none"
        stroke={WALL}
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      {/* Окно на дальней стене — масштаб и ориентир */}
      <line
        x1="46"
        y1="4"
        x2="78"
        y2="4"
        stroke={WALL}
        strokeOpacity="0.5"
        strokeWidth="4"
      />
      {children}
    </svg>
  );
}

/** Рабочий фронт: короб мебели */
function Run(props: React.SVGProps<SVGRectElement>) {
  return <rect fill={WALL} fillOpacity="0.85" {...props} />;
}

export function LayoutDiagram({ variant }: { variant: string }) {
  if (variant === 'corner') {
    return (
      <Frame>
        <Run x="4" y="4" width="13" height="62" />
        <Run x="4" y="66" width="60" height="14" />
      </Frame>
    );
  }

  if (variant === 'u') {
    return (
      <Frame>
        <Run x="4" y="4" width="13" height="76" />
        <Run x="103" y="4" width="13" height="76" />
        <Run x="17" y="66" width="86" height="14" />
      </Frame>
    );
  }

  if (variant === 'island') {
    return (
      <Frame>
        <Run x="4" y="66" width="112" height="14" />
        <Run x="33" y="34" width="54" height="16" rx="1" />
      </Frame>
    );
  }

  // Прямая — одна линия вдоль стены
  return (
    <Frame>
      <Run x="4" y="66" width="112" height="14" />
    </Frame>
  );
}
