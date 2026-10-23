-- ====================================================================
--  ЗАГЛУШКИ SUPABASE ДЛЯ ПРОВЕРКИ НА ОБЫЧНОМ POSTGRES
--  --------------------------------------------------------------
--  Этот файл НЕ нужен в настоящем проекте Supabase: там схемы auth и
--  storage, роли anon / authenticated / service_role и функция auth.uid()
--  уже есть. Он нужен, чтобы прогнать миграцию и тесты прав доступа
--  (supabase/tests/policies-test.sql) на пустом PostgreSQL 15+ —
--  локально или в CI, не трогая живую базу.
--
--  Порядок:
--    psql -f supabase/tests/local-shim.sql
--    psql -f supabase/migrations/0001_cabinet.sql
--    psql -f supabase/tests/policies-test.sql
-- ====================================================================



-- Роли, от имени которых ходит клиентская библиотека Supabase.
do $$ begin
  create role anon nologin noinherit;
exception when duplicate_object then null; end $$;

do $$ begin
  create role authenticated nologin noinherit;
exception when duplicate_object then null; end $$;

do $$ begin
  create role service_role nologin noinherit bypassrls;
exception when duplicate_object then null; end $$;

create schema if not exists auth;
create schema if not exists storage;

grant usage on schema public, auth, storage to anon, authenticated, service_role;

-- Таблица учётных записей. В Supabase ею владеет сервис авторизации;
-- здесь достаточно трёх полей, которые читает наш триггер.
create table if not exists auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at         timestamptz not null default now()
);

-- auth.uid() в Supabase достаёт идентификатор из разобранного JWT.
-- Здесь — из той же переменной сеанса, что использует PostgREST.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select nullif(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub', ''
  )::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', ''),
    current_user::text
  );
$$;

create or replace function auth.email() returns text
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '');
$$;

-- Минимальное хранилище: ровно те поля, к которым обращаются политики.
create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets (id),
  name       text,
  owner      uuid,
  metadata   jsonb,
  created_at timestamptz not null default now(),
  unique (bucket_id, name)
);

alter table storage.objects enable row level security;
alter table storage.objects force row level security;

grant select on storage.buckets to authenticated, anon;
grant select, insert, update, delete on storage.objects to authenticated;
revoke all on storage.objects from anon;
