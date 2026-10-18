import type {
  DocCategory,
  DocState,
  MessageStatus,
  PaymentStatus,
  ProjectStatus,
  StageStatus,
} from './types';

/** Подписи состояний и категорий. Все тексты — в одном месте. */

export const projectStatusLabel: Record<ProjectStatus, string> = {
  new: 'Новый проект',
  design: 'Проектирование',
  agreed: 'Согласовано',
  production: 'Производство',
  installation: 'Монтаж',
  completed: 'Завершён',
  on_hold: 'На паузе',
};

export const stageStatusLabel: Record<StageStatus, string> = {
  not_started: 'Не начат',
  in_progress: 'В работе',
  waiting_client: 'Ожидаем вас',
  waiting_supplier: 'Ожидаем поставщика',
  done: 'Завершён',
  paused: 'Приостановлен',
};

export const docCategoryLabel: Record<DocCategory, string> = {
  contract: 'Договоры и соглашения',
  specification: 'Спецификации и комплектация',
  estimate: 'Сметы и расчёты',
  sketch: 'Эскизы и дизайн-проект',
  drawing: 'Чертежи и размеры',
  electrics: 'Схемы электрики',
  plumbing: 'Коммуникации и техника',
  materials: 'Материалы и цвета',
  payment: 'Документы по оплатам',
  act: 'Акты приёмки',
  warranty: 'Гарантийные документы',
  manual: 'Инструкции и уход',
  photo: 'Фотографии объекта',
  other: 'Прочие файлы',
};

export const docCategoryOrder: DocCategory[] = [
  'contract',
  'specification',
  'estimate',
  'sketch',
  'drawing',
  'electrics',
  'plumbing',
  'materials',
  'payment',
  'act',
  'warranty',
  'manual',
  'photo',
  'other',
];

/** Категории, которые показываются в разделе «Эскизы и согласования». */
export const visualCategories: DocCategory[] = ['sketch', 'drawing', 'electrics', 'plumbing', 'materials'];

export const docStateLabel: Record<DocState, string> = {
  draft: 'Черновик',
  review: 'На рассмотрении',
  approved: 'Согласовано',
  archived: 'Архив',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  planned: 'Запланирован',
  partial: 'Оплачен частично',
  paid: 'Оплачен',
};

export const messageStatusLabel: Record<MessageStatus, string> = {
  open: 'Ждёт ответа',
  answered: 'Отвечено',
  closed: 'Закрыто',
};

export const furnitureTypes = [
  'Кухня',
  'Гардеробная',
  'Шкаф',
  'Прихожая',
  'Детская',
  'Мебель для ванной',
  'Гостиная',
  'Другое',
] as const;

export const noteCategories = [
  'Материалы и цвет',
  'Фурнитура',
  'Техника',
  'Электрика',
  'Размеры',
  'Сроки',
  'Доставка и монтаж',
  'Прочее',
] as const;

/** Цветовая подача состояния: только оттенки палитры сайта. */
export function toneOf(
  value: StageStatus | DocState | PaymentStatus | MessageStatus,
): 'neutral' | 'active' | 'done' | 'wait' {
  switch (value) {
    case 'done':
    case 'approved':
    case 'paid':
      return 'done';
    case 'in_progress':
    case 'review':
    case 'partial':
    case 'answered':
      return 'active';
    case 'waiting_client':
    case 'waiting_supplier':
    case 'paused':
    case 'open':
      return 'wait';
    default:
      return 'neutral';
  }
}
