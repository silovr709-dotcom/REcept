-- ====================================================================
--  ЛИЧНЫЕ КАБИНЕТЫ «РЕцепт» — схема, права доступа, хранилище файлов
--  --------------------------------------------------------------
--  Выполняется один раз в SQL Editor проекта Supabase.
--  Скрипт идемпотентный: повторный запуск ничего не ломает.
--
--  Главный принцип: сайт статический, он лежит на GitHub Pages и своего
--  сервера не имеет. Значит, браузеру доверять нельзя вообще ни в чём.
--  Вся проверка прав живёт ЗДЕСЬ, в Postgres: Row Level Security не даёт
--  прочитать чужую строку, даже если из браузера отправить запрос руками
--  с чужим идентификатором. Клиентский код может только попросить —
--  решает всегда база.
-- ====================================================================

-- Расширения не нужны: gen_random_uuid() есть в PostgreSQL 13 и новее,
-- а токен приглашения собирается из двух таких значений — это 256 бит
-- случайности от криптостойкого генератора самой базы.

-- ====================================================================
--  1. СПРАВОЧНИКИ СОСТОЯНИЙ
-- ====================================================================

do $$ begin
  create type public.user_role as enum ('client', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum (
    'new', 'design', 'agreed', 'production', 'installation', 'completed', 'on_hold'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.stage_status as enum (
    'not_started', 'in_progress', 'waiting_client', 'waiting_supplier', 'done', 'paused'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.doc_category as enum (
    'contract', 'specification', 'estimate', 'sketch', 'drawing', 'electrics',
    'plumbing', 'materials', 'payment', 'act', 'warranty', 'manual', 'photo', 'other'
  );
exception when duplicate_object then null; end $$;

-- Состояние карточки документа глазами клиента.
do $$ begin
  create type public.doc_state as enum ('draft', 'review', 'approved', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.visibility as enum ('client', 'internal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.approval_decision as enum ('approved', 'changes_requested');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('planned', 'partial', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_status as enum ('open', 'answered', 'closed');
exception when duplicate_object then null; end $$;

-- ====================================================================
--  2. ТАБЛИЦЫ
-- ====================================================================

-- 2.1 Учётные записи. auth.users принадлежит Supabase, трогать её нельзя,
--     поэтому прикладные поля живут в profiles с тем же id.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'client',
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.2 Карточка клиента. Это НЕ учётная запись: договор заключён с человеком,
--     а войти в кабинет могут, например, муж и жена с разных почт.
create table if not exists public.clients (
  id            uuid primary key default gen_random_uuid(),
  display_name  text not null,
  full_name     text,
  email         text,
  phone         text,
  city          text,
  internal_note text,
  is_archived   boolean not null default false,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2.3 Связь «учётная запись ↔ карточка клиента».
create table if not exists public.client_users (
  client_id  uuid not null references public.clients (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

-- 2.4 Проект. У одного клиента их может быть несколько: кухня, гардеробная,
--     мебель в ванную — архитектура заложена сразу.
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete restrict,
  code            text unique,
  title           text not null,
  furniture_type  text not null default 'Кухня',
  address         text,
  show_address    boolean not null default true,
  status          public.project_status not null default 'new',
  summary         text,            -- что видит клиент
  internal_note   text,            -- служебное, клиенту не отдаётся никогда
  is_archived     boolean not null default false,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2.5 Кто из пользователей допущен к проекту. Регистрация сама по себе
--     не даёт ничего: без строки здесь человек не видит проект.
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  can_approve boolean not null default true,
  added_by   uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- 2.6 Приглашения. Клиент, с которым договор уже подписан, получает ссылку
--     с одноразовым токеном либо просто регистрируется на ту же почту.
create table if not exists public.project_invites (
  id          uuid primary key default gen_random_uuid(),
  token       text unique not null
                default replace(gen_random_uuid()::text, '-', '')
                     || replace(gen_random_uuid()::text, '-', ''),
  client_id   uuid not null references public.clients (id) on delete cascade,
  project_id  uuid references public.projects (id) on delete cascade,
  email       text,
  note        text,
  expires_at  timestamptz not null default (now() + interval '30 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  revoked_at  timestamptz,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 2.7 Этапы проекта.
create table if not exists public.project_stages (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  position         integer not null default 0,
  name             text not null,
  status           public.stage_status not null default 'not_started',
  started_on       date,
  planned_on       date,
  completed_on     date,
  client_comment   text,
  internal_comment text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2.8 Карточка документа. Файлы живут в версиях, карточка — это «договор»,
--     «эскиз кухни», «схема розеток» как сущность.
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  category      public.doc_category not null default 'other',
  title         text not null,
  description   text,
  state         public.doc_state not null default 'draft',
  is_published  boolean not null default false,  -- видит ли клиент
  needs_approval boolean not null default false, -- ждём решения клиента
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2.9 Версии файлов. Заменить файл «молча» нельзя: это всегда новая версия.
create table if not exists public.document_versions (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents (id) on delete cascade,
  version      integer not null,
  storage_path text not null unique,
  file_name    text not null,
  mime_type    text,
  size_bytes   bigint,
  comment      text,
  is_current   boolean not null default true,
  uploaded_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (document_id, version)
);

-- 2.10 Согласования — юридически значимый след решения клиента.
create table if not exists public.approvals (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  version_id  uuid not null references public.document_versions (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete restrict,
  decision    public.approval_decision not null,
  comment     text,
  created_at  timestamptz not null default now()
);

-- 2.11 Журнал договорённостей.
create table if not exists public.project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null,
  body        text,
  category    text,
  visibility  public.visibility not null default 'client',
  document_id uuid references public.documents (id) on delete set null,
  author_id   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.12 Обращения и ответы (одна таблица, ответ ссылается на родителя).
create table if not exists public.project_messages (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  parent_id   uuid references public.project_messages (id) on delete cascade,
  author_id   uuid references public.profiles (id) on delete set null,
  from_staff  boolean not null default false,
  body        text not null,
  document_id uuid references public.documents (id) on delete set null,
  version_id  uuid references public.document_versions (id) on delete set null,
  status      public.message_status not null default 'open',
  created_at  timestamptz not null default now()
);

-- 2.13 Смета и оплаты.
create table if not exists public.project_costs (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  position     integer not null default 0,
  title        text not null,
  details      text,
  amount       numeric(12, 2),
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.project_payments (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  position     integer not null default 0,
  title        text not null,
  amount       numeric(12, 2),
  paid_amount  numeric(12, 2) not null default 0,
  due_on       date,
  paid_on      date,
  status       public.payment_status not null default 'planned',
  document_id  uuid references public.documents (id) on delete set null,
  note         text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2.14 Уведомления внутри кабинета.
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- 2.15 Журнал важных действий. Пишется триггерами, руками не правится.
create table if not exists public.audit_logs (
  id         bigserial primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  project_id uuid,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  meta       jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_client       on public.projects (client_id);
create index if not exists idx_members_user          on public.project_members (user_id);
create index if not exists idx_stages_project        on public.project_stages (project_id, position);
create index if not exists idx_documents_project     on public.documents (project_id, category);
create index if not exists idx_versions_document     on public.document_versions (document_id, version desc);
create index if not exists idx_notes_project         on public.project_notes (project_id, created_at desc);
create index if not exists idx_messages_project      on public.project_messages (project_id, created_at);
create index if not exists idx_approvals_version     on public.approvals (version_id);
create index if not exists idx_notifications_user    on public.notifications (user_id, read_at);
create index if not exists idx_audit_project         on public.audit_logs (project_id, created_at desc);
create index if not exists idx_invites_email         on public.project_invites (lower(email));

-- ====================================================================
--  3. ФУНКЦИИ-ПРОВЕРКИ
--  SECURITY DEFINER, чтобы политики не вызывали сами себя по кругу.
-- ====================================================================

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('staff', 'admin') and not p.is_blocked
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and not p.is_blocked
  );
$$;

-- Доступ к проекту: сотрудник — ко всем, клиент — только к своим.
create or replace function public.has_project_access(p_project uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select
    case
      when auth.uid() is null then false
      when exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_blocked) then false
      when public.is_staff() then true
      else exists (
        select 1 from public.project_members m
        where m.project_id = p_project and m.user_id = auth.uid()
      )
    end;
$$;

create or replace function public.can_approve(p_project uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.project_members m
    where m.project_id = p_project and m.user_id = auth.uid() and m.can_approve
  );
$$;

-- Виден ли документ клиенту. Используется и политиками таблиц, и хранилищем.
create or replace function public.document_is_visible(p_document uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.documents d
    where d.id = p_document
      and (public.is_staff() or (d.is_published and public.has_project_access(d.project_id)))
  );
$$;

-- Безопасное чтение project_id из пути файла: projects/<project>/<document>/<file>
create or replace function public.storage_project_id(p_name text)
returns uuid language plpgsql immutable set search_path = public, pg_temp as $$
begin
  return (string_to_array(p_name, '/'))[2]::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ====================================================================
--  4. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ И ПРИГЛАШЕНИЯ
-- ====================================================================

-- Профиль заводится автоматически. Роль всегда 'client': повысить себя
-- через регистрацию нельзя, роль меняет только администратор в базе.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do update set email = excluded.email;

  -- Если на эту почту заранее выписано приглашение — применяем его сразу.
  perform public.apply_invites_for_email(new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.apply_invites_for_email(p_user uuid, p_email text)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare
  rec record;
  applied integer := 0;
begin
  if p_email is null then return 0; end if;

  for rec in
    select * from public.project_invites
    where lower(email) = lower(p_email)
      and accepted_at is null and revoked_at is null and expires_at > now()
  loop
    insert into public.client_users (client_id, user_id)
    values (rec.client_id, p_user) on conflict do nothing;

    if rec.project_id is not null then
      insert into public.project_members (project_id, user_id, added_by)
      values (rec.project_id, p_user, rec.created_by) on conflict do nothing;
    else
      insert into public.project_members (project_id, user_id, added_by)
      select p.id, p_user, rec.created_by from public.projects p
      where p.client_id = rec.client_id and not p.is_archived
      on conflict do nothing;
    end if;

    update public.project_invites
      set accepted_at = now(), accepted_by = p_user
      where id = rec.id;

    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (p_user, rec.project_id, 'invite.accepted', 'project_invites', rec.id,
            jsonb_build_object('email', p_email, 'auto', true));

    applied := applied + 1;
  end loop;

  return applied;
end;
$$;

-- Приглашение по персональной ссылке. Вызывается из кабинета после входа.
create or replace function public.accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  rec record;
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Нужно войти в кабинет'; end if;

  select * into rec from public.project_invites
  where token = p_token and revoked_at is null;

  if rec.id is null then raise exception 'Приглашение не найдено'; end if;
  if rec.expires_at < now() then raise exception 'Срок приглашения истёк'; end if;
  if rec.accepted_at is not null and rec.accepted_by is distinct from uid then
    raise exception 'Приглашение уже использовано';
  end if;

  insert into public.client_users (client_id, user_id)
  values (rec.client_id, uid) on conflict do nothing;

  if rec.project_id is not null then
    insert into public.project_members (project_id, user_id, added_by)
    values (rec.project_id, uid, rec.created_by) on conflict do nothing;
  else
    insert into public.project_members (project_id, user_id, added_by)
    select p.id, uid, rec.created_by from public.projects p
    where p.client_id = rec.client_id and not p.is_archived
    on conflict do nothing;
  end if;

  update public.project_invites
    set accepted_at = coalesce(accepted_at, now()), accepted_by = uid
    where id = rec.id;

  insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
  values (uid, rec.project_id, 'invite.accepted', 'project_invites', rec.id,
          jsonb_build_object('token_tail', right(p_token, 6)));

  return coalesce(rec.project_id, (
    select p.id from public.projects p where p.client_id = rec.client_id
    order by p.created_at limit 1
  ));
end;
$$;

-- ====================================================================
--  5. ПРАВИЛА ВОКРУГ ВЕРСИЙ И СОГЛАСОВАНИЙ
-- ====================================================================

-- Новая версия автоматически становится текущей, номер считает база.
create or replace function public.before_version_insert()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if new.version is null or new.version = 0 then
    select coalesce(max(version), 0) + 1 into new.version
    from public.document_versions where document_id = new.document_id;
  end if;
  new.uploaded_by := coalesce(new.uploaded_by, auth.uid());
  return new;
end;
$$;

create or replace function public.after_version_insert()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  proj uuid;
begin
  update public.document_versions
    set is_current = false
    where document_id = new.document_id and id <> new.id and is_current;

  -- Пришла новая версия — прежнее согласование к ней не относится.
  update public.documents
    set state = case when state = 'approved' then 'review' else state end,
        updated_at = now()
    where id = new.document_id;

  select project_id into proj from public.documents where id = new.document_id;

  insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
  values (auth.uid(), proj, 'version.uploaded', 'document_versions', new.id,
          jsonb_build_object('document_id', new.document_id, 'version', new.version,
                             'file', new.file_name));
  return new;
end;
$$;

drop trigger if exists trg_version_before_insert on public.document_versions;
create trigger trg_version_before_insert
  before insert on public.document_versions
  for each row execute function public.before_version_insert();

drop trigger if exists trg_version_after_insert on public.document_versions;
create trigger trg_version_after_insert
  after insert on public.document_versions
  for each row execute function public.after_version_insert();

-- Согласованную версию нельзя подменить: только выпустить новую.
create or replace function public.protect_approved_version()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  if exists (select 1 from public.approvals a
             where a.version_id = old.id and a.decision = 'approved')
     and (new.storage_path is distinct from old.storage_path
          or new.file_name is distinct from old.file_name) then
    raise exception 'Версия уже согласована клиентом — загрузите новую версию';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_version_protect on public.document_versions;
create trigger trg_version_protect
  before update on public.document_versions
  for each row execute function public.protect_approved_version();

-- Решение клиента. Пишется только через эту функцию — так гарантированы
-- и проверка прав, и полный след в журнале.
create or replace function public.record_decision(
  p_version_id uuid,
  p_decision public.approval_decision,
  p_comment text default null
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare
  uid uuid := auth.uid();
  doc record;
  ver record;
  new_id uuid;
begin
  if uid is null then raise exception 'Нужно войти в кабинет'; end if;

  select v.*, d.project_id, d.is_published, d.title
    into ver
  from public.document_versions v
  join public.documents d on d.id = v.document_id
  where v.id = p_version_id;

  if ver.id is null then raise exception 'Версия не найдена'; end if;
  if not public.has_project_access(ver.project_id) then
    raise exception 'Нет доступа к этому проекту';
  end if;
  if not ver.is_published and not public.is_staff() then
    raise exception 'Документ ещё не опубликован';
  end if;
  if not ver.is_current then
    raise exception 'Можно согласовать только актуальную версию';
  end if;
  if not public.is_staff() and not public.can_approve(ver.project_id) then
    raise exception 'У вашей учётной записи нет права согласования';
  end if;

  insert into public.approvals (project_id, document_id, version_id, user_id, decision, comment)
  values (ver.project_id, ver.document_id, ver.id, uid, p_decision, nullif(trim(coalesce(p_comment,'')), ''))
  returning id into new_id;

  update public.documents
    set state = case when p_decision = 'approved' then 'approved'::public.doc_state
                     else 'review'::public.doc_state end,
        needs_approval = (p_decision <> 'approved'),
        updated_at = now()
    where id = ver.document_id;

  insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
  values (uid, ver.project_id,
          case when p_decision = 'approved' then 'document.approved' else 'document.changes_requested' end,
          'approvals', new_id,
          jsonb_build_object('document_id', ver.document_id, 'version', ver.version, 'title', ver.title));

  -- Сотрудникам — уведомление в кабинет.
  insert into public.notifications (user_id, project_id, kind, title, body)
  select p.id, ver.project_id,
         case when p_decision = 'approved' then 'approval' else 'changes' end,
         case when p_decision = 'approved' then 'Клиент согласовал: ' || ver.title
              else 'Клиент просит изменения: ' || ver.title end,
         nullif(trim(coalesce(p_comment, '')), '')
  from public.profiles p where p.role in ('staff', 'admin') and not p.is_blocked;

  return new_id;
end;
$$;

-- ====================================================================
--  6. УВЕДОМЛЕНИЯ И ЖУРНАЛ
-- ====================================================================

create or replace function public.notify_members(
  p_project uuid, p_kind text, p_title text, p_body text
) returns void language sql security definer set search_path = public, pg_temp as $$
  insert into public.notifications (user_id, project_id, kind, title, body)
  select m.user_id, p_project, p_kind, p_title, p_body
  from public.project_members m
  join public.profiles pr on pr.id = m.user_id
  where m.project_id = p_project and not pr.is_blocked and pr.role = 'client';
$$;

create or replace function public.on_document_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' and new.is_published and not old.is_published then
    perform public.notify_members(new.project_id, 'document',
      'Опубликован документ: ' || new.title,
      case when new.needs_approval then 'Нужно ваше согласование' else null end);
    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (auth.uid(), new.project_id, 'document.published', 'documents', new.id,
            jsonb_build_object('title', new.title));
  elsif tg_op = 'UPDATE' and old.is_published and not new.is_published then
    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (auth.uid(), new.project_id, 'document.unpublished', 'documents', new.id,
            jsonb_build_object('title', new.title));
  elsif tg_op = 'INSERT' then
    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (auth.uid(), new.project_id, 'document.created', 'documents', new.id,
            jsonb_build_object('title', new.title));
  elsif tg_op = 'DELETE' then
    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (auth.uid(), old.project_id, 'document.deleted', 'documents', old.id,
            jsonb_build_object('title', old.title));
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_document_change on public.documents;
create trigger trg_document_change
  after insert or update or delete on public.documents
  for each row execute function public.on_document_change();

create or replace function public.on_stage_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform public.notify_members(new.project_id, 'stage',
      'Этап «' || new.name || '» — новое состояние', new.client_comment);
    insert into public.audit_logs (actor_id, project_id, action, entity, entity_id, meta)
    values (auth.uid(), new.project_id, 'stage.status', 'project_stages', new.id,
            jsonb_build_object('name', new.name, 'from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_stage_change on public.project_stages;
create trigger trg_stage_change
  after update on public.project_stages
  for each row execute function public.on_stage_change();

create or replace function public.on_message_insert()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.from_staff then
    perform public.notify_members(new.project_id, 'message', 'Ответ по проекту', left(new.body, 160));
  else
    insert into public.notifications (user_id, project_id, kind, title, body)
    select p.id, new.project_id, 'message', 'Вопрос от клиента', left(new.body, 160)
    from public.profiles p where p.role in ('staff', 'admin') and not p.is_blocked;
    -- ответ сотрудника закрывает исходное обращение только вручную
  end if;

  if new.parent_id is not null and new.from_staff then
    update public.project_messages set status = 'answered'
    where id = new.parent_id and status = 'open';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_message_insert on public.project_messages;
create trigger trg_message_insert
  after insert on public.project_messages
  for each row execute function public.on_message_insert();

do $$
declare t text;
begin
  foreach t in array array['profiles','clients','projects','project_stages','documents',
                           'project_notes','project_costs','project_payments']
  loop
    execute format('drop trigger if exists trg_touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger trg_touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ====================================================================
--  7. ROW LEVEL SECURITY
--  Включаем везде. Политик «для всех» нет ни одной.
-- ====================================================================

do $$
declare t text;
begin
  foreach t in array array['profiles','clients','client_users','projects','project_members',
                           'project_invites','project_stages','documents','document_versions',
                           'approvals','project_notes','project_messages','project_costs',
                           'project_payments','notifications','audit_logs']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
  end loop;
end $$;

-- профили: свой — читать и править (кроме роли), сотрудникам — все
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and is_blocked = (select p.is_blocked from public.profiles p where p.id = auth.uid())
  );

drop policy if exists profiles_staff_write on public.profiles;
create policy profiles_staff_write on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- клиенты: свою карточку видит сам клиент, всё остальное — сотрудники
drop policy if exists clients_read on public.clients;
create policy clients_read on public.clients for select
  using (
    public.is_staff()
    or exists (select 1 from public.client_users cu
               where cu.client_id = id and cu.user_id = auth.uid())
  );

drop policy if exists clients_staff_write on public.clients;
create policy clients_staff_write on public.clients for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists client_users_read on public.client_users;
create policy client_users_read on public.client_users for select
  using (public.is_staff() or user_id = auth.uid());

drop policy if exists client_users_staff_write on public.client_users;
create policy client_users_staff_write on public.client_users for all
  using (public.is_staff()) with check (public.is_staff());

-- проекты
drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select
  using (public.has_project_access(id));

drop policy if exists projects_staff_write on public.projects;
create policy projects_staff_write on public.projects for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists members_read on public.project_members;
create policy members_read on public.project_members for select
  using (public.is_staff() or user_id = auth.uid());

drop policy if exists members_staff_write on public.project_members;
create policy members_staff_write on public.project_members for all
  using (public.is_staff()) with check (public.is_staff());

-- приглашения видит только сотрудник; клиент применяет токен через RPC
drop policy if exists invites_staff on public.project_invites;
create policy invites_staff on public.project_invites for all
  using (public.is_staff()) with check (public.is_staff());

-- этапы: клиенту — без внутренних комментариев (отдаём через представление)
drop policy if exists stages_read on public.project_stages;
create policy stages_read on public.project_stages for select
  using (public.has_project_access(project_id));

drop policy if exists stages_staff_write on public.project_stages;
create policy stages_staff_write on public.project_stages for all
  using (public.is_staff()) with check (public.is_staff());

-- документы: клиент видит только опубликованные
drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents for select
  using (public.is_staff() or (is_published and public.has_project_access(project_id)));

drop policy if exists documents_staff_write on public.documents;
create policy documents_staff_write on public.documents for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists versions_read on public.document_versions;
create policy versions_read on public.document_versions for select
  using (public.document_is_visible(document_id));

drop policy if exists versions_staff_write on public.document_versions;
create policy versions_staff_write on public.document_versions for all
  using (public.is_staff()) with check (public.is_staff());

-- согласования: читают обе стороны, пишет только функция record_decision
drop policy if exists approvals_read on public.approvals;
create policy approvals_read on public.approvals for select
  using (public.has_project_access(project_id));

drop policy if exists approvals_staff_write on public.approvals;
create policy approvals_staff_write on public.approvals for all
  using (public.is_staff()) with check (public.is_staff());

-- заметки: внутренние клиенту не видны
drop policy if exists notes_read on public.project_notes;
create policy notes_read on public.project_notes for select
  using (public.is_staff() or (visibility = 'client' and public.has_project_access(project_id)));

drop policy if exists notes_staff_write on public.project_notes;
create policy notes_staff_write on public.project_notes for all
  using (public.is_staff()) with check (public.is_staff());

-- обращения: клиент читает свой проект и может писать от своего имени
drop policy if exists messages_read on public.project_messages;
create policy messages_read on public.project_messages for select
  using (public.has_project_access(project_id));

drop policy if exists messages_client_insert on public.project_messages;
create policy messages_client_insert on public.project_messages for insert
  with check (
    public.has_project_access(project_id)
    and author_id = auth.uid()
    and (from_staff = false or public.is_staff())
  );

drop policy if exists messages_staff_write on public.project_messages;
create policy messages_staff_write on public.project_messages for all
  using (public.is_staff()) with check (public.is_staff());

-- деньги: клиент видит только опубликованные строки
drop policy if exists costs_read on public.project_costs;
create policy costs_read on public.project_costs for select
  using (public.is_staff() or (is_published and public.has_project_access(project_id)));

drop policy if exists costs_staff_write on public.project_costs;
create policy costs_staff_write on public.project_costs for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists payments_read on public.project_payments;
create policy payments_read on public.project_payments for select
  using (public.is_staff() or (is_published and public.has_project_access(project_id)));

drop policy if exists payments_staff_write on public.project_payments;
create policy payments_staff_write on public.project_payments for all
  using (public.is_staff()) with check (public.is_staff());

-- уведомления: только свои, править можно лишь отметку о прочтении
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select
  using (user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- журнал: читают сотрудники, пишут только триггеры (SECURITY DEFINER)
drop policy if exists audit_staff_read on public.audit_logs;
create policy audit_staff_read on public.audit_logs for select
  using (public.is_staff());

-- ====================================================================
--  8. ХРАНИЛИЩЕ ФАЙЛОВ
--  Приватный бакет. Публичных ссылок не существует в принципе:
--  файл отдаётся только по подписанной ссылке на несколько минут.
-- ====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files', 'project-files', false, 26214400,
  array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/gif',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword','application/vnd.ms-excel','text/plain','application/zip']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_files_read on storage.objects;
create policy project_files_read on storage.objects for select
  using (
    bucket_id = 'project-files'
    and (
      public.is_staff()
      or (
        public.has_project_access(public.storage_project_id(name))
        and exists (
          select 1
          from public.document_versions v
          join public.documents d on d.id = v.document_id
          where v.storage_path = storage.objects.name and d.is_published
        )
      )
    )
  );

drop policy if exists project_files_write on storage.objects;
create policy project_files_write on storage.objects for insert
  with check (bucket_id = 'project-files' and public.is_staff());

drop policy if exists project_files_update on storage.objects;
create policy project_files_update on storage.objects for update
  using (bucket_id = 'project-files' and public.is_staff())
  with check (bucket_id = 'project-files' and public.is_staff());

drop policy if exists project_files_delete on storage.objects;
create policy project_files_delete on storage.objects for delete
  using (bucket_id = 'project-files' and public.is_staff());

-- ====================================================================
--  9. ТИПОВЫЕ ЭТАПЫ ПРОЕКТА
-- ====================================================================

create or replace function public.seed_stages(p_project uuid)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare
  names text[] := array[
    'Первичное обращение', 'Замер помещения', 'Подготовка дизайн-проекта',
    'Согласование планировки и внешнего вида', 'Согласование материалов и комплектации',
    'Согласование стоимости и документов', 'Подготовка заказа на производство',
    'Производство', 'Проверка готовности', 'Доставка', 'Монтаж', 'Приёмка',
    'Гарантийное обслуживание'];
  i integer;
begin
  if not public.is_staff() then raise exception 'Только для сотрудников'; end if;
  if exists (select 1 from public.project_stages where project_id = p_project) then
    return 0;
  end if;
  for i in 1 .. array_length(names, 1) loop
    insert into public.project_stages (project_id, position, name)
    values (p_project, i, names[i]);
  end loop;
  return array_length(names, 1);
end;
$$;

-- ====================================================================
--  10. ДОСТУП К ФУНКЦИЯМ
-- ====================================================================

revoke all on function public.apply_invites_for_email(uuid, text) from public, anon, authenticated;
grant execute on function public.accept_invite(text) to authenticated;
grant execute on function public.record_decision(uuid, public.approval_decision, text) to authenticated;
grant execute on function public.seed_stages(uuid) to authenticated;
grant execute on function public.has_project_access(uuid) to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.can_approve(uuid) to authenticated;
grant execute on function public.document_is_visible(uuid) to authenticated;

-- Supabase выдаёт права на новые таблицы сама, но полагаться на это не
-- будем: пусть скрипт одинаково работает и на чистом PostgreSQL. Права
-- здесь — это лишь «можно постучаться»; какие строки вернутся, решают
-- политики RLS выше.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Анонимному ключу не нужно ничего: кабинет работает только после входа.
revoke all on all tables in schema public from anon;
