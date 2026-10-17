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

    const t = window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>('input, textarea, button')
        ?.focus();
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
          className="fixed inset-0 z-100 flex items-end justify-center overflow-y-auto overscroll-contain bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-modal-title"
            className="animate-drawer relative w-full max-w-2xl bg-cream p-6 shadow-2xl sm:p-9"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть форму"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-stone transition-colors hover:bg-ink/5 hover:text-ink"
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

            <h2
              id="lead-modal-title"
              className="font-display max-w-[85%] text-[1.6rem] leading-tight tracking-tight text-ink sm:text-[2rem]"
            >
              {payload.title}
            </h2>
            <p className="mt-3 text-stone">{payload.lead}</p>

            <div className="mt-7">
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
                      className="font-semibold text-ink underline decoration-brass/50 underline-offset-4"
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
                          className="font-semibold text-ink underline decoration-brass/50 underline-offset-4"
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
      ) : null}
    </LeadModalContext.Provider>
  );
}
