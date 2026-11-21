'use client';

import Script from 'next/script';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const CONSENT_KEY = 'recept:analytics-consent:v1';
const SETTINGS_EVENT = 'recept:open-analytics-settings';
type Consent = 'checking' | 'pending' | 'accepted' | 'rejected';

function MetrikaPageView({ id }: { id: number }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;

    const from = previousPath.current;
    previousPath.current = pathname;
    window.ym?.(id, 'hit', window.location.href, {
      title: document.title,
      referer: `${window.location.origin}${from}`,
    });
  }, [id, pathname]);

  return null;
}

export function MetrikaConsent({ id }: { id: number }) {
  const [consent, setConsent] = useState<Consent>('checking');
  const analyticsWasAccepted = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CONSENT_KEY);
      analyticsWasAccepted.current = saved === 'accepted';
      setConsent(saved === 'accepted' ? 'accepted' : saved === 'rejected' ? 'rejected' : 'pending');
    } catch {
      setConsent('pending');
    }

    const openSettings = () => setConsent('pending');
    window.addEventListener(SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(SETTINGS_EVENT, openSettings);
  }, []);

  const choose = (next: 'accepted' | 'rejected') => {
    let previous: string | null = null;
    try {
      previous = window.localStorage.getItem(CONSENT_KEY);
      window.localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // Сохраняем выбор на текущем просмотре, даже если storage недоступен.
    }

    if (next === 'accepted') analyticsWasAccepted.current = true;
    if (next === 'rejected' && (previous === 'accepted' || analyticsWasAccepted.current)) {
      // Перезагрузка гарантирует, что уже загруженный счётчик больше не
      // продолжит собирать данные после отзыва согласия.
      window.location.reload();
      return;
    }
    setConsent(next);
  };

  const shouldTrack =
    consent === 'accepted' || (consent === 'pending' && analyticsWasAccepted.current);

  return (
    <>
      {shouldTrack ? (
        <>
          <Script id="ym-init" strategy="afterInteractive">
            {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${id}", "ym");
ym(${id}, "init", { ssr: true, webvisor: true, clickmap: true, ecommerce: "dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true });
window.__ymId = ${id};
            `}
          </Script>
          <MetrikaPageView id={id} />
        </>
      ) : null}

      {consent === 'pending' ? (
        <aside
          role="region"
          aria-live="polite"
          aria-labelledby="analytics-consent-title"
          className="fixed inset-x-3 bottom-3 z-[120] mx-auto max-w-4xl border border-line bg-cream p-5 text-ink shadow-[0_12px_48px_rgba(33,27,22,0.22)] sm:inset-x-6 sm:bottom-6 sm:p-6"
        >
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8">
            <div>
              <h2 id="analytics-consent-title" className="font-display text-big text-ink">
                Настройки аналитики
              </h2>
              <p className="mt-2 max-w-2xl text-small leading-relaxed text-stone">
                Яндекс.Метрика помогает понять, как пользуются сайтом. При согласии
                включится и Вебвизор, который записывает взаимодействие со страницами;
                поля формы заявки скрыты от записи. Выбор можно изменить в настройках
                cookie внизу сайта.{' '}
                <Link
                  href="/politika-konfidencialnosti"
                  className="text-ink underline decoration-gold/50 underline-offset-4"
                >
                  Подробнее — в политике обработки данных
                </Link>.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-48">
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="inline-flex min-h-11 items-center justify-center bg-ink px-5 py-3 text-small font-semibold text-cream transition-colors hover:bg-coal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Разрешить аналитику
              </button>
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="inline-flex min-h-11 items-center justify-center border border-line bg-transparent px-5 py-3 text-small font-semibold text-ink transition-colors hover:bg-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Только необходимые
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}
      className="-my-2 inline-flex min-h-11 items-center py-2 transition-colors hover:text-cream/80"
    >
      Настройки cookie
    </button>
  );
}
