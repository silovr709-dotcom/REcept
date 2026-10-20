-- ====================================================================
--  ПРОВЕРКА МОСТА «КАЛЬКУЛЯТОР → КАБИНЕТ» (0002_integration.sql)
--  --------------------------------------------------------------
--  Запускается в транзакции и откатывается: живые данные не меняются.
--    psql -f supabase/tests/local-shim.sql
--    psql -f supabase/migrations/0001_cabinet.sql
--    psql -f supabase/migrations/0002_integration.sql
--    psql -f supabase/tests/integration-test.sql
-- ====================================================================

begin;

create or replace function pg_temp.ok(p_cond boolean, p_name text) returns void
language plpgsql as $fn$
begin
  if p_cond then
    raise notice 'OK   %', p_name;
  else
    raise exception 'ПРОВАЛ: %', p_name;
  end if;
end;
$fn$;

create or replace function pg_temp.act_as(p_user uuid) returns void
language plpgsql as $fn$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
end;
$fn$;

create or replace function pg_temp.act_as_service() returns void
language plpgsql as $fn$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
end;
$fn$;

-- --------------------------------------------------------------------
--  Подготовка: клиентская учётная запись (её создаст триггер профиля)
-- --------------------------------------------------------------------
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'klient-a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'chuzhoy@example.com');

-- ====================================================================
--  1. ПЕРВАЯ ПУБЛИКАЦИЯ: клиент, проект, документ, версия
-- ====================================================================
do $t$
declare r jsonb; v_stages integer;
begin
  perform pg_temp.act_as_service();

  r := public.integration_publish_begin(jsonb_build_object(
    'actor', 'Роберт',
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.',
                                  'phone', '+7 (910) 111-22-33', 'email', 'klient-a@example.com'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина',
                                  'furniture_type', 'Кухня', 'address', 'Тверь, Калинина 13А'),
    'document', jsonb_build_object('ref', 'calc:pr1:offer', 'category', 'estimate',
                                   'title', 'Коммерческое предложение',
                                   'file_name', 'КП.docx', 'needs_approval', true,
                                   'mime_type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')));

  perform pg_temp.ok(r ->> 'ok' = 'true', '1.1 публикация начата');
  perform pg_temp.ok((r ->> 'version')::int = 1, '1.2 первая версия имеет номер 1');
  perform pg_temp.ok(r ->> 'storage_path' like 'projects/%/%.docx', '1.3 путь файла в приватном хранилище');
  perform pg_temp.ok((r ->> 'document_created')::boolean, '1.4 карточка документа создана');

  select count(*) into v_stages from public.project_stages
   where project_id = (r ->> 'project_id')::uuid;
  perform pg_temp.ok(v_stages = 13, '1.5 новому проекту заведены 13 этапов');

  -- До подтверждения заливки клиент документ не видит.
  perform pg_temp.ok(not (select is_published from public.documents where id = (r ->> 'document_id')::uuid),
                     '1.6 документ без файла не опубликован');

  r := public.integration_publish_finish(jsonb_build_object(
         'version_id', r ->> 'version_id', 'size_bytes', '34567', 'actor', 'Роберт'));
  perform pg_temp.ok(r ->> 'ok' = 'true', '1.7 публикация подтверждена');

  perform pg_temp.ok((select is_published from public.documents where external_ref = 'calc:pr1:offer'),
                     '1.8 после заливки документ опубликован');
  perform pg_temp.ok((select state from public.documents where external_ref = 'calc:pr1:offer') = 'review',
                     '1.9 документ ждёт согласования');
end;
$t$;

-- ====================================================================
--  2. ПОВТОРНАЯ ПУБЛИКАЦИЯ: та же карточка, новая версия
-- ====================================================================
do $t$
declare r jsonb; v_docs integer; v_cli integer;
begin
  perform pg_temp.act_as_service();

  r := public.integration_publish_begin(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.', 'phone', '8-910-111-22-33'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина'),
    'document', jsonb_build_object('ref', 'calc:pr1:offer', 'category', 'estimate',
                                   'title', 'Коммерческое предложение',
                                   'file_name', 'КП-2.docx', 'comment', 'Добавили подсветку')));
  perform pg_temp.ok((r ->> 'version')::int = 2, '2.1 вторая отправка — версия 2');
  perform pg_temp.ok(not (r ->> 'document_created')::boolean, '2.2 карточка документа не продублирована');

  select count(*) into v_docs from public.documents where external_ref = 'calc:pr1:offer';
  perform pg_temp.ok(v_docs = 1, '2.3 документ в кабинете один');

  select count(*) into v_cli from public.clients;
  perform pg_temp.ok(v_cli = 1, '2.4 клиент не задвоился (телефон в другом формате)');

  perform public.integration_publish_finish(jsonb_build_object('version_id', r ->> 'version_id', 'size_bytes', '41000'));

  perform pg_temp.ok((select version from public.document_versions
                       where document_id = (r ->> 'document_id')::uuid and is_current) = 2,
                     '2.5 действующей считается версия 2');
  perform pg_temp.ok((select count(*) from public.document_versions
                       where document_id = (r ->> 'document_id')::uuid) = 2,
                     '2.6 прежняя версия сохранена в истории');
end;
$t$;

-- ====================================================================
--  3. СБОЙ ЗАЛИВКИ: бронь убирается, мусор не остаётся
-- ====================================================================
do $t$
declare r jsonb; v_left integer;
begin
  perform pg_temp.act_as_service();

  r := public.integration_publish_begin(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина'),
    'document', jsonb_build_object('ref', 'calc:pr1:sketch', 'category', 'sketch',
                                   'title', 'Эскиз кухни', 'file_name', 'eskiz.pdf')));

  perform public.integration_publish_abort(jsonb_build_object('version_id', r ->> 'version_id'));

  select count(*) into v_left from public.documents where external_ref = 'calc:pr1:sketch';
  perform pg_temp.ok(v_left = 0, '3.1 неудачная отправка не оставила пустой документ');
end;
$t$;

-- ====================================================================
--  4. СОСТАВ, ОПЛАТЫ И ЭТАПЫ
-- ====================================================================
do $t$
declare r jsonb; v_manual uuid; v_project uuid;
begin
  perform pg_temp.act_as_service();
  select id into v_project from public.projects where external_ref = 'calc:pr1';

  -- Строка, заведённая сотрудником руками: её трогать нельзя.
  insert into public.project_costs (project_id, position, title, amount, is_published, source)
  values (v_project, 99, 'Ручная строка', 1000, true, 'manual') returning id into v_manual;

  r := public.integration_sync_project(jsonb_build_object(
    'actor', 'Роберт',
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина', 'status', 'design'),
    'costs', jsonb_build_array(
        jsonb_build_object('title', 'Корпуса и фасады', 'details', '12 модулей'),
        jsonb_build_object('title', 'Столешница', 'details', 'компакт-плита')),
    'payments', jsonb_build_array(
        jsonb_build_object('title', 'Задаток', 'amount', '23000', 'status', 'paid', 'paid_amount', '23000')),
    'stages', jsonb_build_array(
        jsonb_build_object('name', 'Замер помещения', 'status', 'done', 'completed_on', '2026-10-15'),
        jsonb_build_object('name', 'Выдуманный этап', 'status', 'done'))));

  perform pg_temp.ok((r ->> 'costs')::int = 2, '4.1 состав перенесён');
  perform pg_temp.ok((r ->> 'payments')::int = 1, '4.2 оплата перенесена');
  perform pg_temp.ok((r ->> 'stages')::int = 1, '4.3 этап обновлён по названию');
  perform pg_temp.ok(r -> 'unknown_stages' ? 'Выдуманный этап', '4.4 несуществующий этап не выдуман, а возвращён');
  perform pg_temp.ok(exists (select 1 from public.project_costs where id = v_manual),
                     '4.5 ручная строка сметы не затёрта');
  perform pg_temp.ok((select status from public.projects where id = v_project) = 'design',
                     '4.6 статус проекта обновлён');

  -- Повторная выгрузка не плодит дубли.
  perform public.integration_sync_project(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина'),
    'costs', jsonb_build_array(jsonb_build_object('title', 'Корпуса и фасады'))));
  perform pg_temp.ok((select count(*) from public.project_costs
                       where project_id = v_project and source = 'calculator') = 1,
                     '4.7 повторная выгрузка заменяет состав, а не добавляет');
end;
$t$;

-- ====================================================================
--  5. ПРИГЛАШЕНИЕ И ДОСТУП КЛИЕНТА
-- ====================================================================
do $t$
declare r jsonb; v_token text; v_project uuid;
begin
  perform pg_temp.act_as_service();

  r := public.integration_invite(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.', 'email', 'klient-a@example.com'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина'),
    'email', 'klient-a@example.com'));
  v_token := r ->> 'token';
  v_project := (r ->> 'project_id')::uuid;
  perform pg_temp.ok(length(v_token) > 30, '5.1 выдан длинный одноразовый токен');

  -- Второй вызов не плодит приглашения.
  r := public.integration_invite(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина')));
  perform pg_temp.ok(r ->> 'token' = v_token, '5.2 повторный вызов возвращает то же приглашение');

  -- Клиент принимает приглашение своей учётной записью.
  perform pg_temp.act_as('11111111-1111-1111-1111-111111111111');
  perform public.accept_invite(v_token);
  perform pg_temp.ok(exists (select 1 from public.project_members
                              where project_id = v_project
                                and user_id = '11111111-1111-1111-1111-111111111111'),
                     '5.3 клиент получил доступ к проекту');

  -- Клиент видит опубликованный документ и не видит ничего чужого.
  perform pg_temp.ok((select count(*) from public.documents where project_id = v_project) = 1,
                     '5.4 клиент видит опубликованный документ');

  perform pg_temp.act_as('22222222-2222-2222-2222-222222222222');
  perform pg_temp.ok((select count(*) from public.projects) = 0,
                     '5.5 посторонний не видит чужой проект');
  perform pg_temp.ok((select count(*) from public.documents) = 0,
                     '5.6 посторонний не видит чужие документы');
end;
$t$;

-- ====================================================================
--  6. МОСТ ЗАКРЫТ ДЛЯ ВСЕХ, КРОМЕ СЛУЖЕБНОГО КЛЮЧА
-- ====================================================================
do $t$
declare r jsonb; v_failed boolean;
begin
  -- Клиент пытается опубликовать себе документ.
  perform pg_temp.act_as('11111111-1111-1111-1111-111111111111');
  v_failed := false;
  begin
    r := public.integration_publish_begin(jsonb_build_object(
      'client',  jsonb_build_object('ref', 'calc:hack', 'display_name', 'Я сам'),
      'project', jsonb_build_object('ref', 'calc:hack', 'title', 'Чужое'),
      'document', jsonb_build_object('title', 'Подделка', 'file_name', 'x.pdf')));
  exception when others then v_failed := true;
  end;
  perform pg_temp.ok(v_failed, '6.1 клиент не может публиковать документы');

  v_failed := false;
  begin
    r := public.integration_events('{}'::jsonb);
  exception when others then v_failed := true;
  end;
  perform pg_temp.ok(v_failed, '6.2 клиент не может читать поток событий');

  v_failed := false;
  begin
    r := public.integration_invite(jsonb_build_object(
      'client', jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
      'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина')));
  exception when others then v_failed := true;
  end;
  perform pg_temp.ok(v_failed, '6.3 клиент не может выдать себе приглашение');
end;
$t$;

-- ====================================================================
--  7. ОБРАТНЫЙ ПОТОК: решение клиента доходит до калькулятора
-- ====================================================================
do $t$
declare r jsonb; v_doc uuid; v_ver uuid; v_project uuid; v_ev jsonb;
begin
  select d.id, d.project_id into v_doc, v_project
    from public.documents d where d.external_ref = 'calc:pr1:offer';
  select id into v_ver from public.document_versions
   where document_id = v_doc and is_current;

  -- Клиент согласовывает действующую версию.
  perform pg_temp.act_as('11111111-1111-1111-1111-111111111111');
  perform public.record_decision(v_ver, 'approved', 'Всё нравится, запускайте');

  perform pg_temp.act_as_service();
  r := public.integration_events(jsonb_build_object('since', (now() - interval '1 hour')::text));
  perform pg_temp.ok((r -> 'events') is not null, '7.1 поток событий отвечает');

  select e into v_ev from jsonb_array_elements(r -> 'events') e
   where e ->> 'kind' = 'decision' limit 1;
  perform pg_temp.ok(v_ev is not null, '7.2 решение клиента попало в поток');
  perform pg_temp.ok(v_ev ->> 'project_ref' = 'calc:pr1', '7.3 событие пришло с ключом калькулятора');
  perform pg_temp.ok(v_ev ->> 'document_ref' = 'calc:pr1:offer', '7.4 видно, какой документ согласован');
  perform pg_temp.ok(v_ev ->> 'decision' = 'approved', '7.5 решение — «согласовано»');

  r := public.integration_status(jsonb_build_object('project_ref', 'calc:pr1'));
  perform pg_temp.ok((r ->> 'has_access')::boolean, '7.6 состояние: у клиента есть доступ');
  perform pg_temp.ok((r -> 'documents') @> '[{"ref":"calc:pr1:offer","published":true}]'::jsonb,
                     '7.7 состояние: документ опубликован');
end;
$t$;

-- ====================================================================
--  8. СОГЛАСОВАННУЮ ВЕРСИЮ НЕЛЬЗЯ ПОДМЕНИТЬ
-- ====================================================================
do $t$
declare r jsonb; v_doc uuid; v_ver uuid; v_failed boolean := false;
begin
  perform pg_temp.act_as_service();
  select id into v_doc from public.documents where external_ref = 'calc:pr1:offer';
  select id into v_ver from public.document_versions where document_id = v_doc and is_current;

  begin
    update public.document_versions
       set storage_path = 'projects/подмена.docx', file_name = 'подмена.docx'
     where id = v_ver;
  exception when others then v_failed := true;
  end;
  perform pg_temp.ok(v_failed, '8.1 файл согласованной версии подменить нельзя');

  -- Новая отправка создаёт версию 3 и снимает отметку «согласовано».
  r := public.integration_publish_begin(jsonb_build_object(
    'client',  jsonb_build_object('ref', 'calc:cl1', 'display_name', 'Татьяна Д.'),
    'project', jsonb_build_object('ref', 'calc:pr1', 'title', 'Кухня на Калинина'),
    'document', jsonb_build_object('ref', 'calc:pr1:offer', 'category', 'estimate',
                                   'title', 'Коммерческое предложение', 'file_name', 'КП-3.docx',
                                   'needs_approval', true)));
  perform pg_temp.ok((r ->> 'version')::int = 3, '8.2 исправление — это новая версия 3');
  perform pg_temp.ok((select state from public.documents where id = v_doc) = 'review',
                     '8.3 новая версия снова ждёт согласования');
  perform pg_temp.ok(exists (select 1 from public.approvals a where a.version_id = v_ver),
                     '8.4 прежнее согласование сохранено в истории');
end;
$t$;

do $t$ begin raise notice '--- Все проверки моста пройдены ---'; end; $t$;

rollback;
