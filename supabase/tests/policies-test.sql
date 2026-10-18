-- ====================================================================
--  ПРОВЕРКА ПРАВ ДОСТУПА ЛИЧНОГО КАБИНЕТА
--  --------------------------------------------------------------
--  Это не «тест ради теста»: каждый блок повторяет сценарий из задания
--  владельцев, включая попытки подставить чужой идентификатор руками.
--  Скрипт сам создаёт трёх пользователей (администратор и два клиента),
--  проверяет 25 утверждений и в конце ОТКАТЫВАЕТ всё, что сделал, —
--  в базе не остаётся ни тестовых клиентов, ни тестовых файлов.
--
--  Запуск локально, на пустом PostgreSQL 15+ (см. local-shim.sql):
--    psql -f supabase/tests/local-shim.sql
--    psql -f supabase/migrations/0001_cabinet.sql
--    psql -v ON_ERROR_STOP=1 -f supabase/tests/policies-test.sql
--
--  Запуск на настоящем проекте Supabase: открыть SQL Editor и выполнить
--  этот файл целиком. Делайте это на свежем проекте, до появления живых
--  заказчиков: скрипт создаёт записи в auth.users и откатывает их.
--
--  Любое нарушение правил доступа роняет скрипт с понятной ошибкой.
-- ====================================================================

begin;

-- Настоящие пользователи кабинета — это роль authenticated с JWT.
-- Переключаемся между ними так же, как это делает PostgREST.
create or replace function pg_temp.act_as(p_user uuid) returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
                     json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
end $$;

create or replace function pg_temp.act_as_anon() returns void
language plpgsql as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '', true);
end $$;

-- Владелец базы: так ходит только сам Supabase (и этот скрипт при подготовке).
create or replace function pg_temp.act_as_owner() returns void
language plpgsql as $$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
end $$;

create or replace function pg_temp.ok(p_label text) returns void
language plpgsql as $$
begin
  raise notice '  ✓ %', p_label;
end $$;

-- ------------------------------------------------------------------
--  Действующие лица
-- ------------------------------------------------------------------

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'test-admin@recept.test',
   '{"full_name":"Тестовый администратор"}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'test-client-a@recept.test',
   '{"full_name":"Клиент А"}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'test-client-b@recept.test',
   '{"full_name":"Клиент Б"}'::jsonb);

do $$
begin
  if (select count(*) from public.profiles
      where id in ('11111111-1111-4111-8111-111111111111',
                   '22222222-2222-4222-8222-222222222222',
                   '33333333-3333-4333-8333-333333333333')) <> 3 then
    raise exception 'профиль не создаётся автоматически при регистрации';
  end if;
  if exists (select 1 from public.profiles
             where id = '22222222-2222-4222-8222-222222222222' and role <> 'client') then
    raise exception 'новый пользователь получил роль выше клиентской';
  end if;
  perform pg_temp.ok('регистрация создаёт профиль, и роль всегда «клиент»');
end $$;

-- Роль сотрудника выдаётся только в базе, из кабинета это сделать нельзя.
update public.profiles set role = 'admin'
where id = '11111111-1111-4111-8111-111111111111';

-- ------------------------------------------------------------------
--  1. Администратор заводит клиентов и проекты
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.clients (id, display_name, email, phone, city) values
  ('aaaaaaaa-0000-4000-8000-00000000000a', 'Семья А', 'test-client-a@recept.test', '+7 900 000-00-01', 'Тверь'),
  ('bbbbbbbb-0000-4000-8000-00000000000b', 'Семья Б', 'test-client-b@recept.test', '+7 900 000-00-02', 'Тверь');

insert into public.projects (id, client_id, title, furniture_type, address, status) values
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'aaaaaaaa-0000-4000-8000-00000000000a',
   'Кухня на Калинина', 'Кухня', 'Тверь, проспект Калинина, 13А', 'design'),
  ('a2a2a2a2-0000-4000-8000-00000000000a', 'aaaaaaaa-0000-4000-8000-00000000000a',
   'Гардеробная', 'Гардеробная', null, 'new'),
  ('b1b1b1b1-0000-4000-8000-00000000000b', 'bbbbbbbb-0000-4000-8000-00000000000b',
   'Кухня у клиента Б', 'Кухня', null, 'design');

do $$
begin
  if public.seed_stages('a1a1a1a1-0000-4000-8000-00000000000a') <> 13 then
    raise exception 'типовых этапов должно быть 13';
  end if;
  perform pg_temp.ok('администратор создаёт клиентов, проекты и 13 этапов');
end $$;

do $$
begin
  if (select count(*) from public.projects
      where client_id = 'aaaaaaaa-0000-4000-8000-00000000000a') <> 2 then
    raise exception 'у одного клиента должно быть несколько проектов';
  end if;
  perform pg_temp.ok('у одного клиента несколько проектов');
end $$;

-- ------------------------------------------------------------------
--  2. Регистрация без приглашения не даёт ничего
-- ------------------------------------------------------------------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.projects) <> 0 then
    raise exception 'зарегистрировавшийся без приглашения видит проекты';
  end if;
  if (select count(*) from public.clients) <> 0 then
    raise exception 'зарегистрировавшийся без приглашения видит карточки клиентов';
  end if;
  perform pg_temp.ok('новая учётная запись не видит ничего, пока её не привязали');
end $$;

-- ------------------------------------------------------------------
--  3. Приглашение по персональной ссылке
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.project_invites (id, token, client_id, project_id, email)
values ('cccccccc-0000-4000-8000-00000000000c', 'test-token-a',
        'aaaaaaaa-0000-4000-8000-00000000000a', null, 'test-client-a@recept.test');

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare opened uuid;
begin
  opened := public.accept_invite('test-token-a');
  if opened is null then raise exception 'приглашение не открыло ни одного проекта'; end if;
  if (select count(*) from public.projects) <> 2 then
    raise exception 'после приглашения клиент должен видеть оба своих проекта';
  end if;
  perform pg_temp.ok('персональная ссылка открывает доступ ко всем проектам клиента');
end $$;

-- Чужой токен подобрать нельзя: таблица приглашений клиенту не видна.
do $$
begin
  if (select count(*) from public.project_invites) <> 0 then
    raise exception 'клиент видит таблицу приглашений';
  end if;
  perform pg_temp.ok('таблица приглашений клиенту не видна');
end $$;

-- ------------------------------------------------------------------
--  4. Документы: черновик — внутренний, публикация — событие
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.documents (id, project_id, category, title, state, is_published)
values ('d1d1d1d1-0000-4000-8000-00000000000d', 'a1a1a1a1-0000-4000-8000-00000000000a',
        'contract', 'Договор на кухню', 'draft', false);

insert into public.document_versions (id, document_id, storage_path, file_name, mime_type, size_bytes, version)
values ('f1f1f1f1-0000-4000-8000-00000000000f', 'd1d1d1d1-0000-4000-8000-00000000000d',
        'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/v1.pdf',
        'dogovor.pdf', 'application/pdf', 120000, null);

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.documents) <> 0 then
    raise exception 'клиент видит неопубликованный документ';
  end if;
  if (select count(*) from public.document_versions) <> 0 then
    raise exception 'клиент видит версию неопубликованного документа';
  end if;
  perform pg_temp.ok('черновик документа клиенту не виден');
end $$;

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
update public.documents set is_published = true, state = 'review', needs_approval = true
where id = 'd1d1d1d1-0000-4000-8000-00000000000d';

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.documents) <> 1 then
    raise exception 'после публикации клиент не видит документ';
  end if;
  if (select count(*) from public.notifications
      where user_id = '22222222-2222-4222-8222-222222222222' and kind = 'document') <> 1 then
    raise exception 'публикация не создала уведомление в кабинете';
  end if;
  perform pg_temp.ok('публикация открывает документ клиенту и создаёт уведомление');
end $$;

-- ------------------------------------------------------------------
--  5. Версии и согласование
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.document_versions (id, document_id, storage_path, file_name, mime_type, version)
values ('f2f2f2f2-0000-4000-8000-00000000000f', 'd1d1d1d1-0000-4000-8000-00000000000d',
        'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/v2.pdf',
        'dogovor-v2.pdf', 'application/pdf', null);

do $$
begin
  if (select version from public.document_versions
      where id = 'f2f2f2f2-0000-4000-8000-00000000000f') <> 2 then
    raise exception 'номер версии не присвоился автоматически';
  end if;
  if (select count(*) from public.document_versions
      where document_id = 'd1d1d1d1-0000-4000-8000-00000000000d' and is_current) <> 1 then
    raise exception 'актуальной должна быть ровно одна версия';
  end if;
  if not (select is_current from public.document_versions
          where id = 'f2f2f2f2-0000-4000-8000-00000000000f') then
    raise exception 'актуальной должна стать последняя версия';
  end if;
  perform pg_temp.ok('новая версия нумеруется сама и становится актуальной');
end $$;

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare decision_id uuid;
begin
  decision_id := public.record_decision('f2f2f2f2-0000-4000-8000-00000000000f', 'approved', 'Согласен');
  if decision_id is null then raise exception 'решение не записалось'; end if;
  if (select state from public.documents where id = 'd1d1d1d1-0000-4000-8000-00000000000d') <> 'approved' then
    raise exception 'документ не перешёл в состояние «согласовано»';
  end if;
  perform pg_temp.ok('клиент согласовывает версию, решение записано с автором и временем');
end $$;

-- Подменить согласованный файл нельзя даже сотруднику.
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

do $$
declare blocked boolean := false;
begin
  begin
    update public.document_versions
      set storage_path = 'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/podmena.pdf'
      where id = 'f2f2f2f2-0000-4000-8000-00000000000f';
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'согласованную версию удалось подменить'; end if;
  perform pg_temp.ok('согласованную версию нельзя подменить молча');
end $$;

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.document_versions (id, document_id, storage_path, file_name, mime_type, version)
values ('f3f3f3f3-0000-4000-8000-00000000000f', 'd1d1d1d1-0000-4000-8000-00000000000d',
        'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/v3.pdf',
        'dogovor-v3.pdf', 'application/pdf', null);

do $$
begin
  if (select state from public.documents where id = 'd1d1d1d1-0000-4000-8000-00000000000d') <> 'review' then
    raise exception 'после новой версии согласование должно сбрасываться';
  end if;
  perform pg_temp.ok('новая версия снимает прежнее согласование — нужно согласовать заново');
end $$;

-- Согласовать можно только актуальную версию.
select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare blocked boolean := false;
begin
  begin
    perform public.record_decision('f2f2f2f2-0000-4000-8000-00000000000f', 'approved', null);
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'удалось согласовать устаревшую версию'; end if;
  perform pg_temp.ok('согласовать можно только актуальную версию');
end $$;

-- ------------------------------------------------------------------
--  6. Этапы, заметки, деньги
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

update public.project_stages set status = 'in_progress', client_comment = 'Начали замер'
where project_id = 'a1a1a1a1-0000-4000-8000-00000000000a' and position = 2;

insert into public.project_notes (project_id, title, body, visibility) values
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'Договорились о ручках', 'Профиль GOLA, цвет графит', 'client'),
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'Для себя', 'Проверить сроки у поставщика', 'internal');

insert into public.project_costs (project_id, title, amount, is_published) values
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'Корпуса и фасады', 180000, true),
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'Черновой расчёт', 999999, false);

insert into public.project_payments (project_id, title, amount, paid_amount, status, is_published) values
  ('a1a1a1a1-0000-4000-8000-00000000000a', 'Первый платёж', 90000, 90000, 'paid', true);

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.project_stages
      where project_id = 'a1a1a1a1-0000-4000-8000-00000000000a') <> 13 then
    raise exception 'клиент не видит шкалу этапов';
  end if;
  if (select count(*) from public.notifications
      where user_id = '22222222-2222-4222-8222-222222222222' and kind = 'stage') <> 1 then
    raise exception 'смена этапа не создала уведомление';
  end if;
  if (select count(*) from public.project_notes) <> 1 then
    raise exception 'клиенту видна внутренняя заметка';
  end if;
  if (select count(*) from public.project_costs) <> 1 then
    raise exception 'клиенту видна неопубликованная строка сметы';
  end if;
  perform pg_temp.ok('клиент видит этапы и опубликованное, но не внутреннее');
end $$;

-- Клиент не может править чужие записи.
do $$
declare blocked boolean := false;
begin
  begin
    update public.project_stages set status = 'done'
    where project_id = 'a1a1a1a1-0000-4000-8000-00000000000a';
    if found then blocked := false; else blocked := true; end if;
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'клиент изменил этап проекта'; end if;
  perform pg_temp.ok('клиент не может править этапы и записи мастерской');
end $$;

-- ------------------------------------------------------------------
--  7. Обращения
-- ------------------------------------------------------------------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

insert into public.project_messages (project_id, author_id, body, document_id)
values ('a1a1a1a1-0000-4000-8000-00000000000a', '22222222-2222-4222-8222-222222222222',
        'Вопрос по договору', 'd1d1d1d1-0000-4000-8000-00000000000d');

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.project_messages (project_id, author_id, body, from_staff)
    values ('a1a1a1a1-0000-4000-8000-00000000000a', '22222222-2222-4222-8222-222222222222',
            'Это как будто ответ мастерской', true);
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'клиент выдал своё сообщение за ответ мастерской'; end if;
  perform pg_temp.ok('клиент не может подписаться мастерской');
end $$;

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.project_messages (project_id, author_id, body)
    values ('a1a1a1a1-0000-4000-8000-00000000000a', '33333333-3333-4333-8333-333333333333',
            'Сообщение от чужого имени');
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'удалось написать от чужого имени'; end if;
  perform pg_temp.ok('нельзя отправить обращение от чужого имени');
end $$;

-- ------------------------------------------------------------------
--  8. Разделение клиентов: подстановка чужого идентификатора
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into public.documents (id, project_id, category, title, is_published)
values ('d2d2d2d2-0000-4000-8000-00000000000d', 'b1b1b1b1-0000-4000-8000-00000000000b',
        'sketch', 'Эскиз клиента Б', true);

insert into public.project_members (project_id, user_id)
values ('b1b1b1b1-0000-4000-8000-00000000000b', '33333333-3333-4333-8333-333333333333');

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  -- Ровно то, что сделал бы любопытный человек в адресной строке.
  if (select count(*) from public.projects
      where id = 'b1b1b1b1-0000-4000-8000-00000000000b') <> 0 then
    raise exception 'клиент А открыл проект клиента Б по идентификатору';
  end if;
  if (select count(*) from public.documents
      where project_id = 'b1b1b1b1-0000-4000-8000-00000000000b') <> 0 then
    raise exception 'клиент А увидел документы клиента Б';
  end if;
  if (select count(*) from public.clients
      where id = 'bbbbbbbb-0000-4000-8000-00000000000b') <> 0 then
    raise exception 'клиент А увидел карточку клиента Б';
  end if;
  if (select count(*) from public.project_messages
      where project_id = 'b1b1b1b1-0000-4000-8000-00000000000b') <> 0 then
    raise exception 'клиент А увидел переписку клиента Б';
  end if;
  perform pg_temp.ok('подстановка чужого идентификатора ничего не открывает');
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    insert into public.project_members (project_id, user_id)
    values ('b1b1b1b1-0000-4000-8000-00000000000b', '22222222-2222-4222-8222-222222222222');
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'клиент сам выписал себе доступ к чужому проекту'; end if;
  perform pg_temp.ok('клиент не может выдать себе доступ к чужому проекту');
end $$;

-- ------------------------------------------------------------------
--  9. Попытка стать сотрудником
-- ------------------------------------------------------------------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare blocked boolean := false;
begin
  begin
    update public.profiles set role = 'admin'
    where id = '22222222-2222-4222-8222-222222222222';
  exception when others then blocked := true;
  end;
  if not blocked
     and (select role from public.profiles
          where id = '22222222-2222-4222-8222-222222222222') = 'admin' then
    raise exception 'клиент повысил себя до администратора';
  end if;
  perform pg_temp.ok('клиент не может повысить себе роль');
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    perform public.seed_stages('b1b1b1b1-0000-4000-8000-00000000000b');
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'клиент выполнил служебную функцию'; end if;
  perform pg_temp.ok('служебные функции закрыты для клиента');
end $$;

do $$
begin
  if (select count(*) from public.audit_logs) <> 0 then
    raise exception 'клиент читает журнал действий';
  end if;
  perform pg_temp.ok('журнал действий клиенту не виден');
end $$;

-- ------------------------------------------------------------------
--  10. Хранилище файлов
-- ------------------------------------------------------------------

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
declare blocked boolean := false;
begin
  begin
    insert into storage.objects (bucket_id, name)
    values ('project-files',
            'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/podlog.pdf');
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'клиент загрузил файл в хранилище'; end if;
  perform pg_temp.ok('загружать файлы может только мастерская');
end $$;

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

insert into storage.objects (bucket_id, name) values
  ('project-files', 'projects/a1a1a1a1-0000-4000-8000-00000000000a/d1d1d1d1-0000-4000-8000-00000000000d/v3.pdf'),
  ('project-files', 'projects/b1b1b1b1-0000-4000-8000-00000000000b/d2d2d2d2-0000-4000-8000-00000000000d/sketch.pdf');

do $$
begin
  if (select public from storage.buckets where id = 'project-files') then
    raise exception 'хранилище файлов оказалось публичным';
  end if;
  perform pg_temp.ok('бакет с файлами закрытый — публичных ссылок не существует');
end $$;

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from storage.objects
      where name like 'projects/b1b1b1b1%') <> 0 then
    raise exception 'клиент А добрался до файла клиента Б';
  end if;
  if (select count(*) from storage.objects
      where name like 'projects/a1a1a1a1%') <> 1 then
    raise exception 'клиент не видит файл своего опубликованного документа';
  end if;
  perform pg_temp.ok('файлы видно только по своему опубликованному документу');
end $$;

-- Сняли публикацию — файл снова недоступен.
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
update public.documents set is_published = false where id = 'd1d1d1d1-0000-4000-8000-00000000000d';

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from storage.objects where name like 'projects/a1a1a1a1%') <> 0 then
    raise exception 'после снятия публикации файл остался доступен';
  end if;
  perform pg_temp.ok('снятие публикации сразу закрывает файл');
end $$;

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
update public.documents set is_published = true where id = 'd1d1d1d1-0000-4000-8000-00000000000d';

-- ------------------------------------------------------------------
--  11. Аноним
-- ------------------------------------------------------------------

select pg_temp.act_as_anon();

do $$
declare blocked boolean := false;
begin
  begin
    perform count(*) from public.documents;
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'аноним читает таблицу документов'; end if;
  perform pg_temp.ok('анонимному ключу таблицы недоступны вовсе');
end $$;

do $$
declare blocked boolean := false;
begin
  begin
    perform count(*) from storage.objects;
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'аноним читает хранилище'; end if;
  perform pg_temp.ok('анонимному ключу недоступно хранилище файлов');
end $$;

-- ------------------------------------------------------------------
--  12. Блокировка учётной записи
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
update public.profiles set is_blocked = true where id = '22222222-2222-4222-8222-222222222222';

select pg_temp.act_as('22222222-2222-4222-8222-222222222222');

do $$
begin
  if (select count(*) from public.projects) <> 0 then
    raise exception 'заблокированный пользователь продолжает видеть проекты';
  end if;
  if (select count(*) from public.documents) <> 0 then
    raise exception 'заблокированный пользователь продолжает видеть документы';
  end if;
  perform pg_temp.ok('блокировка мгновенно закрывает доступ');
end $$;

-- ------------------------------------------------------------------
--  13. Журнал действий у сотрудника
-- ------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-4111-8111-111111111111');

do $$
declare missing text;
begin
  select string_agg(a, ', ') into missing
  from unnest(array['document.created', 'document.published', 'document.unpublished',
                    'version.uploaded', 'document.approved', 'stage.status',
                    'invite.accepted']) as a
  where not exists (select 1 from public.audit_logs l where l.action = a);
  if missing is not null then
    raise exception 'в журнале не хватает действий: %', missing;
  end if;
  perform pg_temp.ok('журнал фиксирует загрузки, публикации, согласования и смену этапов');
end $$;

do $$
begin
  if (select count(*) from public.projects) <> 3 then
    raise exception 'сотрудник должен видеть все проекты';
  end if;
  perform pg_temp.ok('сотрудник видит все проекты мастерской');
end $$;

select pg_temp.act_as_owner();

do $$
begin
  raise notice '';
  raise notice '  ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ. Тестовые данные откатываются.';
  raise notice '';
end $$;

rollback;
