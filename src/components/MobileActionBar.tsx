'use client';

import { useEffect, useState } from 'react';
import { useLeadModal } from './LeadModal';
import { useSite } from './SiteProvider';

/**
 * Фиксированная нижняя панель на мобильных.
 * Появляется только после первого экрана — чтобы не перекрывать hero
 * и не давить на человека до того, как он что-то понял о нас.
 * Скрывается, когда открыта форма в конце страницы: там кнопка уже есть.
 */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false);
  const modal = useLeadModal();
  const { primaryPhone, messengers } = useSite();

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.65;
      const form = document.getElementById('zayavka');
      let overForm = false;
      if (form) {
        const rect = form.getBoundingClientRect();
        overForm = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
      }
      setVisible(past && !overForm);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const secondary = primaryPhone
    ? {
        href: `tel:${primaryPhone.raw}`,
        label: 'Позвонить',
        aria: `Позвонить ${primaryPhone.display}`,
      }
    : messengers[0]
      ? {
          href: messengers[0].href,
          label: 'Написать',
          aria: `Написать в ${messengers[0].label}`,
        }
      : null;

  return (
    <div
      className="mobile-bar-enter no-print fixed inset-x-0 bottom-0 z-80 border-t border-line bg-cream/97 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md lg:hidden"
      data-visible={visible}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2.5">
        {secondary ? (
          <a
            href={secondary.href}
            aria-label={secondary.aria}
            tabIndex={visible ? 0 : -1}
            className="grid min-h-13 shrink-0 place-items-center rounded-full border border-ink/20 px-5 text-[0.9375rem] font-semibold text-ink"
          >
            {secondary.label}
          </a>
        ) : null}

        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={() =>
            modal?.open({
              title: 'Рассчитаем вашу кухню',
              lead: 'Оставьте контакт — Роберт или Катя свяжутся и подскажут, с чего начать. Без обязательств.',
              submitLabel: 'Получить расчёт',
              source: 'mobile-bar',
            })
          }
          className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-brass px-5 text-[0.9375rem] font-semibold text-white shadow-[0_8px_24px_-10px_rgba(160,115,56,0.8)]"
        >
          Рассчитать кухню
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[0.6875rem] leading-tight text-stone">
        Бесплатно и без обязательств
      </p>
    </div>
  );
}
