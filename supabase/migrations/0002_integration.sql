-- ====================================================================
--  МОСТ «КАЛЬКУЛЯТОР → ЛИЧНЫЙ КАБИНЕТ»
--  --------------------------------------------------------------
--  Калькулятор (рецепт-про.рф) — рабочая система и хозяин данных.
--  Кабинет (рецепт-тверь.рф) — витрина для клиента.
--
--  Публикацией занимается СЕРВЕР калькулятора: у него в config.php
--  лежит служебный ключ, в браузер этот ключ не попадает никогда.
--  Все функции ниже доступны только по служебному ключу: обычный
--  вход клиента или сотрудника их вызвать не может.
--
--  Скрипт идемпотентный: повторный запуск ничего не ломает.
-- ====================================================================

-- ====================================================================
--  1. ВНЕШНИЕ КЛЮЧИ: чем строка кабинета связана со строкой калькулятора
-- ====================================================================

alter table public.clients          add column if not exists external_ref text;
alter table public.projects         add column if not exists external_ref text;
alter table public.documents        add column if not exists external_ref text;
alter table public.project_costs    add column if not exists source text not null default 'manual';
alter table public.project_payments add column if not exists source text not null default 'manual';

create unique index if not exists clients_external_ref_uq
  on public.clients (external_ref) where external_ref is not null;
create unique index if not exists projects_external_ref_uq
  on public.projects (external_ref) where external_ref is not null;
create unique index if not exists documents_external_ref_uq
  on public.documents (external_ref) where external_ref is not null;

comment on column public.clients.external_ref is
  'Ключ карточки клиента в калькуляторе, вида calc:<id>. Пусто — карточка заведена прямо в кабинете.';
comment on column public.project_costs.source is
  'manual — строку ввёл сотрудник в кабинете; calculator — пришла из расчёта и перезаписывается при следующей публикации.';

-- ====================================================================
--  2. ДОПУСК: только служебный ключ
-- ====================================================================

create or replace function public.integration_guard()
returns void language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  claims  jsonb;
  claimed text := '';
begin
  begin
    claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
    claimed := coalesce(claims ->> 'role', '');
  exception when others then
    claimed := '';
  end;

  if claimed = 'service_role' then
    return;
  end if;
  -- Прямое подключение обслуживающей роли (миграции, тесты).
  if current_user in ('postgres', 'service_role', 'supabase_admin') and claimed = '' then
    return;
  end if;

  raise exception 'Мост доступен только по служебному ключу сервера';
end;
$fn$;

-- Телефон как ключ поиска: только цифры, последние 10 (без 7/8 впереди).
create or replace function public.integration_phone_key(p_phone text)
returns text language sql immutable as $fn$
  select case
    when p_phone is null then null
    when length(regexp_replace(p_phone, '\D', '', 'g')) < 10 then null
    else right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  end;
$fn$;

-- ====================================================================
--  3. КЛИЕНТ И ПРОЕКТ
-- ====================================================================

-- Карточка клиента. Ищем по внешнему ключу, затем по телефону, затем по почте:
-- это защищает от дублей, когда проект завели в кабинете раньше калькулятора.
create or replace function public.integration_upsert_client(p jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_ref   text := nullif(trim(coalesce(p ->> 'ref', '')), '');
  v_name  text := nullif(trim(coalesce(p ->> 'display_name', '')), '');
  v_phone text := nullif(trim(coalesce(p ->> 'phone', '')), '');
  v_email text := lower(nullif(trim(coalesce(p ->> 'email', '')), ''));
  v_key   text := public.integration_phone_key(v_phone);
  v_id    uuid;
begin
  if v_name is null then
    raise exception 'Не передано имя клиента';
  end if;

  if v_ref is not null then
    select id into v_id from public.clients where external_ref = v_ref;
  end if;

  if v_id is null and v_key is not null then
    select id into v_id from public.clients
     where public.integration_phone_key(phone) = v_key
     order by created_at limit 1;
  end if;

  if v_id is null and v_email is not null then
    select id into v_id from public.clients
     where lower(email) = v_email order by created_at limit 1;
  end if;

  if v_id is null then
    insert into public.clients (display_name, full_name, email, phone, city, external_ref)
    values (v_name, nullif(trim(coalesce(p ->> 'full_name', '')), ''), v_email, v_phone,
            nullif(trim(coalesce(p ->> 'city', '')), ''), v_ref)
    returning id into v_id;
  else
    -- Существующую карточку не затираем пустыми значениями.
    update public.clients set
      display_name = v_name,
      full_name    = coalesce(nullif(trim(coalesce(p ->> 'full_name', '')), ''), full_name),
      email        = coalesce(v_email, email),
      phone        = coalesce(v_phone, phone),
      city         = coalesce(nullif(trim(coalesce(p ->> 'city', '')), ''), city),
      external_ref = coalesce(external_ref, v_ref),
      updated_at   = now()
    where id = v_id;
  end if;

  return v_id;
end;
$fn$;

-- Типовые этапы для нового проекта (внутренняя версия seed_stages без проверки роли).
create or replace function public.integration_seed_stages(p_project uuid)
returns integer language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  names text[] := array[
    'Первичное обращение', 'Замер помещения', 'Подготовка дизайн-проекта',
    'Согласование планировки и внешнего вида', 'Согласование материалов и комплектации',
    'Согласование стоимости и документов', 'Подготовка заказа на производство',
    'Производство', 'Проверка готовности', 'Доставка', 'Монтаж', 'Приёмка',
    'Гарантийное обслуживание'];
  i integer;
begin
  if exists (select 1 from public.project_stages where project_id = p_project) then
    return 0;
  end if;
  for i in 1 .. array_length(names, 1) loop
    insert into public.project_stages (project_id, position, name)
    values (p_project, i, names[i]);
  end loop;
  return array_length(names, 1);
end;
$fn$;

create or replace function public.integration_upsert_project(p_client uuid, p jsonb)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_ref   text := nullif(trim(coalesce(p ->> 'ref', '')), '');
  v_title text := nullif(trim(coalesce(p ->> 'title', '')), '');
  v_id    uuid;
begin
  if v_ref is null then raise exception 'Не передан ключ проекта'; end if;
  if v_title is null then raise exception 'Не передано название проекта'; end if;

  select id into v_id from public.projects where external_ref = v_ref;

  if v_id is null then
    insert into public.projects (client_id, external_ref, code, title, furniture_type,
                                 address, show_address, summary)
    values (p_client, v_ref,
            nullif(trim(coalesce(p ->> 'code', '')), ''),
            v_title,
            coalesce(nullif(trim(coalesce(p ->> 'furniture_type', '')), ''), 'Кухня'),
            nullif(trim(coalesce(p ->> 'address', '')), ''),
            coalesce((p ->> 'show_address')::boolean, true),
            nullif(trim(coalesce(p ->> 'summary', '')), ''))
    returning id into v_id;
    perform public.integration_seed_stages(v_id);
  else
    update public.projects set
      client_id      = p_client,
      title          = v_title,
      furniture_type = coalesce(nullif(trim(coalesce(p ->> 'furniture_type', '')), ''), furniture_type),
      address        = coalesce(nullif(trim(coalesce(p ->> 'address', '')), ''), address),
      summary        = coalesce(nullif(trim(coalesce(p ->> 'summary', '')), ''), summary),
      code           = coalesce(code, nullif(trim(coalesce(p ->> 'code', '')), '')),
      updated_at     = now()
    where id = v_id;
  end if;

  -- Статус меняем, только если он передан и допустим.
  if nullif(trim(coalesce(p ->> 'status', '')), '') is not null then
    update public.projects set status = (p ->> 'status')::public.project_status, updated_at = now()
    where id = v_id;
  end if;

  return v_id;
end;
$fn$;

-- ====================================================================
--  4. ПУБЛИКАЦИЯ ДОКУМЕНТА: два шага
--  Шаг 1 (begin)  — бронируем карточку документа, номер версии и путь файла.
--  Шаг 2 (finish) — файл уже залит в хранилище, показываем его клиенту.
--  Если заливка не удалась — abort убирает забронированную версию,
--  и клиент не увидит документ без файла.
-- ====================================================================

create or replace function public.integration_publish_begin(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_client   uuid;
  v_project  uuid;
  v_doc      uuid;
  v_ver      uuid;
  v_num      integer;
  v_path     text;
  v_ext      text;
  v_ref      text;
  v_file     text := nullif(trim(coalesce(p #>> '{document,file_name}', '')), '');
  v_cat      public.doc_category;
  v_title    text := nullif(trim(coalesce(p #>> '{document,title}', '')), '');
  v_created  boolean := false;
begin
  perform public.integration_guard();

  if v_file is null  then raise exception 'Не передано имя файла'; end if;
  if v_title is null then raise exception 'Не передано название документа'; end if;

  v_client  := public.integration_upsert_client(coalesce(p -> 'client', '{}'::jsonb));
  v_project := public.integration_upsert_project(v_client, coalesce(p -> 'project', '{}'::jsonb));

  v_cat := coalesce(nullif(trim(coalesce(p #>> '{document,category}', '')), ''), 'other')::public.doc_category;
  v_ref := nullif(trim(coalesce(p #>> '{document,ref}', '')), '');

  if v_ref is not null then
    select id into v_doc from public.documents where external_ref = v_ref;
  end if;

  if v_doc is null then
    insert into public.documents (project_id, category, title, description, external_ref,
                                  state, is_published, needs_approval)
    values (v_project, v_cat, v_title,
            nullif(trim(coalesce(p #>> '{document,description}', '')), ''),
            v_ref, 'draft', false,
            coalesce((p #>> '{document,needs_approval}')::boolean, false))
    returning id into v_doc;
    v_created := true;
  else
    update public.documents set
      project_id     = v_project,
      category       = v_cat,
      title          = v_title,
      description    = coalesce(nullif(trim(coalesce(p #>> '{document,description}', '')), ''), description),
      needs_approval = coalesce((p #>> '{document,needs_approval}')::boolean, needs_approval),
      updated_at     = now()
    where id = v_doc;
  end if;

  -- Расширение файла: нужно, чтобы браузер открывал документ правильно.
  v_ext := lower(coalesce(nullif(substring(v_file from '\.([A-Za-z0-9]{1,8})$'), ''), 'bin'));
  select coalesce(max(version), 0) + 1 into v_num
    from public.document_versions where document_id = v_doc;
  v_path := 'projects/' || v_project || '/' || v_doc || '/' || gen_random_uuid() || '.' || v_ext;

  insert into public.document_versions (document_id, version, storage_path, file_name,
                                        mime_type, comment, is_current)
  values (v_doc, v_num, v_path, v_file,
          nullif(trim(coalesce(p #>> '{document,mime_type}', '')), ''),
          nullif(trim(coalesce(p #>> '{document,comment}', '')), ''),
          false)
  returning id into v_ver;

  insert into public.audit_logs (project_id, action, entity, entity_id, meta)
  values (v_project, 'calculator.version.reserved', 'document_versions', v_ver,
          jsonb_build_object('document', v_doc, 'version', v_num, 'file', v_file,
                             'by', nullif(trim(coalesce(p ->> 'actor', '')), '')));

  return jsonb_build_object(
    'ok', true,
    'bucket', 'project-files',
    'client_id', v_client,
    'project_id', v_project,
    'document_id', v_doc,
    'document_created', v_created,
    'version_id', v_ver,
    'version', v_num,
    'storage_path', v_path
  );
end;
$fn$;

create or replace function public.integration_publish_finish(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_ver     uuid := nullif(trim(coalesce(p ->> 'version_id', '')), '')::uuid;
  v_doc     uuid;
  v_project uuid;
  v_num     integer;
  v_publish boolean := coalesce((p ->> 'publish')::boolean, true);
  v_size    bigint  := nullif(trim(coalesce(p ->> 'size_bytes', '')), '')::bigint;
begin
  perform public.integration_guard();
  if v_ver is null then raise exception 'Не передана версия документа'; end if;

  select v.document_id, v.version, d.project_id
    into v_doc, v_num, v_project
    from public.document_versions v
    join public.documents d on d.id = v.document_id
   where v.id = v_ver;

  if v_doc is null then raise exception 'Версия не найдена'; end if;

  update public.document_versions
     set size_bytes = coalesce(v_size, size_bytes),
         is_current = true
   where id = v_ver;

  update public.document_versions
     set is_current = false
   where document_id = v_doc and id <> v_ver and is_current;

  update public.documents
     set state = case when needs_approval then 'review'::public.doc_state else state end,
         is_published = case when v_publish then true else is_published end,
         updated_at = now()
   where id = v_doc;

  insert into public.audit_logs (project_id, action, entity, entity_id, meta)
  values (v_project, 'calculator.published', 'documents', v_doc,
          jsonb_build_object('version', v_num, 'version_id', v_ver,
                             'by', nullif(trim(coalesce(p ->> 'actor', '')), '')));

  return jsonb_build_object('ok', true, 'document_id', v_doc, 'version', v_num);
end;
$fn$;

create or replace function public.integration_publish_abort(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_ver uuid := nullif(trim(coalesce(p ->> 'version_id', '')), '')::uuid;
  v_doc uuid;
begin
  perform public.integration_guard();
  if v_ver is null then raise exception 'Не передана версия документа'; end if;

  select document_id into v_doc from public.document_versions where id = v_ver;
  if v_doc is null then return jsonb_build_object('ok', true, 'removed', false); end if;

  -- Удаляем только незавершённую броню: подтверждённые версии не трогаем.
  delete from public.document_versions where id = v_ver and size_bytes is null;

  -- Если карточка документа осталась совсем без версий и ещё не публиковалась — убираем и её.
  delete from public.documents d
   where d.id = v_doc
     and not d.is_published
     and not exists (select 1 from public.document_versions v where v.document_id = d.id);

  return jsonb_build_object('ok', true, 'removed', true);
end;
$fn$;

-- ====================================================================
--  5. СОСТАВ, ОПЛАТЫ, ЭТАПЫ
--  Строки, пришедшие из расчёта, помечены source='calculator' и при
--  следующей публикации заменяются целиком. Введённое руками в кабинете
--  остаётся нетронутым.
-- ====================================================================

create or replace function public.integration_sync_project(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_client   uuid;
  v_project  uuid;
  v_row      jsonb;
  v_pos      integer := 0;
  v_costs    integer := 0;
  v_pays     integer := 0;
  v_stages   integer := 0;
  v_unknown  text[] := '{}';
  v_name     text;
  v_hit      integer;
begin
  perform public.integration_guard();

  v_client  := public.integration_upsert_client(coalesce(p -> 'client', '{}'::jsonb));
  v_project := public.integration_upsert_project(v_client, coalesce(p -> 'project', '{}'::jsonb));

  -- Состав заказа: клиенту видно, из чего он состоит, и общая сумма.
  if p ? 'costs' then
    delete from public.project_costs where project_id = v_project and source = 'calculator';
    for v_row in select * from jsonb_array_elements(coalesce(p -> 'costs', '[]'::jsonb)) loop
      v_pos := v_pos + 1;
      insert into public.project_costs (project_id, position, title, details, amount,
                                        is_published, source)
      values (v_project, v_pos,
              coalesce(nullif(trim(coalesce(v_row ->> 'title', '')), ''), 'Позиция'),
              nullif(trim(coalesce(v_row ->> 'details', '')), ''),
              nullif(trim(coalesce(v_row ->> 'amount', '')), '')::numeric,
              coalesce((v_row ->> 'is_published')::boolean, true),
              'calculator');
      v_costs := v_costs + 1;
    end loop;
  end if;

  if p ? 'payments' then
    v_pos := 0;
    delete from public.project_payments where project_id = v_project and source = 'calculator';
    for v_row in select * from jsonb_array_elements(coalesce(p -> 'payments', '[]'::jsonb)) loop
      v_pos := v_pos + 1;
      insert into public.project_payments (project_id, position, title, amount, paid_amount,
                                           due_on, paid_on, status, note, is_published, source)
      values (v_project, v_pos,
              coalesce(nullif(trim(coalesce(v_row ->> 'title', '')), ''), 'Платёж'),
              nullif(trim(coalesce(v_row ->> 'amount', '')), '')::numeric,
              coalesce(nullif(trim(coalesce(v_row ->> 'paid_amount', '')), '')::numeric, 0),
              nullif(trim(coalesce(v_row ->> 'due_on', '')), '')::date,
              nullif(trim(coalesce(v_row ->> 'paid_on', '')), '')::date,
              coalesce(nullif(trim(coalesce(v_row ->> 'status', '')), ''), 'planned')::public.payment_status,
              nullif(trim(coalesce(v_row ->> 'note', '')), ''),
              coalesce((v_row ->> 'is_published')::boolean, true),
              'calculator');
      v_pays := v_pays + 1;
    end loop;
  end if;

  -- Этапы сопоставляются по названию. Неизвестные имена не выдумываем — возвращаем списком.
  for v_row in select * from jsonb_array_elements(coalesce(p -> 'stages', '[]'::jsonb)) loop
    v_name := nullif(trim(coalesce(v_row ->> 'name', '')), '');
    continue when v_name is null;

    update public.project_stages s set
      status         = coalesce(nullif(trim(coalesce(v_row ->> 'status', '')), '')::public.stage_status, s.status),
      planned_on     = coalesce(nullif(trim(coalesce(v_row ->> 'planned_on', '')), '')::date, s.planned_on),
      started_on     = coalesce(nullif(trim(coalesce(v_row ->> 'started_on', '')), '')::date, s.started_on),
      completed_on   = coalesce(nullif(trim(coalesce(v_row ->> 'completed_on', '')), '')::date, s.completed_on),
      client_comment = coalesce(nullif(trim(coalesce(v_row ->> 'client_comment', '')), ''), s.client_comment),
      updated_at     = now()
    where s.project_id = v_project and lower(s.name) = lower(v_name);

    get diagnostics v_hit = row_count;
    if v_hit > 0 then
      v_stages := v_stages + v_hit;
    else
      v_unknown := v_unknown || v_name;
    end if;
  end loop;

  insert into public.audit_logs (project_id, action, entity, entity_id, meta)
  values (v_project, 'calculator.sync', 'projects', v_project,
          jsonb_build_object('costs', v_costs, 'payments', v_pays, 'stages', v_stages,
                             'by', nullif(trim(coalesce(p ->> 'actor', '')), '')));

  return jsonb_build_object('ok', true, 'client_id', v_client, 'project_id', v_project,
                            'costs', v_costs, 'payments', v_pays, 'stages', v_stages,
                            'unknown_stages', to_jsonb(v_unknown));
end;
$fn$;

-- ====================================================================
--  6. ДОСТУП КЛИЕНТА: приглашение и состояние
-- ====================================================================

create or replace function public.integration_invite(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_client  uuid;
  v_project uuid;
  v_email   text := lower(nullif(trim(coalesce(p ->> 'email', '')), ''));
  v_token   text;
  v_id      uuid;
begin
  perform public.integration_guard();

  v_client  := public.integration_upsert_client(coalesce(p -> 'client', '{}'::jsonb));
  v_project := public.integration_upsert_project(v_client, coalesce(p -> 'project', '{}'::jsonb));

  -- Действующее приглашение не плодим: возвращаем то же самое.
  select id, token into v_id, v_token
    from public.project_invites
   where client_id = v_client
     and (project_id = v_project or project_id is null)
     and accepted_at is null and revoked_at is null and expires_at > now()
   order by created_at desc limit 1;

  if v_id is null then
    insert into public.project_invites (client_id, project_id, email, note)
    values (v_client, v_project, v_email, nullif(trim(coalesce(p ->> 'note', '')), ''))
    returning id, token into v_id, v_token;

    insert into public.audit_logs (project_id, action, entity, entity_id, meta)
    values (v_project, 'calculator.invite', 'project_invites', v_id,
            jsonb_build_object('email', v_email, 'by', nullif(trim(coalesce(p ->> 'actor', '')), '')));
  end if;

  return jsonb_build_object('ok', true, 'client_id', v_client, 'project_id', v_project,
                            'invite_id', v_id, 'token', v_token);
end;
$fn$;

create or replace function public.integration_status(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_ref     text := nullif(trim(coalesce(p ->> 'project_ref', '')), '');
  v_project uuid;
  v_client  uuid;
begin
  perform public.integration_guard();
  if v_ref is null then raise exception 'Не передан ключ проекта'; end if;

  select id, client_id into v_project, v_client from public.projects where external_ref = v_ref;
  if v_project is null then
    return jsonb_build_object('ok', true, 'known', false);
  end if;

  return jsonb_build_object(
    'ok', true,
    'known', true,
    'project_id', v_project,
    'has_access', exists (select 1 from public.project_members where project_id = v_project),
    'pending_invite', exists (
        select 1 from public.project_invites
         where client_id = v_client and accepted_at is null and revoked_at is null and expires_at > now()),
    'documents', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'ref', d.external_ref, 'title', d.title, 'category', d.category,
                 'state', d.state, 'published', d.is_published,
                 'version', (select max(v.version) from public.document_versions v where v.document_id = d.id),
                 'approved_at', (select max(a.created_at) from public.approvals a where a.document_id = d.id and a.decision = 'approved')))
          from public.documents d where d.project_id = v_project), '[]'::jsonb),
    'unread_messages', (select count(*) from public.project_messages m
                         where m.project_id = v_project and not m.from_staff and m.status = 'open')
  );
end;
$fn$;

-- ====================================================================
--  7. ОБРАТНЫЙ ПОТОК: что сделал клиент
--  Калькулятор спрашивает «что нового с момента X» и получает решения,
--  вопросы и принятые приглашения — уже в своих ключах (calc:…).
-- ====================================================================

create or replace function public.integration_events(p jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $fn$
declare
  v_since timestamptz := coalesce(nullif(trim(coalesce(p ->> 'since', '')), '')::timestamptz,
                                  now() - interval '7 days');
  v_limit integer := least(greatest(coalesce((p ->> 'limit')::integer, 200), 1), 500);
  v_items jsonb;
begin
  perform public.integration_guard();

  with ev as (
    select a.created_at,
           'decision'::text as kind,
           jsonb_build_object(
             'project_ref', pr.external_ref,
             'document_ref', d.external_ref,
             'document_title', d.title,
             'version', v.version,
             'decision', a.decision,
             'comment', a.comment,
             'who', coalesce(p2.full_name, p2.email)
           ) as data
      from public.approvals a
      join public.documents d        on d.id = a.document_id
      join public.document_versions v on v.id = a.version_id
      join public.projects pr        on pr.id = a.project_id
      left join public.profiles p2   on p2.id = a.user_id
     where a.created_at > v_since

    union all

    select m.created_at,
           'message'::text,
           jsonb_build_object(
             'project_ref', pr.external_ref,
             'document_ref', d.external_ref,
             'body', m.body,
             'who', coalesce(p2.full_name, p2.email),
             'status', m.status
           )
      from public.project_messages m
      join public.projects pr      on pr.id = m.project_id
      left join public.documents d on d.id = m.document_id
      left join public.profiles p2 on p2.id = m.author_id
     where m.created_at > v_since and not m.from_staff

    union all

    select i.accepted_at,
           'access'::text,
           jsonb_build_object(
             'project_ref', pr.external_ref,
             'who', coalesce(p2.full_name, p2.email, i.email)
           )
      from public.project_invites i
      left join public.projects pr on pr.id = i.project_id
      left join public.profiles p2 on p2.id = i.accepted_by
     where i.accepted_at is not null and i.accepted_at > v_since
  )
  select coalesce(jsonb_agg(jsonb_build_object('at', created_at, 'kind', kind) || data
                            order by created_at), '[]'::jsonb)
    into v_items
    from (select * from ev order by created_at limit v_limit) t;

  return jsonb_build_object('ok', true, 'now', now(), 'since', v_since, 'events', v_items);
end;
$fn$;

-- ====================================================================
--  8. ПРАВА: мост закрыт для всех, кроме служебного ключа
-- ====================================================================

do $grants$
declare fn text;
begin
  foreach fn in array array[
    'integration_guard()',
    'integration_upsert_client(jsonb)',
    'integration_seed_stages(uuid)',
    'integration_upsert_project(uuid, jsonb)',
    'integration_publish_begin(jsonb)',
    'integration_publish_finish(jsonb)',
    'integration_publish_abort(jsonb)',
    'integration_sync_project(jsonb)',
    'integration_invite(jsonb)',
    'integration_status(jsonb)',
    'integration_events(jsonb)'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', fn);
  end loop;
end;
$grants$;
