'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { LeadForm } from './LeadForm';
import { useSite } from './SiteProvider';

type ModalPayload = {
  title?: string;
  lead?: string;
  submitLabel?: string;
  source?: string;
};

type Ctx = {
  open: (payload?: ModalPayload) => void;
  close: () => void;
  isOpen: boolean;
};

const LeadModalContext = createContext<Ctx | null>(null);

export function useLeadModal() {
  return useContext(LeadModalContext);
}

const DEFAULTS: Required<ModalPayload> = {
  title: 'Расскажите, какую кухню вы хотите',
  lead: 'Можно даже без точного проекта и размеров — разберёмся вместе. Это разговор, а не обязательство.',
  submitLabel: 'Обсудить мою кухню',
  source: 'modal',
};

export function LeadModalProvider({ children }: { children: ReactNode }) {
  const { contacts: activeContacts, primaryPhone } = useSite();
  const hasPhone = Boolean(primaryPhone);
  const phoneDisplay = primaryPhone?.display ?? '';
  const phoneHref = primaryPhone ? `tel:${primaryPhone.raw}` : '';
  const [payload, setPayload] = useState<Required<ModalPayload> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = useCallback((p?: ModalPayload) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setPayload({ ...DEFAULTS, ...p });
  }, []);

  const close = useCallback(() => {
    setPayload(null);
    lastFocused.current?.focus?.();
  }, []);

  // Блокировка скролла + Esc + ловушка фокуса
  useEffect(() => {
    if (!payload) return;

    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);

    /*
      Фокус уводим на само окно, а не на первое поле. Поле вызвало бы
      на телефоне клавиатуру поверх формы ещё до того, как человек
      прочитал заголовок, а крестик (он теперь первый в разметке)
      встречал бы его золотым кольцом фокуса.
    */
    const t = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 60);

    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [payload, close]);

  return (
    <LeadModalContext.Provider value={{ open, close, isOpen: Boolean(payload) }}>
      {children}

      {payload ? (
        <div
          className="fixed inset-0 z-100 flex items-end justify-center overscroll-contain bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/*
            ВЫСОТА. Раньше окно было обычным блоком внутри flex-контейнера
            с items-end: на телефоне форма оказывалась выше экрана, и её
            верх — заголовок вместе с крестиком — уезжал за верхнюю кромку
            без возможности доскроллить. Теперь окно само ограничено по
            высоте, шапка с крестиком прибита сверху, а прокручивается
            только содержимое.
          */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-labelledby="lead-modal-title"
            className="animate-drawer relative flex max-h-[94dvh] w-full max-w-2xl flex-col bg-cream shadow-2xl outline-none sm:max-h-[90dvh]"
          >
            {/* Выдвижной ящик: на телефоне окно приезжает снизу, и
                маленькая латунная засечка показывает, что это ящик */}
            <span
              aria-hidden="true"
              className="mx-auto mt-3 h-px w-12 shrink-0 bg-goldline/70 sm:hidden"
            />

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line/70 px-6 pb-4 pt-5 sm:px-9 sm:pb-5 sm:pt-8">
              <h2
                id="lead-modal-title"
                className="font-display text-head leading-tight tracking-tight text-ink"
              >
                {payload.title}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Закрыть форму"
                className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-stone transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-9 sm:pb-9 sm:pt-6">
              <p className="text-stone">{payload.lead}</p>

              <div className="mt-6">
                <LeadForm
                  tone="dark"
                  compact
                  submitLabel={payload.submitLabel}
                  source={payload.source}
                />
              </div>

              {(hasPhone || activeContacts.length > 0) && (
                <div className="mt-7 border-t border-line pt-5 text-sm text-stone">
                  {hasPhone ? (
                    <p>
                      Не любите формы?{' '}
                      <a
                        href={phoneHref}
                        className="inline-block py-1 font-semibold text-ink underline decoration-gold/50 underline-offset-4"
                      >
                        {phoneDisplay}
                      </a>
                    </p>
                  ) : (
                    <p>
                      Не любите формы? Напишите нам:{' '}
                      {activeContacts.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 ? ' · ' : ''}
                          <a
                            href={c.href}
                            className="inline-block py-1 font-semibold text-ink underline decoration-gold/50 underline-offset-4"
                          >
                            {c.label}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </LeadModalContext.Provider>
  );
}
