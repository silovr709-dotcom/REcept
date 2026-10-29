import { LoaderController } from './LoaderController';

/**
 * ЗАСТАВКА ЗАГРУЗКИ
 * =================
 * Было: маленький рисунок кухни посередине пустого синего поля —
 * иконка, а не впечатление. Стало: во весь экран собирается один
 * фрезерованный фасад в натуральных пропорциях.
 *
 * Порядок сборки:
 *   1. По углам проступают приводочные метки — лист чертежа.
 *   2. От середины расходится латунный профиль GOLA.
 *   3. Под профилем встают две створки.
 *   4. Сверху вниз прорисовывается рейка — по одной фрезе.
 *   5. В стыке загорается тёплый свет: внутри шкафа кто-то есть.
 *   6. Проявляется знак ателье.
 *   7. Внизу доезжает латунная полоса — она же индикатор загрузки.
 *
 * Уход: створки распахиваются и открывают сайт. Тот же жест, что у
 * фотополосы на главной, — заставка и страница говорят на одном языке.
 *
 * Правила не изменились:
 * — человека не держим искусственно дольше, чем идёт сборка;
 * — повторный визит — ускоренная версия (sessionStorage);
 * — prefers-reduced-motion — статичный кадр без движения;
 * — если JS не отработал, шторка снимается чистым CSS (failsafe).
 */

/** Фрезеровка: шаг рейки внутри створки — как у настоящего фасада */
const REEDS = Array.from({ length: 9 }, (_, i) => 11 + i * 11);

function Door({
  x,
  delay,
  reedDelay,
}: {
  x: number;
  delay: number;
  reedDelay: number;
}) {
  return (
    <g>
      {/* Полотно створки */}
      <rect
        className="loader-piece loader-piece--down"
        style={{ '--d': `${delay}ms` } as React.CSSProperties}
        x={x}
        y="58"
        width="110"
        height="230"
        fill="#16243a"
        stroke="#6f8bb4"
        strokeWidth="0.9"
      />
      {/* Рейка: каждая фреза прорисовывается сверху вниз */}
      <g stroke="#8fa9cd" strokeWidth="0.9" strokeLinecap="round">
        {REEDS.map((dx, i) => (
          <line
            key={dx}
            className="loader-reed"
            style={{ '--d': `${reedDelay + i * 38}ms` } as React.CSSProperties}
            x1={x + dx}
            y1="66"
            x2={x + dx}
            y2="280"
          />
        ))}
      </g>
    </g>
  );
}

export function LoadingScreen() {
  return (
    <>
      <div id="recept-loader" role="status" aria-label="Сайт загружается">
        {/* Две створки шторки: в конце они и распахиваются */}
        <span aria-hidden="true" className="loader-leaf loader-leaf--l" />
        <span aria-hidden="true" className="loader-leaf loader-leaf--r" />

        {/* Приводочные метки по углам — лист цехового чертежа */}
        <span aria-hidden="true" className="loader-mark loader-mark--tl" />
        <span aria-hidden="true" className="loader-mark loader-mark--tr" />
        <span aria-hidden="true" className="loader-mark loader-mark--bl" />
        <span aria-hidden="true" className="loader-mark loader-mark--br" />

        <div className="loader-stage">
          <svg
            viewBox="0 0 420 330"
            fill="none"
            aria-hidden="true"
            className="w-[min(34rem,80vw)]"
          >
            <defs>
              <linearGradient id="loaderBrass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2cfa6" />
                <stop offset="55%" stopColor="#b69a63" />
                <stop offset="100%" stopColor="#6d5636" />
              </linearGradient>
              <linearGradient id="loaderSlit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffe6bd" stopOpacity="0.1" />
                <stop offset="45%" stopColor="#ffe6bd" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffe6bd" stopOpacity="0.1" />
              </linearGradient>
              <radialGradient id="loaderSpill" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#ffdfae" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#ffdfae" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="loaderEdgeL" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffdfae" stopOpacity="0" />
                <stop offset="100%" stopColor="#ffdfae" stopOpacity="0.13" />
              </linearGradient>
              <linearGradient id="loaderEdgeR" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffdfae" stopOpacity="0.13" />
                <stop offset="100%" stopColor="#ffdfae" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Выносная линия слева — лист остаётся чертежом */}
            <g
              className="loader-piece"
              style={{ '--d': '980ms' } as React.CSSProperties}
              stroke="#b69a63"
              strokeOpacity="0.45"
              strokeWidth="0.8"
            >
              <path d="M66 58v230M60 58h12M60 288h12" />
            </g>

            {/* Профиль GOLA над створками: расходится от середины */}
            <rect
              className="loader-gola"
              style={{ '--d': '150ms' } as React.CSSProperties}
              x="96"
              y="44"
              width="228"
              height="7"
              fill="url(#loaderBrass)"
            />

            <Door x={96} delay={430} reedDelay={760} />
            <Door x={214} delay={550} reedDelay={880} />

            {/* Свет в стыке створок */}
            <rect
              className="loader-light"
              style={{ '--d': '1450ms' } as React.CSSProperties}
              x="206"
              y="58"
              width="8"
              height="230"
              fill="url(#loaderSlit)"
            />
            {/* Отсвет на кромках соседних створок */}
            <rect
              className="loader-light"
              style={{ '--d': '1520ms' } as React.CSSProperties}
              x="188"
              y="58"
              width="18"
              height="230"
              fill="url(#loaderEdgeL)"
            />
            <rect
              className="loader-light"
              style={{ '--d': '1520ms' } as React.CSSProperties}
              x="214"
              y="58"
              width="18"
              height="230"
              fill="url(#loaderEdgeR)"
            />
            {/* Отсвет на полу */}
            <ellipse
              className="loader-light"
              style={{ '--d': '1600ms' } as React.CSSProperties}
              cx="210"
              cy="298"
              rx="132"
              ry="16"
              fill="url(#loaderSpill)"
            />

            {/* Цоколь: корпус стоит на утопленном основании */}
            <path
              className="loader-piece"
              style={{ '--d': '640ms' } as React.CSSProperties}
              d="M104 288v10h212v-10"
              stroke="#2b4166"
              strokeWidth="1"
            />
            <path
              className="loader-piece"
              style={{ '--d': '700ms' } as React.CSSProperties}
              d="M56 298h308"
              stroke="#2a4a7d"
              strokeWidth="1"
            />
          </svg>

          <div className="mt-8 text-center sm:mt-10">
            <p
              className="loader-text font-display text-head leading-none text-cream"
              style={{ '--d': '1620ms' } as React.CSSProperties}
            >
              <span className="text-goldsoft">РЕ</span>цепт
            </p>
            <p
              className="loader-text loader-tagline mt-3 text-small leading-relaxed text-cream/60"
              style={{ '--d': '1800ms' } as React.CSSProperties}
            >
              Собираем пространство для вашей жизни
            </p>

            {/* Повторный визит: сайт узнаёт, что вы уже здесь были.
                Показом управляет CSS по атрибуту data-loader, который
                выставлен до первой отрисовки — поэтому строка не мигает
                и не зависит от гидратации. */}
            <p
              className="loader-text loader-return mt-3 font-(family-name:--font-hand) text-sub leading-snug text-cream/75"
              style={{ '--d': '1800ms' } as React.CSSProperties}
            >
              С возвращением
            </p>
          </div>
        </div>

        {/* Латунная направляющая внизу: тот же профиль, что под шапкой */}
        <span aria-hidden="true" className="loader-rail">
          <span className="loader-rail-fill" />
        </span>

        <span className="sr-only">
          Загрузка сайта мебельного ателье «РЕцепт»
        </span>
      </div>
      <LoaderController />
    </>
  );
}
