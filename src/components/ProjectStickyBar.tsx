'use client';

import { useEffect, useState } from 'react';
import { CtaButton } from './CtaButton';

/**
 * ЛИПКАЯ СТРОКА ПРОЕКТА
 * =====================
 * Человек долистал проект до середины — первый экран с кнопкой уже уехал,
 * а решение «хочу так же» чаще всего приходит именно здесь, на деталях.
 *
 * Поэтому внизу остаётся одна строка: что это за проект и одна кнопка.
 * Только на больших экранах: на телефоне снизу уже есть своя панель
 * действий, вторая была бы навязчивостью.
 *
 * Строка прячется, когда виден блок заявки, — там кнопка и так перед глазами.
 */
export function ProjectStickyBar({
  title,
  layout,
}: {
  title: string;
  layout: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.9;

      const form = document.getElementById('zayavka');
      let overForm = false;
      if (form) {
        const rect = form.getBoundingClientRect();
        overForm = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
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

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 hidden border-t border-line bg-cream/95 backdrop-blur-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:block ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="container-page flex items-center justify-between gap-8 py-3.5">
        <p className="min-w-0 truncate text-ui text-ink">
          <span className="font-semibold">{title}</span>
          <span className="text-stone"> · {layout.toLowerCase()} компоновка</span>
        </p>
        <div className={visible ? '' : 'pointer-events-none'}>
          <CtaButton
            source="project_sticky"
            modalTitle="Рассчитать такую же кухню"
            modalLead="Пришлём расчёт с составом и сроком. Без звонка, если вам так удобнее."
            submitLabel="Получить расчёт"
            size="md"
          >
            Рассчитать такую же
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
