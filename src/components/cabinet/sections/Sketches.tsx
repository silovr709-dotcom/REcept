'use client';

import { useEffect, useMemo, useState } from 'react';
import { currentVersion, recordDecision, signedUrl } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { docStateLabel, toneOf, visualCategories } from '@/lib/cabinet/labels';
import { formatDateTime, isImage, personName } from '@/lib/cabinet/format';
import type { Approval, Doc, DocumentVersion } from '@/lib/cabinet/types';
import { Action, EmptyState, LabeledTextarea, Modal, Notice, Panel, Pill } from '../ui';
import { DownloadButton, FileViewer } from '../FileViewer';

/**
 * ЭСКИЗЫ И СОГЛАСОВАНИЯ
 * =====================
 * Визуальная часть проекта отдельно от бумаг: крупные превью, версии,
 * сравнение вариантов и явное действие «согласовать эту версию».
 *
 * Согласование нарочно сделано двухшаговым: перед подтверждением
 * человек видит, какой именно документ и какую версию он подписывает.
 * Решение уходит в базу вместе с автором, датой и номером версии.
 */

export function SketchesSection({
  docs,
  approvals,
  staff,
  canApprove,
  reload,
}: {
  docs: Doc[];
  approvals: Approval[];
  staff: boolean;
  canApprove: boolean;
  reload: () => Promise<void>;
}) {
  const visual = useMemo(
    () => docs.filter((d) => visualCategories.includes(d.category)),
    [docs],
  );
  const [preview, setPreview] = useState<{ doc: Doc; version: DocumentVersion } | null>(null);
  const [decision, setDecision] = useState<{
    doc: Doc;
    version: DocumentVersion;
    kind: 'approved' | 'changes_requested';
  } | null>(null);
  const [compare, setCompare] = useState<Doc | null>(null);

  if (visual.length === 0) {
    return (
      <EmptyState title="Эскизов пока нет">
        {staff
          ? 'Загрузите эскиз, чертёж или схему — они автоматически попадут в этот раздел.'
          : 'Здесь появятся эскизы, чертежи и схемы. Каждый вариант можно будет открыть, сравнить с прежним и согласовать.'}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-6">
      <Notice>
        Согласование эскиза фиксирует внешний вид и состав. Оно не заменяет
        договор или дополнительное соглашение, если изменение влияет на
        стоимость или сроки — такие правки мы оформляем отдельно.
      </Notice>

      <div className="grid gap-6 sm:grid-cols-2">
        {visual.map((doc) => {
          const version = currentVersion(doc);
          const docApprovals = approvals.filter((a) => a.document_id === doc.id);
          const approvedHere = docApprovals.find(
            (a) => a.decision === 'approved' && a.version_id === version?.id,
          );
          const versions = doc.document_versions ?? [];

          return (
            <Panel key={doc.id} className="grid content-start gap-4">
              {version ? (
                <SketchPreview
                  version={version}
                  title={doc.title}
                  onOpen={() => setPreview({ doc, version })}
                />
              ) : null}

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[1.125rem] leading-snug text-ink">{doc.title}</p>
                  <p className="mt-1 text-[0.8125rem] text-stone">
                    {version ? `Версия ${version.version} · ${formatDateTime(version.created_at)}` : 'Файл не загружен'}
                  </p>
                </div>
                <Pill tone={toneOf(doc.state)}>{docStateLabel[doc.state]}</Pill>
              </div>

              {doc.description ? (
                <p className="text-[0.9375rem] leading-relaxed text-stone">{doc.description}</p>
              ) : null}

              {version?.comment ? (
                <p className="border-l-2 border-line pl-3 text-[0.9375rem] leading-relaxed text-stone">
                  {version.comment}
                </p>
              ) : null}

              {approvedHere ? (
                <Notice title="Вариант согласован">
                  {personName(approvedHere.profiles, 'Клиент')} ·{' '}
                  {formatDateTime(approvedHere.created_at)}
                  {approvedHere.comment ? ` · ${approvedHere.comment}` : ''}
                </Notice>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {version ? (
                  <>
                    <Action size="sm" onClick={() => setPreview({ doc, version })}>
                      Открыть крупно
                    </Action>
                    <DownloadButton version={version} size="sm" variant="quiet" />
                  </>
                ) : null}
                {versions.length > 1 ? (
                  <Action size="sm" variant="quiet" onClick={() => setCompare(doc)}>
                    Сравнить версии ({versions.length})
                  </Action>
                ) : null}
              </div>

              {version && !approvedHere && (canApprove || staff) ? (
                <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                  <Action
                    size="sm"
                    variant="primary"
                    onClick={() => setDecision({ doc, version, kind: 'approved' })}
                  >
                    Согласовать вариант
                  </Action>
                  <Action
                    size="sm"
                    onClick={() => setDecision({ doc, version, kind: 'changes_requested' })}
                  >
                    Нужны изменения
                  </Action>
                </div>
              ) : null}

              {docApprovals.length ? (
                <details className="border-t border-line pt-3">
                  <summary className="cursor-pointer text-[0.8125rem] text-stone">
                    История решений ({docApprovals.length})
                  </summary>
                  <ul className="mt-3 grid gap-2">
                    {docApprovals.map((a) => {
                      const v = versions.find((x) => x.id === a.version_id);
                      return (
                        <li key={a.id} className="text-[0.8125rem] leading-snug text-stone">
                          {a.decision === 'approved' ? 'Согласовано' : 'Запрошены изменения'} ·
                          версия {v?.version ?? '—'} · {formatDateTime(a.created_at)} ·{' '}
                          {personName(a.profiles, 'Клиент')}
                          {a.comment ? ` · «${a.comment}»` : ''}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <FileViewer
        version={preview?.version ?? null}
        title={preview?.doc.title ?? ''}
        onClose={() => setPreview(null)}
      />

      <CompareModal doc={compare} onClose={() => setCompare(null)} />

      <DecisionModal
        state={decision}
        onClose={() => setDecision(null)}
        reload={reload}
      />
    </div>
  );
}

/** Превью: для картинок — сам файл, для PDF — аккуратная заглушка. */
function SketchPreview({
  version,
  title,
  onOpen,
}: {
  version: DocumentVersion;
  title: string;
  onOpen: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const image = isImage(version.mime_type, version.file_name);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    signedUrl(version.storage_path, 600)
      .then((link) => !cancelled && setUrl(link))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [version.storage_path, image]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-[4/3] w-full overflow-hidden bg-sand"
      aria-label={`Открыть «${title}» крупно`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${title}, версия ${version.version}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
          {image ? 'Загружаем…' : version.file_name.split('.').pop()?.toUpperCase()}
        </span>
      )}
    </button>
  );
}

function CompareModal({ doc, onClose }: { doc: Doc | null; onClose: () => void }) {
  const versions = doc?.document_versions ?? [];
  const [left, setLeft] = useState<string>('');
  const [right, setRight] = useState<string>('');

  useEffect(() => {
    if (!doc) return;
    const list = doc.document_versions ?? [];
    setLeft(list[0]?.id ?? '');
    setRight(list[1]?.id ?? list[0]?.id ?? '');
  }, [doc]);

  if (!doc) return null;

  const pick = (id: string) => versions.find((v) => v.id === id) ?? null;

  return (
    <Modal open onClose={onClose} wide title={`Сравнение версий — ${doc.title}`}>
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { value: left, set: setLeft, label: 'Слева' },
          { value: right, set: setRight, label: 'Справа' },
        ].map((side, i) => {
          const version = pick(side.value);
          const id = `compare-${i}`;
          return (
            <div key={side.label} className="grid gap-3">
              <label
                htmlFor={id}
                className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone"
              >
                {side.label}
              </label>
              <select
                id={id}
                value={side.value}
                onChange={(e) => side.set(e.target.value)}
                className="w-full rounded-none border border-line bg-bone px-3 py-2 text-[0.9375rem] text-ink focus:border-ink focus:outline-none"
              >
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    Версия {v.version} — {formatDateTime(v.created_at)}
                  </option>
                ))}
              </select>
              {version ? (
                <>
                  <SketchPreview version={version} title={doc.title} onOpen={() => undefined} />
                  {version.comment ? (
                    <p className="text-[0.8125rem] leading-snug text-stone">{version.comment}</p>
                  ) : null}
                  <DownloadButton version={version} size="sm" variant="quiet" />
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function DecisionModal({
  state,
  onClose,
  reload,
}: {
  state: { doc: Doc; version: DocumentVersion; kind: 'approved' | 'changes_requested' } | null;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setComment('');
    setError(null);
  }, [state]);

  if (!state) return null;
  const approving = state.kind === 'approved';

  return (
    <Modal
      open
      onClose={onClose}
      title={approving ? 'Подтверждение согласования' : 'Запрос изменений'}
      footer={
        <>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!approving && !comment.trim()) {
                setError('Напишите, что нужно изменить — иначе мы не поймём задачу');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                await recordDecision(state.version.id, state.kind, comment.trim() || undefined);
                await reload();
                onClose();
              } catch (e) {
                setError(humanError(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {approving ? 'Да, согласовываю' : 'Отправить запрос'}
          </Action>
        </>
      }
    >
      <div className="grid gap-5">
        <div className="border border-line bg-bone p-4">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Вы подтверждаете
          </p>
          <p className="mt-2 font-display text-[1.125rem] text-ink">{state.doc.title}</p>
          <p className="mt-1 text-[0.875rem] text-stone">
            Версия {state.version.version} · файл {state.version.file_name} · загружен{' '}
            {formatDateTime(state.version.created_at)}
          </p>
        </div>

        <LabeledTextarea
          label={approving ? 'Комментарий (необязательно)' : 'Что изменить'}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            approving
              ? 'Например: согласовано, цвет фасадов оставляем как на эскизе'
              : 'Например: перенести две розетки правее, верхние шкафы сделать выше на 100 мм'
          }
        />

        {approving ? (
          <Notice>
            Решение сохранится с вашим именем, датой и номером версии. Если
            после этого мы загрузим новую версию, её нужно будет согласовать
            отдельно — подменить уже согласованный вариант нельзя.
          </Notice>
        ) : null}

        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
