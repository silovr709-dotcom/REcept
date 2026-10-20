// Связь калькулятора с личным кабинетом клиента.
//
// Браузер ходит только на собственный PHP-сервер калькулятора (/api/cabinet/…),
// а уже он разговаривает с кабинетом. Секретный ключ кабинета в браузер
// не попадает никогда — он лежит в api/config.php на хостинге.

import {
  ServerRequestError,
  ServerUnavailableError,
  apiUrl,
} from './serverApi';
import {
  buildCabinetDocument,
  buildCabinetSync,
  cabinetProjectRef,
  type CabinetClientRef,
  type CabinetDocumentKind,
  type CabinetDocumentRef,
  type CabinetProjectRef,
  type CabinetSyncPayload,
} from './cabinetPayload';
import type { ClientOfferRollupRow } from './clientOffer';
import type { ClientProfile, Project } from '../types';

async function request<T>(route: string, body?: unknown, method = 'POST'): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(route), {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ServerUnavailableError('Нет связи с сервером');
  }

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new ServerUnavailableError('На этом адресе нет серверной части');
  }
  if (!res.ok) {
    throw new ServerRequestError(res.status, String(json.error ?? `Ошибка сервера (HTTP ${res.status})`), json);
  }
  return json as T;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(blob);
  });
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/* ------------------------------------------------------------------ */
/* Состояние моста                                                     */
/* ------------------------------------------------------------------ */

export interface CabinetHealth {
  configured: boolean;
  url?: string;
  site?: string;
  curl?: boolean;
}

/** Настроен ли кабинет на этом хостинге. По этому ответу прячется кнопка отправки. */
export async function cabinetHealth(): Promise<CabinetHealth> {
  return request<CabinetHealth>('cabinet/health', undefined, 'GET');
}

/* ------------------------------------------------------------------ */
/* Отправка документа                                                  */
/* ------------------------------------------------------------------ */

export interface CabinetPublishResult {
  ok: true;
  projectId: string | null;
  documentId: string | null;
  version: number | null;
  sizeBytes: number;
}

/**
 * Одна кнопка «Отправить клиенту в кабинет».
 *
 * Сначала уезжают клиент, проект, состав, оплаты и этапы, затем сам файл.
 * Повторная отправка того же документа создаёт новую версию: прежняя
 * остаётся в истории, а согласованную версию подменить нельзя.
 */
export async function publishToCabinet(input: {
  project: Project;
  profile: ClientProfile;
  kind: CabinetDocumentKind;
  blob: Blob;
  fileName: string;
  comment?: string;
  title?: string;
  /** Состав заказа: если не передан, прежний состав в кабинете не трогаем. */
  rollup?: ClientOfferRollupRow[];
  total?: number | null;
}): Promise<CabinetPublishResult> {
  const sync = buildCabinetSync({
    project: input.project,
    profile: input.profile,
    rollup: input.rollup,
    total: input.total,
  });

  await syncToCabinet(sync);

  const document: CabinetDocumentRef = buildCabinetDocument(
    input.project.id,
    input.kind,
    input.fileName,
    { comment: input.comment, title: input.title, mimeType: input.blob.type },
  );

  return request<CabinetPublishResult>('cabinet/publish', {
    client: sync.client,
    project: sync.project,
    document,
    data: await blobToBase64(input.blob),
  });
}

/* ------------------------------------------------------------------ */
/* Выгрузка данных проекта                                             */
/* ------------------------------------------------------------------ */

export interface CabinetSyncResult {
  ok: true;
  result: {
    project_id: string;
    costs: number;
    payments: number;
    stages: number;
    /** Этапы, которых в кабинете нет: кабинет не придумывает их сам. */
    unknown_stages: string[];
  };
}

export async function syncToCabinet(payload: CabinetSyncPayload): Promise<CabinetSyncResult> {
  return request<CabinetSyncResult>('cabinet/sync', payload);
}

/** Короткий путь: выгрузить проект целиком, без документа. */
export async function syncProjectToCabinet(input: {
  project: Project;
  profile: ClientProfile;
  rollup?: ClientOfferRollupRow[];
  total?: number | null;
}): Promise<CabinetSyncResult> {
  return syncToCabinet(buildCabinetSync(input));
}

/* ------------------------------------------------------------------ */
/* Доступ клиента                                                      */
/* ------------------------------------------------------------------ */

export interface CabinetInviteResult {
  ok: true;
  token: string;
  /** Ссылка, которую можно отправить клиенту самим: он заведёт пароль и войдёт. */
  link: string;
}

export async function inviteClientToCabinet(input: {
  project: Project;
  profile: ClientProfile;
  email?: string;
}): Promise<CabinetInviteResult> {
  const payload = buildCabinetSync({ project: input.project, profile: input.profile });
  return request<CabinetInviteResult>('cabinet/invite', {
    client: payload.client,
    project: payload.project,
    email: input.email ?? payload.client.email,
  });
}

/* ------------------------------------------------------------------ */
/* Что происходит на стороне клиента                                   */
/* ------------------------------------------------------------------ */

export interface CabinetDocumentState {
  ref: string | null;
  title: string;
  category: string;
  state: 'draft' | 'review' | 'approved' | 'archived';
  published: boolean;
  version: number | null;
  approved_at: string | null;
}

export interface CabinetStatus {
  ok: true;
  result: {
    known: boolean;
    project_id?: string;
    has_access?: boolean;
    pending_invite?: boolean;
    documents?: CabinetDocumentState[];
    unread_messages?: number;
  };
}

export async function cabinetProjectStatusInfo(projectId: string): Promise<CabinetStatus> {
  return request<CabinetStatus>('cabinet/status', { project_ref: cabinetProjectRef(projectId) });
}

export type CabinetEvent =
  | {
      kind: 'decision';
      at: string;
      project_ref: string | null;
      document_ref: string | null;
      document_title: string;
      version: number;
      decision: 'approved' | 'rejected' | 'changes_requested';
      comment: string | null;
      who: string | null;
    }
  | {
      kind: 'message';
      at: string;
      project_ref: string | null;
      document_ref: string | null;
      body: string;
      who: string | null;
      status: 'open' | 'answered' | 'closed';
    }
  | {
      kind: 'access';
      at: string;
      project_ref: string | null;
      who: string | null;
    };

export interface CabinetEvents {
  ok: true;
  result: { now: string; since: string; events: CabinetEvent[] };
}

/** Что сделали клиенты с момента `since`: согласования, вопросы, первый вход. */
export async function cabinetEvents(since?: string, limit = 200): Promise<CabinetEvents> {
  return request<CabinetEvents>('cabinet/events', { since, limit });
}

export type { CabinetClientRef, CabinetProjectRef, CabinetDocumentKind };
