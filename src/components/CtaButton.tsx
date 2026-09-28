'use client';

import type { ComponentProps } from 'react';
import { Button } from './ui/Button';
import { useLeadModal } from './LeadModal';
import { reachGoal } from '@/lib/analytics';

type Props = {
  /** Заголовок формы в модальном окне — подстраиваем под контекст кнопки */
  modalTitle?: string;
  modalLead?: string;
  submitLabel?: string;
  /** Откуда пришла заявка — попадёт в письмо */
  source: string;
  children: React.ReactNode;
} & Omit<ComponentProps<typeof Button>, 'children' | 'onClick'>;

/**
 * Главный конверсионный элемент сайта.
 * Открывает короткую форму прямо поверх страницы — человеку не нужно
 * никуда скроллить и терять контекст того, что он только что прочитал.
 * Если JS по какой-то причине не загрузился, кнопка ведёт к форме внизу.
 */
export function CtaButton({
  modalTitle,
  modalLead,
  submitLabel,
  source,
  children,
  ...rest
}: Props) {
  const modal = useLeadModal();

  if (!modal) {
    return (
      <a href="#zayavka" className="contents">
        <Button {...rest}>{children}</Button>
      </a>
    );
  }

  return (
    <Button
      {...rest}
      onClick={() => {
        reachGoal('lead_form_open', { source });
        modal.open({
          title: modalTitle,
          lead: modalLead,
          submitLabel,
          source,
        });
      }}
    >
      {children}
    </Button>
  );
}
