'use client';

import { useMemo, useState } from 'react';
import { createNote, deleteNote } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { noteCategories } from '@/lib/cabinet/labels';
import { formatDateTime, personName } from '@/lib/cabinet/format';
import type { Note, Visibility } from '@/lib/cabinet/types';
import {
  Action,
  EmptyState,
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
  Modal,
  Notice,
  Panel,
  Pill,
} from '../ui';

/**
 * ЗАМЕТКИ И ДОГОВОРЁННОСТИ
 * ========================
 * Журнал проекта: что решили, когда и кто это записал. Клиент читает,
 * но не правит — исправление оформляется новой записью, чтобы история
 * решений оставалась цельной.
 *
 * Внутренние заметки сотрудников лежат в той же таблице, но клиенту
 * их не отдаёт база: политика доступа фильтрует строки по visibility.
 */

export function NotesSection({
  projectId,
  notes,
  staff,
  authorId,
  reload,
}: {
  projectId: string;
  notes: Note[];
  staff: boolean;
  authorId: string;
  reload: () => Promise<void>;
}) {
  const [creating, setCreating] = useState(false);
  const [showInternal, setShowInternal] = useState(false);

  const shared = useMemo(() => notes.filter((n) => n.visibility === 'client'), [notes]);
  const internal = useMemo(() => notes.filter((n) => n.visibility === 'internal'), [notes]);
  const visible = staff && showInternal ? internal : shared;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {staff ? (
          <div className="flex gap-1 border border-line p-1">
            <Action
              size="sm"
              variant={showInternal ? 'quiet' : 'primary'}
              onClick={() => setShowInternal(false)}
            >
              История проекта ({shared.length})
            </Action>
            <Action
              size="sm"
              variant={showInternal ? 'primary' : 'quiet'}
              onClick={() => setShowInternal(true)}
            >
              Внутренние ({internal.length})
            </Action>
          </div>
        ) : (
          <p className="text-[0.9375rem] text-stone">
            Здесь мы фиксируем всё, о чём договорились, — чтобы не искать в переписке.
          </p>
        )}
        {staff ? (
          <Action variant="primary" onClick={() => setCreating(true)}>
            Добавить запись
          </Action>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Записей пока нет">
          {staff
            ? 'Фиксируйте решения сразу: «ручки меняем на GOLA», «мойка из нержавейки».'
            : 'Как только появятся решения по проекту, мы запишем их здесь с датой.'}
        </EmptyState>
      ) : (
        <ul className="grid gap-3">
          {visible.map((note) => (
            <Panel as="li" key={note.id} className="grid gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-display text-[1.0625rem] leading-snug text-ink">{note.title}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {note.category ? <Pill>{note.category}</Pill> : null}
                  {note.visibility === 'internal' ? <Pill tone="wait">Только для нас</Pill> : null}
                </div>
              </div>
              {note.body ? (
                <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-stone">{note.body}</p>
              ) : null}
              <p className="text-[0.8125rem] text-stone">
                {formatDateTime(note.created_at)} · {personName(note.profiles)}
              </p>
              {staff ? (
                <div>
                  <Action
                    size="sm"
                    variant="quiet"
                    onClick={() => {
                      if (!window.confirm('Удалить запись? История изменится.')) return;
                      void deleteNote(note.id).then(reload);
                    }}
                  >
                    Удалить
                  </Action>
                </div>
              ) : null}
            </Panel>
          ))}
        </ul>
      )}

      {staff ? (
        <NoteModal
          open={creating}
          projectId={projectId}
          authorId={authorId}
          defaultVisibility={showInternal ? 'internal' : 'client'}
          onClose={() => setCreating(false)}
          reload={reload}
        />
      ) : null}
    </div>
  );
}

function NoteModal({
  open,
  projectId,
  authorId,
  defaultVisibility,
  onClose,
  reload,
}: {
  open: boolean;
  projectId: string;
  authorId: string;
  defaultVisibility: Visibility;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>(noteCategories[0]);
  const [visibility, setVisibility] = useState<Visibility>(defaultVisibility);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новая запись"
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!title.trim()) {
                setError('Нужен заголовок');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                await createNote({
                  project_id: projectId,
                  title: title.trim(),
                  body: body.trim() || null,
                  category,
                  visibility,
                  author_id: authorId,
                });
                await reload();
                setTitle('');
                setBody('');
                onClose();
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Сохранить
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <LabeledInput
          label="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Согласовали цвет фасадов"
        />
        <LabeledTextarea label="Текст" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect label="Категория" value={category} onChange={(e) => setCategory(e.target.value)}>
            {noteCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </LabeledSelect>
          <LabeledSelect
            label="Видимость"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            hint={visibility === 'internal' ? 'Клиент эту запись не увидит' : 'Запись увидит клиент'}
          >
            <option value="client">История проекта (видит клиент)</option>
            <option value="internal">Внутренняя заметка</option>
          </LabeledSelect>
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
