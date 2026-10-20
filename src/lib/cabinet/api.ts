'use client';

import { getSupabase } from './supabase';
import type {
  Approval,
  AuditEntry,
  Client,
  Cost,
  Doc,
  DocCategory,
  DocState,
  Message,
  Note,
  Notification,
  Payment,
  Profile,
  Project,
  ProjectInvite,
  ProjectMember,
  ProjectStatus,
  ProjectWithClient,
  Stage,
  StageStatus,
  UserRole,
  Visibility,
} from './types';

/**
 * ДОСТУП К ДАННЫМ КАБИНЕТА
 * ========================
 * Каждая функция — это запрос к Supabase от имени вошедшего пользователя.
 * Никаких проверок «а можно ли» здесь нет и быть не может: браузер врёт.
 * Разрешение выдаёт Postgres политиками RLS, а эти функции только
 * формулируют запрос и приводят ответ к типам.
 *
 * Поэтому, например, запрос списка проектов без фильтра по пользователю —
 * это не дыра: база сама вернёт только те строки, к которым есть доступ.
 */

const BUCKET = 'project-files';
export const MAX_FILE_MB = 25;

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp|heic|gif|docx?|xlsx?|txt|zip)$/i;

function db() {
  const client = getSupabase();
  if (!client) throw new Error('Кабинет пока не подключён');
  return client;
}

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return (data ?? []) as T;
}

/* ------------------------------------------------------------------ *
 * Профиль и сессия
 * ------------------------------------------------------------------ */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await db()
    .from('profiles')
    .select('id, email, full_name, phone, role, is_blocked, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateOwnProfile(userId: string, patch: { full_name?: string; phone?: string }) {
  const { error } = await db().from('profiles').update(patch).eq('id', userId);
  if (error) throw error;
}

/**
 * Смена собственного пароля. Меняет его сам Supabase у вошедшего
 * пользователя: ни сайт, ни база паролей не видят и не хранят.
 */
export async function changeOwnPassword(password: string) {
  const { error } = await db().auth.updateUser({ password });
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Сотрудники (только администратор)
 * ------------------------------------------------------------------ */

const PROFILE_FIELDS = 'id, email, full_name, phone, role, is_blocked, created_at';

export async function fetchStaffProfiles(): Promise<Profile[]> {
  return unwrap<Profile[]>(
    await db()
      .from('profiles')
      .select(PROFILE_FIELDS)
      .in('role', ['staff', 'admin'])
      .order('created_at', { ascending: true }),
  );
}

/** Поиск уже зарегистрированного человека по почте — чтобы выдать ему права. */
export async function findProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await db()
    .from('profiles')
    .select(PROFILE_FIELDS)
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/**
 * Назначение роли. Разрешено только администратору — это проверяет
 * политика profiles_staff_write в базе, а не эта строчка кода.
 */
export async function setProfileRole(userId: string, role: UserRole) {
  const { error } = await db().from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Проекты
 * ------------------------------------------------------------------ */

const PROJECT_FIELDS =
  'id, client_id, code, title, furniture_type, address, show_address, status, summary, internal_note, is_archived, created_at, updated_at';

export async function fetchMyProjects(): Promise<ProjectWithClient[]> {
  const { data, error } = await db()
    .from('projects')
    .select(`${PROJECT_FIELDS}, clients ( id, display_name )`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ProjectWithClient[];
}

export async function fetchProject(id: string): Promise<ProjectWithClient | null> {
  const { data, error } = await db()
    .from('projects')
    .select(`${PROJECT_FIELDS}, clients ( id, display_name )`)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ProjectWithClient | null;
}

export async function createProject(input: {
  client_id: string;
  title: string;
  furniture_type: string;
  code?: string | null;
  address?: string | null;
  summary?: string | null;
}) {
  const { data, error } = await db().from('projects').insert(input).select('id').single();
  if (error) throw error;
  // Сразу раскладываем типовые этапы — их потом можно править и удалять.
  await db().rpc('seed_stages', { p_project: data.id });
  return data.id as string;
}

export async function updateProject(id: string, patch: Partial<Project>) {
  const { error } = await db().from('projects').update(patch).eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Этапы
 * ------------------------------------------------------------------ */

export async function fetchStages(projectId: string): Promise<Stage[]> {
  return unwrap(
    await db()
      .from('project_stages')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true }),
  );
}

export async function updateStage(id: string, patch: Partial<Stage>) {
  const { error } = await db().from('project_stages').update(patch).eq('id', id);
  if (error) throw error;
}

export async function addStage(projectId: string, name: string, position: number) {
  const { error } = await db()
    .from('project_stages')
    .insert({ project_id: projectId, name, position });
  if (error) throw error;
}

export async function removeStage(id: string) {
  const { error } = await db().from('project_stages').delete().eq('id', id);
  if (error) throw error;
}

export async function setStageStatus(id: string, status: StageStatus) {
  await updateStage(id, { status });
}

/* ------------------------------------------------------------------ *
 * Документы и версии
 * ------------------------------------------------------------------ */

const DOC_FIELDS =
  'id, project_id, category, title, description, state, is_published, needs_approval, created_at, updated_at';

export async function fetchDocuments(projectId: string): Promise<Doc[]> {
  const { data, error } = await db()
    .from('documents')
    .select(
      `${DOC_FIELDS}, document_versions ( id, document_id, version, storage_path, file_name, mime_type, size_bytes, comment, is_current, created_at )`,
    )
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  const docs = (data ?? []) as unknown as Doc[];
  for (const doc of docs) {
    doc.document_versions = (doc.document_versions ?? []).sort((a, b) => b.version - a.version);
  }
  return docs;
}

export function currentVersion(doc: Doc) {
  const versions = doc.document_versions ?? [];
  return versions.find((v) => v.is_current) ?? versions[0] ?? null;
}

export async function createDocument(input: {
  project_id: string;
  title: string;
  category: DocCategory;
  description?: string | null;
  needs_approval?: boolean;
}) {
  const { data, error } = await db().from('documents').insert(input).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function updateDocument(
  id: string,
  patch: Partial<Pick<Doc, 'title' | 'description' | 'category' | 'state' | 'is_published' | 'needs_approval'>>,
) {
  const { error } = await db().from('documents').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteDocument(doc: Doc) {
  const paths = (doc.document_versions ?? []).map((v) => v.storage_path);
  if (paths.length) await db().storage.from(BUCKET).remove(paths);
  const { error } = await db().from('documents').delete().eq('id', doc.id);
  if (error) throw error;
}

/** Проверка файла до отправки: быстрее и понятнее, чем ответ сервера. */
export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `Файл больше ${MAX_FILE_MB} МБ — сожмите или разделите`;
  }
  if (!ALLOWED_EXT.test(file.name)) {
    return 'Допустимые форматы: PDF, JPG, PNG, WEBP, DOC, XLS, TXT, ZIP';
  }
  return null;
}

/** Загрузка новой версии. Файл всегда ложится внутрь папки проекта. */
export async function uploadVersion(input: {
  projectId: string;
  documentId: string;
  file: File;
  comment?: string | null;
}) {
  const problem = validateFile(input.file);
  if (problem) throw new Error(problem);

  const ext = input.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const path = `projects/${input.projectId}/${input.documentId}/${unique}.${ext}`;

  const { error: upErr } = await db()
    .storage.from(BUCKET)
    .upload(path, input.file, { cacheControl: '3600', upsert: false, contentType: input.file.type || undefined });
  if (upErr) throw upErr;

  const { error } = await db().from('document_versions').insert({
    document_id: input.documentId,
    version: 0, // номер проставит база
    storage_path: path,
    file_name: input.file.name,
    mime_type: input.file.type || null,
    size_bytes: input.file.size,
    comment: input.comment ?? null,
  });
  if (error) {
    // Строка не создалась — не оставляем «осиротевший» файл в хранилище.
    await db().storage.from(BUCKET).remove([path]);
    throw error;
  }
}

/**
 * Ссылка на файл живёт 5 минут и выдаётся лично этому пользователю.
 * Постоянных публичных адресов у документов нет вообще.
 */
export async function signedUrl(path: string, seconds = 300, download?: string) {
  const { data, error } = await db()
    .storage.from(BUCKET)
    .createSignedUrl(path, seconds, download ? { download } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

/* ------------------------------------------------------------------ *
 * Согласования
 * ------------------------------------------------------------------ */

export async function fetchApprovals(projectId: string): Promise<Approval[]> {
  return unwrap(
    await db()
      .from('approvals')
      .select('*, profiles ( full_name, email )')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
  );
}

export async function recordDecision(
  versionId: string,
  decision: 'approved' | 'changes_requested',
  comment?: string,
) {
  const { error } = await db().rpc('record_decision', {
    p_version_id: versionId,
    p_decision: decision,
    p_comment: comment ?? null,
  });
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Заметки
 * ------------------------------------------------------------------ */

export async function fetchNotes(projectId: string): Promise<Note[]> {
  return unwrap(
    await db()
      .from('project_notes')
      .select('*, profiles ( full_name, email, role )')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
  );
}

export async function createNote(input: {
  project_id: string;
  title: string;
  body?: string | null;
  category?: string | null;
  visibility: Visibility;
  author_id: string;
}) {
  const { error } = await db().from('project_notes').insert(input);
  if (error) throw error;
}

export async function updateNote(id: string, patch: Partial<Note>) {
  const { error } = await db().from('project_notes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id: string) {
  const { error } = await db().from('project_notes').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Обращения
 * ------------------------------------------------------------------ */

export async function fetchMessages(projectId: string): Promise<Message[]> {
  return unwrap(
    await db()
      .from('project_messages')
      .select('*, profiles ( full_name, email, role )')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
  );
}

export async function sendMessage(input: {
  project_id: string;
  body: string;
  author_id: string;
  from_staff: boolean;
  parent_id?: string | null;
  document_id?: string | null;
  version_id?: string | null;
}) {
  const { error } = await db().from('project_messages').insert(input);
  if (error) throw error;
}

export async function setMessageStatus(id: string, status: 'open' | 'answered' | 'closed') {
  const { error } = await db().from('project_messages').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Все открытые обращения по всем проектам — для панели сотрудника. */
export async function fetchOpenMessages(): Promise<Array<Message & { projects?: { title: string } | null }>> {
  return unwrap(
    await db()
      .from('project_messages')
      .select('*, profiles ( full_name, email, role ), projects ( title )')
      .eq('from_staff', false)
      .in('status', ['open'])
      .order('created_at', { ascending: false })
      .limit(50),
  );
}

/* ------------------------------------------------------------------ *
 * Деньги
 * ------------------------------------------------------------------ */

export async function fetchCosts(projectId: string): Promise<Cost[]> {
  return unwrap(
    await db().from('project_costs').select('*').eq('project_id', projectId).order('position'),
  );
}

export async function fetchPayments(projectId: string): Promise<Payment[]> {
  return unwrap(
    await db().from('project_payments').select('*').eq('project_id', projectId).order('position'),
  );
}

export async function saveCost(input: Partial<Cost> & { project_id: string; title: string }) {
  const { id, ...rest } = input;
  const query = id
    ? db().from('project_costs').update(rest).eq('id', id)
    : db().from('project_costs').insert(rest);
  const { error } = await query;
  if (error) throw error;
}

export async function savePayment(input: Partial<Payment> & { project_id: string; title: string }) {
  const { id, ...rest } = input;
  const query = id
    ? db().from('project_payments').update(rest).eq('id', id)
    : db().from('project_payments').insert(rest);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteCost(id: string) {
  const { error } = await db().from('project_costs').delete().eq('id', id);
  if (error) throw error;
}

export async function deletePayment(id: string) {
  const { error } = await db().from('project_payments').delete().eq('id', id);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Уведомления
 * ------------------------------------------------------------------ */

export async function fetchNotifications(limit = 30): Promise<Notification[]> {
  return unwrap(
    await db().from('notifications').select('*').order('created_at', { ascending: false }).limit(limit),
  );
}

export async function markNotificationsRead(ids: string[]) {
  if (!ids.length) return;
  const { error } = await db()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids);
  if (error) throw error;
}

/* ------------------------------------------------------------------ *
 * Клиенты, доступы, приглашения — только для сотрудников
 * ------------------------------------------------------------------ */

export async function fetchClients(search = ''): Promise<Client[]> {
  let query = db().from('clients').select('*').order('created_at', { ascending: false });
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `display_name.ilike.${term},full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
    );
  }
  return unwrap(await query);
}

export async function fetchClient(id: string): Promise<Client | null> {
  const { data, error } = await db().from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export async function createClient(input: {
  display_name: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  internal_note?: string | null;
}) {
  const { data, error } = await db().from('clients').insert(input).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function updateClient(id: string, patch: Partial<Client>) {
  const { error } = await db().from('clients').update(patch).eq('id', id);
  if (error) throw error;
}

export async function fetchClientProjects(clientId: string): Promise<Project[]> {
  return unwrap(
    await db()
      .from('projects')
      .select(PROJECT_FIELDS)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  );
}

export async function fetchMembers(projectId: string): Promise<ProjectMember[]> {
  return unwrap(
    await db()
      .from('project_members')
      .select('*, profiles ( id, email, full_name, role, is_blocked )')
      .eq('project_id', projectId),
  );
}

export async function removeMember(projectId: string, userId: string) {
  const { error } = await db()
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setMemberApproval(projectId: string, userId: string, canApprove: boolean) {
  const { error } = await db()
    .from('project_members')
    .update({ can_approve: canApprove })
    .eq('project_id', projectId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setUserBlocked(userId: string, blocked: boolean) {
  const { error } = await db().from('profiles').update({ is_blocked: blocked }).eq('id', userId);
  if (error) throw error;
}

export async function fetchInvites(clientId: string): Promise<ProjectInvite[]> {
  return unwrap(
    await db()
      .from('project_invites')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
  );
}

export async function createInvite(input: {
  client_id: string;
  project_id?: string | null;
  email?: string | null;
  note?: string | null;
}): Promise<ProjectInvite> {
  const { data, error } = await db().from('project_invites').insert(input).select('*').single();
  if (error) throw error;
  return data as ProjectInvite;
}

export async function revokeInvite(id: string) {
  const { error } = await db()
    .from('project_invites')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function acceptInvite(token: string): Promise<string | null> {
  const { data, error } = await db().rpc('accept_invite', { p_token: token });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/* ------------------------------------------------------------------ *
 * Журнал действий
 * ------------------------------------------------------------------ */

export async function fetchAudit(projectId?: string, limit = 40): Promise<AuditEntry[]> {
  let query = db().from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (projectId) query = query.eq('project_id', projectId);
  return unwrap(await query);
}

/* ------------------------------------------------------------------ *
 * Сводка для панели сотрудника
 * ------------------------------------------------------------------ */

export async function fetchAdminOverview() {
  const [projects, clients, messages] = await Promise.all([
    db()
      .from('projects')
      .select(`${PROJECT_FIELDS}, clients ( id, display_name )`)
      .order('updated_at', { ascending: false })
      .limit(100),
    db().from('clients').select('id, display_name, phone, email, created_at, is_archived').limit(200),
    fetchOpenMessages(),
  ]);
  if (projects.error) throw projects.error;
  if (clients.error) throw clients.error;
  return {
    projects: (projects.data ?? []) as unknown as ProjectWithClient[],
    clients: (clients.data ?? []) as unknown as Client[],
    messages,
  };
}

export const projectStatuses: ProjectStatus[] = [
  'new',
  'design',
  'agreed',
  'production',
  'installation',
  'completed',
  'on_hold',
];

export const docStates: DocState[] = ['draft', 'review', 'approved', 'archived'];
