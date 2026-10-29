// Перевод данных калькулятора в формат личного кабинета клиента.
//
// Здесь нет сети и нет React: только чистые функции, которые собирают то,
// что увидит клиент. Это сделано нарочно — границу «что уходит клиенту»
// легко прочитать и легко покрыть тестами.
//
// ЧТО КЛИЕНТУ НЕ УХОДИТ НИКОГДА:
//   себестоимость, наценка, маржа, бланк на фабрику, комментарии менеджера,
//   причина отказа, аналитика, фотографии замера, цена за отдельную строку.
// Клиент видит состав заказа построчно и одну итоговую сумму.

import type {
  ClientProfile,
  ClientProjectPayment,
  OrderWorkflowStatus,
  Project,
  ProjectSchedule,
} from '../types';
import type { ClientOfferRollupRow } from './clientOffer';

/* ------------------------------------------------------------------ */
/* Типы обмена                                                         */
/* ------------------------------------------------------------------ */

export interface CabinetClientRef {
  ref: string;
  display_name: string;
  full_name?: string;
  phone?: string;
  email?: string;
  city?: string;
}

export type CabinetProjectStatus =
  | 'new'
  | 'design'
  | 'agreed'
  | 'production'
  | 'installation'
  | 'completed'
  | 'on_hold';

export interface CabinetProjectRef {
  ref: string;
  title: string;
  furniture_type?: string;
  address?: string;
  status?: CabinetProjectStatus;
  summary?: string;
}

export type CabinetDocumentCategory =
  | 'contract'
  | 'specification'
  | 'estimate'
  | 'sketch'
  | 'drawing'
  | 'electrics'
  | 'plumbing'
  | 'materials'
  | 'payment'
  | 'act'
  | 'warranty'
  | 'manual'
  | 'photo'
  | 'other';

export interface CabinetDocumentRef {
  ref: string;
  category: CabinetDocumentCategory;
  title: string;
  file_name: string;
  mime_type?: string;
  comment?: string;
  needs_approval?: boolean;
}

export interface CabinetCostRow {
  title: string;
  details?: string;
  /** Пусто у строк состава: клиент видит цену только одной итоговой строкой. */
  amount?: string;
}

export interface CabinetPaymentRow {
  title: string;
  amount?: string;
  paid_amount?: string;
  paid_on?: string;
  status: 'planned' | 'partial' | 'paid';
  note?: string;
}

export interface CabinetStageRow {
  name: string;
  status?: 'not_started' | 'in_progress' | 'waiting_client' | 'waiting_supplier' | 'done' | 'paused';
  planned_on?: string;
  completed_on?: string;
}

/** Документы калькулятора, которые имеет смысл показывать клиенту. */
export type CabinetDocumentKind =
  | 'offer'
  | 'specification'
  | 'contract'
  | 'receipt'
  | 'sketch'
  | 'package';

/* ------------------------------------------------------------------ */
/* Мелкие помощники                                                    */
/* ------------------------------------------------------------------ */

function clean(value: string | undefined | null): string | undefined {
  const text = (value ?? '').trim();
  return text === '' ? undefined : text;
}

/** Дата в виде ГГГГ-ММ-ДД. Всё, что не разбирается, отбрасывается — выдумывать даты нельзя. */
export function cabinetDate(value: string | undefined | null): string | undefined {
  const text = (value ?? '').trim();
  if (text === '') return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

/** Ключи связи. Один и тот же проект в калькуляторе и в кабинете — это одна строка. */
export const cabinetClientRef = (clientId: string): string => `calc:${clientId}`;
export const cabinetProjectRef = (projectId: string): string => `calc:${projectId}`;
export const cabinetDocumentRef = (projectId: string, kind: CabinetDocumentKind): string =>
  `calc:${projectId}:${kind}`;

/* ------------------------------------------------------------------ */
/* Клиент и проект                                                     */
/* ------------------------------------------------------------------ */

export function buildCabinetClient(profile: ClientProfile): CabinetClientRef {
  const name = clean(profile.name) ?? 'Клиент';
  return {
    ref: cabinetClientRef(profile.id),
    display_name: name,
    phone: clean(profile.phones?.[0]),
    email: clean(profile.emails?.[0])?.toLowerCase(),
  };
}

/** Статус сделки в калькуляторе → состояние проекта в кабинете. */
export function cabinetProjectStatus(
  workflow: OrderWorkflowStatus | undefined,
  fallback: Project['status'],
): CabinetProjectStatus {
  switch (workflow) {
    case 'draft':
    case 'calculating':
      return 'design';
    case 'offerSent':
    case 'clientThinking':
      return 'design';
    case 'approved':
    case 'techCheck':
      return 'agreed';
    case 'factorySent':
    case 'production':
      return 'production';
    case 'ready':
      return 'production';
    case 'delivered':
      return 'installation';
    case 'rejected':
      return 'on_hold';
    default:
      break;
  }
  if (fallback === 'approved') return 'agreed';
  if (fallback === 'archived') return 'completed';
  if (fallback === 'sent') return 'design';
  return 'new';
}

export function buildCabinetProject(project: Project, profile?: ClientProfile): CabinetProjectRef {
  return {
    ref: cabinetProjectRef(project.id),
    title: clean(project.name) ?? 'Проект',
    furniture_type: 'Кухня',
    address: clean(project.schedule?.address) ?? clean(profile?.objectAddress),
    status: cabinetProjectStatus(project.orderWorkflow?.status, project.status),
  };
}

/* ------------------------------------------------------------------ */
/* Состав заказа                                                       */
/* ------------------------------------------------------------------ */

/**
 * Состав заказа для клиента: построчно, без цены за строку,
 * и одна итоговая строка с суммой. Строки без количества пропускаются.
 */
export function buildCabinetComposition(
  rollup: ClientOfferRollupRow[],
  total: number | null | undefined,
): CabinetCostRow[] {
  const rows: CabinetCostRow[] = [];

  for (const row of rollup) {
    const title = clean(row.label);
    if (!title) continue;
    const names = row.items
      .map((item) => clean(item.name))
      .filter((name): name is string => Boolean(name));
    const unique = Array.from(new Set(names)).slice(0, 6);
    const parts = [clean(row.qtyText), unique.join(', ')].filter(Boolean);
    rows.push({ title, details: parts.length > 0 ? parts.join(' · ') : undefined });
  }

  if (typeof total === 'number' && Number.isFinite(total) && total > 0) {
    rows.push({ title: 'Итого по заказу', amount: String(Math.round(total)) });
  }

  return rows;
}

/* ------------------------------------------------------------------ */
/* Оплаты                                                              */
/* ------------------------------------------------------------------ */

const PAYMENT_TITLES: Record<string, string> = {
  prepay: 'Предоплата',
  final: 'Доплата',
  extra: 'Дополнительные работы',
  refund: 'Возврат',
};

/**
 * Оплаты для кабинета. Берутся только по-настоящему внесённые платежи:
 * придуманных графиков и несуществующих сроков тут быть не должно.
 */
export function buildCabinetPayments(payment: ClientProjectPayment | undefined): CabinetPaymentRow[] {
  if (!payment) return [];

  const entries = payment.entries ?? [];
  if (entries.length > 0) {
    return entries
      .filter((entry) => typeof entry.amount === 'number' && Number.isFinite(entry.amount))
      .map((entry) => ({
        title: PAYMENT_TITLES[entry.kind] ?? 'Платёж',
        amount: String(Math.round(Math.abs(entry.amount))),
        paid_amount: String(Math.round(Math.abs(entry.amount))),
        paid_on: cabinetDate(entry.at),
        status: 'paid' as const,
        note: clean(entry.comment),
      }));
  }

  const paid = payment.paidTotal ?? payment.prepayment ?? null;
  if (typeof paid === 'number' && Number.isFinite(paid) && paid > 0) {
    return [
      {
        title: payment.status === 'paid' ? 'Оплата по заказу' : 'Предоплата',
        amount: String(Math.round(paid)),
        paid_amount: String(Math.round(paid)),
        paid_on: cabinetDate(payment.paymentDate),
        status: 'paid',
      },
    ];
  }

  return [];
}

/* ------------------------------------------------------------------ */
/* Этапы                                                               */
/* ------------------------------------------------------------------ */

/**
 * Этапы кабинета, которым калькулятор знает настоящие даты.
 * Названия должны совпадать с этапами кабинета слово в слово — иначе
 * кабинет вернёт их в списке «неизвестные» и ничего не придумает сам.
 */
export function buildCabinetStages(
  schedule: ProjectSchedule | undefined,
  today: string = new Date().toISOString().slice(0, 10),
): CabinetStageRow[] {
  if (!schedule) return [];
  const rows: CabinetStageRow[] = [];

  const add = (name: string, date: string | undefined) => {
    const planned = cabinetDate(date);
    if (!planned) return;
    const done = planned <= today;
    rows.push({
      name,
      planned_on: planned,
      status: done ? 'done' : 'in_progress',
      completed_on: done ? planned : undefined,
    });
  };

  add('Замер помещения', schedule.measureAt);
  add('Проверка готовности', schedule.readyAt);
  add('Доставка', schedule.deliveryAt);
  add('Монтаж', schedule.installAt);

  return rows;
}

/* ------------------------------------------------------------------ */
/* Документы                                                           */
/* ------------------------------------------------------------------ */

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface DocumentPreset {
  category: CabinetDocumentCategory;
  title: string;
  needsApproval: boolean;
  mime: string;
}

const DOCUMENT_PRESETS: Record<CabinetDocumentKind, DocumentPreset> = {
  offer: { category: 'estimate', title: 'Коммерческое предложение', needsApproval: true, mime: DOCX_MIME },
  specification: { category: 'specification', title: 'Спецификация', needsApproval: false, mime: DOCX_MIME },
  contract: { category: 'contract', title: 'Договор', needsApproval: true, mime: DOCX_MIME },
  receipt: { category: 'payment', title: 'Квитанция об оплате', needsApproval: false, mime: DOCX_MIME },
  sketch: { category: 'sketch', title: 'Эскиз кухни', needsApproval: true, mime: 'application/pdf' },
  package: { category: 'other', title: 'Пакет документов', needsApproval: false, mime: 'application/zip' },
};

export function buildCabinetDocument(
  projectId: string,
  kind: CabinetDocumentKind,
  fileName: string,
  options: { comment?: string; title?: string; mimeType?: string } = {},
): CabinetDocumentRef {
  const preset = DOCUMENT_PRESETS[kind];
  return {
    ref: cabinetDocumentRef(projectId, kind),
    category: preset.category,
    title: clean(options.title) ?? preset.title,
    file_name: fileName,
    mime_type: clean(options.mimeType) ?? preset.mime,
    comment: clean(options.comment),
    needs_approval: preset.needsApproval,
  };
}

/* ------------------------------------------------------------------ */
/* Полная выгрузка проекта                                             */
/* ------------------------------------------------------------------ */

export interface CabinetSyncPayload {
  client: CabinetClientRef;
  project: CabinetProjectRef;
  costs?: CabinetCostRow[];
  payments?: CabinetPaymentRow[];
  stages?: CabinetStageRow[];
}

export function buildCabinetSync(input: {
  project: Project;
  profile: ClientProfile;
  rollup?: ClientOfferRollupRow[];
  total?: number | null;
  today?: string;
}): CabinetSyncPayload {
  const { project, profile, rollup, total } = input;
  const payment = profile.paymentsByProject?.[project.id];

  const payload: CabinetSyncPayload = {
    client: buildCabinetClient(profile),
    project: buildCabinetProject(project, profile),
    payments: buildCabinetPayments(payment),
    stages: buildCabinetStages(project.schedule, input.today),
  };

  // Состав отправляем только тогда, когда он посчитан: пустой массив в кабинете
  // означает «состава нет», и прежний состав будет стёрт.
  if (rollup && rollup.length > 0) {
    payload.costs = buildCabinetComposition(rollup, total ?? null);
  }

  return payload;
}
