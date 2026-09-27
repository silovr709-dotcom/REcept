import { LoaderController } from './LoaderController';

/**
 * ФИРМЕННЫЙ LOADING SCREEN
 * ========================
 * Никаких спиннеров. За 1,5–2 секунды из линий собирается кухня:
 * корпуса → столешница → верхние модули → GOLA → вытяжка → свет.
 *
 * Правила:
 * — не задерживаем пользователя искусственно (уходит сразу после загрузки);
 * — повторный визит — ускоренная версия (sessionStorage);
 * — prefers-reduced-motion — статичный кадр без движения;
 * — если JS не отработал, шторка снимается чистым CSS (failsafe).
 *
 * Разметка отдаётся сервером, поэтому шторка есть уже в первом HTML
 * и не вызывает мигания контента.
 */
export function LoadingScreen() {
  return (
    <>
      <div id="recept-loader" role="status" aria-label="Сайт загружается">
        <div className="flex w-full max-w-[min(30rem,82vw)] flex-col items-center px-6">
          <svg
            viewBox="0 0 400 250"
            fill="none"
            aria-hidden="true"
            className="w-full"
          >
            <defs>
              <linearGradient id="loaderGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0C98A" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#F0C98A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Пол */}
            <path
              className="loader-piece"
              style={{ '--d': '0ms' } as React.CSSProperties}
              d="M30 222h340"
              stroke="#5B5348"
              strokeWidth="1"
            />

            {/* Нижние корпуса */}
            <g stroke="#CFC4B2" strokeWidth="1.2">
              <rect
                className="loader-piece loader-piece--up"
                style={{ '--d': '140ms' } as React.CSSProperties}
                x="60"
                y="150"
                width="88"
                height="72"
                fill="#221D18"
              />
              <rect
                className="loader-piece loader-piece--up"
                style={{ '--d': '240ms' } as React.CSSProperties}
                x="148"
                y="150"
                width="104"
                height="72"
                fill="#221D18"
              />
              <rect
                className="loader-piece loader-piece--up"
                style={{ '--d': '340ms' } as React.CSSProperties}
                x="252"
                y="150"
                width="88"
                height="72"
                fill="#221D18"
              />
            </g>

            {/* Столешница */}
            <rect
              className="loader-piece loader-piece--left"
              style={{ '--d': '520ms' } as React.CSSProperties}
              x="54"
              y="141"
              width="292"
              height="9"
              rx="1.5"
              fill="#D9CDB8"
            />

            {/* Верхние модули */}
            <g stroke="#CFC4B2" strokeWidth="1.2">
              <rect
                className="loader-piece loader-piece--down"
                style={{ '--d': '700ms' } as React.CSSProperties}
                x="60"
                y="40"
                width="86"
                height="62"
                fill="#221D18"
              />
              <rect
                className="loader-piece loader-piece--down"
                style={{ '--d': '790ms' } as React.CSSProperties}
                x="254"
                y="40"
                width="86"
                height="62"
                fill="#221D18"
              />
            </g>

            {/* Вытяжка */}
            <path
              className="loader-piece loader-piece--down"
              style={{ '--d': '880ms' } as React.CSSProperties}
              d="M178 40h44v26l-9 22h-26l-9-22V40z"
              fill="#2E2A23"
              stroke="#8F6530"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* GOLA / профиль-ручка */}
            <path
              className="loader-gola"
              style={{ '--d': '1020ms' } as React.CSSProperties}
              d="M60 158h280"
              stroke="#C79A54"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              className="loader-gola"
              style={{ '--d': '1080ms' } as React.CSSProperties}
              d="M60 104h86M254 104h86"
              stroke="#C79A54"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Свет под верхними модулями */}
            <path
              className="loader-light"
              style={{ '--d': '1220ms' } as React.CSSProperties}
              d="M60 106h86l16 34H44l16-34zM254 106h86l16 34H238l16-34z"
              fill="url(#loaderGlow)"
            />

            {/* Фартук-линия */}
            <path
              className="loader-piece"
              style={{ '--d': '1300ms' } as React.CSSProperties}
              d="M146 141V104h108v37"
              stroke="#3A342C"
              strokeWidth="1"
            />
          </svg>

          <div className="mt-8 text-center">
            <p
              className="loader-text font-display text-[1.75rem] tracking-tight text-cream sm:text-[2rem]"
              style={{ '--d': '1380ms' } as React.CSSProperties}
            >
              <span className="text-brasslight">РЕ</span>цепт
            </p>
            <p
              className="loader-text mt-2.5 text-[0.8125rem] leading-relaxed text-cream/55 sm:text-sm"
              style={{ '--d': '1520ms' } as React.CSSProperties}
            >
              Собираем пространство для вашей жизни
            </p>
          </div>
        </div>
        <span className="sr-only">Загрузка сайта мебельного ателье «РЕцепт»</span>
      </div>
      <LoaderController />
    </>
  );
}
