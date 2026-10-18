/**
 * Типы кабинета — зеркало таблиц из supabase/migrations/0001_cabinet.sql.
 * Если меняете схему в базе, правьте и здесь: TypeScript тогда сам покажет
 * все места, которые перестали сходиться.
 */

export type UserRole = 'client' | 'staff' | 'admin';

export type ProjectStatus =
  | 'new'
  | 'design'
  | 'agreed'
  | 'production'
  | 'installation'
  | 'completed'
  | 'on_hold';

export type StageStatus =
  | 'not_started'
  | 'in_progress'
  | 'waiting_client'
  | 'waiting_supplier'
  | 'done'
  | 'paused';

export type DocCategory =
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

export type DocState = 'draft' | 'review' | 'approved' | 'archived';
export type Visibility = 'client' | 'internal';
export type ApprovalDecision = 'approved' | 'changes_requested';
export type PaymentStatus = 'planned' | 'partial' | 'paid';
export type MessageStatus = 'open' | 'answered' | 'closed';

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  is_blocked: boolean;
  created_at: string;
};

export type Client = {
  id: string;
  display_name: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  internal_note: string | null;
  is_archived: boolean;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  code: string | null;
  title: string;
  furniture_type: string;
  address: string | null;
  show_address: boolean;
  status: ProjectStatus;
  summary: string | null;
  internal_note: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectWithClient = Project & { clients?: Pick<Client, 'id' | 'display_name'> | null };

export type ProjectMember = {
  project_id: string;
  user_id: string;
  can_approve: boolean;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'email' | 'full_name' | 'role' | 'is_blocked'> | null;
};

export type ProjectInvite = {
  id: string;
  token: string;
  client_id: string;
  project_id: string | null;
  email: string | null;
  note: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type Stage = {
  id: string;
  project_id: string;
  position: number;
  name: string;
  status: StageStatus;
  started_on: string | null;
  planned_on: string | null;
  completed_on: string | null;
  client_comment: string | null;
  internal_comment: string | null;
};

export type DocumentVersion = {
  id: string;
  document_id: string;
  version: number;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  comment: string | null;
  is_current: boolean;
  created_at: string;
};

export type Doc = {
  id: string;
  project_id: string;
  category: DocCategory;
  title: string;
  description: string | null;
  state: DocState;
  is_published: boolean;
  needs_approval: boolean;
  created_at: string;
  updated_at: string;
  document_versions?: DocumentVersion[];
};

export type Approval = {
  id: string;
  project_id: string;
  document_id: string;
  version_id: string;
  user_id: string;
  decision: ApprovalDecision;
  comment: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'email'> | null;
};

export type Note = {
  id: string;
  project_id: string;
  title: string;
  body: string | null;
  category: string | null;
  visibility: Visibility;
  document_id: string | null;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'email' | 'role'> | null;
};

export type Message = {
  id: string;
  project_id: string;
  parent_id: string | null;
  author_id: string | null;
  from_staff: boolean;
  body: string;
  document_id: string | null;
  version_id: string | null;
  status: MessageStatus;
  created_at: string;
  profiles?: Pick<Profile, 'full_name' | 'email' | 'role'> | null;
};

export type Cost = {
  id: string;
  project_id: string;
  position: number;
  title: string;
  details: string | null;
  amount: number | null;
  is_published: boolean;
};

export type Payment = {
  id: string;
  project_id: string;
  position: number;
  title: string;
  amount: number | null;
  paid_amount: number;
  due_on: string | null;
  paid_on: string | null;
  status: PaymentStatus;
  document_id: string | null;
  note: string | null;
  is_published: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  project_id: string | null;
  kind: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export type AuditEntry = {
  id: number;
  actor_id: string | null;
  project_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
};
