'use client';

import { useMemo, useState } from 'react';
import {
  createDocument,
  currentVersion,
  deleteDocument,
  updateDocument,
  uploadVersion,
  validateFile,
  MAX_FILE_MB,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { docCategoryLabel, docCategoryOrder, docStateLabel, toneOf } from '@/lib/cabinet/labels';
import { formatDateTime, formatSize } from '@/lib/cabinet/format';
import type { Doc, DocCategory, DocState } from '@/lib/cabinet/types';
import {
  Action,
  EmptyState,
  Field,
  Input,
  LabeledInput,
  LabeledSelect,
  LabeledTextarea,
  Modal,
  Notice,
  Panel,
  Pill,
  Select,
} from '../ui';
import { DownloadButton, FileViewer } from '../FileViewer';

/**
 * ДОКУМЕНТЫ ПРОЕКТА
 * =================
 * Один и тот же раздел для клиента и для сотрудника: клиент видит только
 * опубликованные карточки (это обеспечивает база, а не интерфейс), а
 * сотруднику дополнительно показываются управляющие кнопки.
 *
 * Главный смысл подачи — человек должен за секунду понять, какая версия
 * актуальная. Поэтому актуальная стоит первой и крупно, а прежние
 * спрятаны под «историю версий».
 */

export function DocumentsSection({
  projectId,
  docs,
  staff,
  reload,
  onlyCategories,
  heading = 'Документы',
}: {
  projectId: string;
  docs: Doc[];
  staff: boolean;
  reload: () => Promise<void>;
  onlyCategories?: DocCategory[];
  heading?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | DocCategory>('all');
  const [preview, setPreview] = useState<{ doc: Doc; versionId: string } | null>(null);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [creating, setCreating] = useState(false);

  const pool = useMemo(
    () => (onlyCategories ? docs.filter((d) => onlyCategories.includes(d.category)) : docs),
    [docs, onlyCategories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool.filter((doc) => {
      if (category !== 'all' && doc.category !== category) return false;
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        (doc.description ?? '').toLowerCase().includes(q) ||
        (doc.document_versions ?? []).some((v) => v.file_name.toLowerCase().includes(q))
      );
    });
  }, [pool, query, category]);

  const grouped = useMemo(() => {
    const map = new Map<DocCategory, Doc[]>();
    for (const doc of filtered) {
      const list = map.get(doc.category) ?? [];
      list.push(doc);
      map.set(doc.category, list);
    }
    return docCategoryOrder
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, items: map.get(c) ?? [] }));
  }, [filtered]);

  const categories = useMemo(() => {
    const present = new Set(pool.map((d) => d.category));
    return docCategoryOrder.filter((c) => present.has(c));
  }, [pool]);

  const previewVersion = preview
    ? (preview.doc.document_versions ?? []).find((v) => v.id === preview.versionId) ?? null
    : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid flex-1 gap-3 sm:max-w-xl sm:grid-cols-[1fr_auto]">
          <Field label="Поиск по названию" htmlFor="doc-search">
            <Input
              id="doc-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Договор, эскиз, схема…"
            />
          </Field>
          <Field label="Категория" htmlFor="doc-category">
            <Select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'all' | DocCategory)}
            >
              <option value="all">Все</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {docCategoryLabel[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {staff ? (
          <Action variant="primary" onClick={() => setCreating(true)}>
            Добавить документ
          </Action>
        ) : null}
      </div>

      {grouped.length === 0 ? (
        <EmptyState title={`${heading}: пока пусто`}>
          {staff
            ? 'Добавьте первый документ — он появится у клиента только после публикации.'
            : 'Как только мы загрузим и опубликуем документы, они появятся здесь. Ничего спрашивать не нужно — всё будет в этом разделе.'}
        </EmptyState>
      ) : (
        grouped.map((group) => (
          <section key={group.category} className="grid gap-3">
            <h3 className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
              {docCategoryLabel[group.category]}
            </h3>
            <ul className="grid gap-3">
              {group.items.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  staff={staff}
                  onPreview={(versionId) => setPreview({ doc, versionId })}
                  onEdit={() => setEditing(doc)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <FileViewer
        version={previewVersion}
        title={preview?.doc.title ?? ''}
        onClose={() => setPreview(null)}
      />

      {staff ? (
        <>
          <CreateDocumentModal
            open={creating}
            projectId={projectId}
            onClose={() => setCreating(false)}
            reload={reload}
          />
          <ManageDocumentModal
            doc={editing}
            onClose={() => setEditing(null)}
            reload={reload}
          />
        </>
      ) : null}
    </div>
  );
}

function DocumentRow({
  doc,
  staff,
  onPreview,
  onEdit,
}: {
  doc: Doc;
  staff: boolean;
  onPreview: (versionId: string) => void;
  onEdit: () => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const current = currentVersion(doc);
  const history = (doc.document_versions ?? []).filter((v) => v.id !== current?.id);

  return (
    <Panel as="li" className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[1.125rem] leading-snug text-ink">{doc.title}</p>
          {doc.description ? (
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-stone">{doc.description}</p>
          ) : null}
          {current ? (
            <p className="mt-2 text-[0.8125rem] text-stone">
              Версия {current.version} · {current.file_name} · {formatSize(current.size_bytes)} ·{' '}
              {formatDateTime(current.created_at)}
            </p>
          ) : (
            <p className="mt-2 text-[0.8125rem] text-stone">Файл ещё не загружен</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={toneOf(doc.state)}>{docStateLabel[doc.state]}</Pill>
          {staff ? (
            <Pill tone={doc.is_published ? 'active' : 'neutral'}>
              {doc.is_published ? 'Виден клиенту' : 'Не опубликован'}
            </Pill>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {current ? (
          <>
            <Action size="sm" onClick={() => onPreview(current.id)}>
              Открыть
            </Action>
            <DownloadButton version={current} size="sm" variant="quiet" />
          </>
        ) : null}
        {history.length ? (
          <Action size="sm" variant="quiet" onClick={() => setHistoryOpen((v) => !v)}>
            {historyOpen ? 'Скрыть историю' : `История версий (${history.length})`}
          </Action>
        ) : null}
        {staff ? (
          <Action size="sm" variant="quiet" onClick={onEdit}>
            Управление
          </Action>
        ) : null}
      </div>

      {historyOpen && history.length ? (
        <ul className="grid gap-2 border-t border-line pt-3">
          {history.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[0.875rem] text-stone">
                Версия {v.version} · {formatDateTime(v.created_at)}
                {v.comment ? ` · ${v.comment}` : ''}
              </span>
              <span className="flex gap-2">
                <Action size="sm" variant="quiet" onClick={() => onPreview(v.id)}>
                  Посмотреть
                </Action>
                <DownloadButton version={v} size="sm" variant="quiet" />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

/* --------------------------- окна сотрудника --------------------------- */

function CreateDocumentModal({
  open,
  projectId,
  onClose,
  reload,
}: {
  open: boolean;
  projectId: string;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocCategory>('sketch');
  const [description, setDescription] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const [publish, setPublish] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!title.trim()) {
      setError('Название обязательно');
      return;
    }
    if (file) {
      const problem = validateFile(file);
      if (problem) {
        setError(problem);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const id = await createDocument({
        project_id: projectId,
        title: title.trim(),
        category,
        description: description.trim() || null,
        needs_approval: needsApproval,
      });
      if (file) await uploadVersion({ projectId, documentId: id, file });
      if (publish) await updateDocument(id, { is_published: true, state: needsApproval ? 'review' : 'draft' });
      await reload();
      setTitle('');
      setDescription('');
      setFile(null);
      onClose();
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Новый документ"
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action variant="primary" busy={busy} onClick={() => void save()}>
            Сохранить
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <LabeledInput
          label="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Эскиз кухни, вариант 1"
        />
        <LabeledSelect
          label="Категория"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocCategory)}
        >
          {docCategoryOrder.map((c) => (
            <option key={c} value={c}>
              {docCategoryLabel[c]}
            </option>
          ))}
        </LabeledSelect>
        <LabeledTextarea
          label="Описание для клиента"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Field label="Файл" htmlFor="doc-file" hint={`PDF, JPG, PNG, DOC, XLS. До ${MAX_FILE_MB} МБ`}>
          <Input
            id="doc-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.gif,.doc,.docx,.xls,.xlsx,.txt,.zip"
          />
        </Field>
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={needsApproval}
            onChange={(e) => setNeedsApproval(e.target.checked)}
            className="mt-1"
          />
          Требуется согласование клиентом
        </label>
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="mt-1" />
          Опубликовать сразу (клиент увидит документ)
        </label>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}

function ManageDocumentModal({
  doc,
  onClose,
  reload,
}: {
  doc: Doc | null;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!doc) return null;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={doc.title} wide>
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledSelect
            label="Состояние"
            value={doc.state}
            onChange={(e) =>
              void run(() => updateDocument(doc.id, { state: e.target.value as DocState }))
            }
          >
            {(['draft', 'review', 'approved', 'archived'] as DocState[]).map((s) => (
              <option key={s} value={s}>
                {docStateLabel[s]}
              </option>
            ))}
          </LabeledSelect>
          <LabeledSelect
            label="Категория"
            value={doc.category}
            onChange={(e) =>
              void run(() => updateDocument(doc.id, { category: e.target.value as DocCategory }))
            }
          >
            {docCategoryOrder.map((c) => (
              <option key={c} value={c}>
                {docCategoryLabel[c]}
              </option>
            ))}
          </LabeledSelect>
        </div>

        <div className="flex flex-wrap gap-2">
          <Action
            busy={busy}
            variant={doc.is_published ? 'outline' : 'primary'}
            onClick={() => void run(() => updateDocument(doc.id, { is_published: !doc.is_published }))}
          >
            {doc.is_published ? 'Снять с публикации' : 'Опубликовать клиенту'}
          </Action>
          <Action
            busy={busy}
            onClick={() => void run(() => updateDocument(doc.id, { needs_approval: !doc.needs_approval }))}
          >
            {doc.needs_approval ? 'Снять запрос согласования' : 'Запросить согласование'}
          </Action>
        </div>

        <div className="grid gap-4 border-t border-line pt-5">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Новая версия
          </p>
          <Field label="Файл" htmlFor="new-version-file" hint={`До ${MAX_FILE_MB} МБ`}>
            <Input
              id="new-version-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.gif,.doc,.docx,.xls,.xlsx,.txt,.zip"
            />
          </Field>
          <LabeledInput
            label="Что изменилось"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Передвинули розетки, поправили высоту верхних шкафов"
          />
          <Action
            variant="primary"
            busy={busy}
            disabled={!file}
            onClick={() =>
              void run(async () => {
                if (!file) return;
                await uploadVersion({
                  projectId: doc.project_id,
                  documentId: doc.id,
                  file,
                  comment: comment.trim() || null,
                });
                setFile(null);
                setComment('');
              })
            }
          >
            Загрузить версию
          </Action>
          <Notice>
            Прежние версии остаются в истории. Если версия уже согласована
            клиентом, подменить её файл нельзя — только выпустить новую.
          </Notice>
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <div className="border-t border-line pt-5">
          <Action
            variant="danger"
            busy={busy}
            onClick={() => {
              if (!window.confirm('Удалить документ вместе со всеми версиями и файлами?')) return;
              void run(async () => {
                await deleteDocument(doc);
                onClose();
              });
            }}
          >
            Удалить документ
          </Action>
        </div>
      </div>
    </Modal>
  );
}
