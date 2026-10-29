'use client';

import { useState } from 'react';
import { addStage, removeStage, updateStage } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { stageStatusLabel, toneOf } from '@/lib/cabinet/labels';
import { formatDate } from '@/lib/cabinet/format';
import type { Stage, StageStatus } from '@/lib/cabinet/types';
import { Action, EmptyState, LabeledInput, Modal, Notice, Panel, Pill } from '../ui';

/**
 * ЭТАПЫ ПРОЕКТА
 * =============
 * Вертикальная шкала: где мы сейчас, что уже позади и чего ждём.
 * Выдуманных сроков тут нет — если плановой даты не существует,
 * так и написано «Дата уточняется».
 */

const STATUSES: StageStatus[] = [
  'not_started',
  'in_progress',
  'waiting_client',
  'waiting_supplier',
  'done',
  'paused',
];

export function StagesSection({
  projectId,
  stages,
  staff,
  reload,
}: {
  projectId: string;
  stages: Stage[];
  staff: boolean;
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<Stage | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (stages.length === 0) {
    return (
      <EmptyState title="Этапы ещё не заданы">
        {staff ? 'Добавьте этапы — клиент увидит их в виде шкалы.' : 'Шкала появится, как только мы начнём работу по проекту.'}
      </EmptyState>
    );
  }

  const done = stages.filter((s) => s.status === 'done').length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-ui text-stone">
          Пройдено {done} из {stages.length}
        </p>
        {staff ? (
          <Action size="sm" onClick={() => setAdding(true)}>
            Добавить этап
          </Action>
        ) : null}
      </div>

      <ol className="grid">
        {stages.map((stage, index) => {
          const last = index === stages.length - 1;
          const active = stage.status === 'in_progress' || stage.status === 'waiting_client';
          return (
            <li key={stage.id} className="relative grid grid-cols-[auto_1fr] gap-5 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center border text-caption font-semibold ${
                    stage.status === 'done'
                      ? 'border-ink bg-ink text-cream'
                      : active
                        ? 'border-ink text-ink'
                        : 'border-line text-stone'
                  }`}
                >
                  {index + 1}
                </span>
                {!last ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
              </div>

              <div className={`grid gap-2 ${active ? '' : 'opacity-95'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-display text-big leading-snug text-ink">{stage.name}</p>
                  <Pill tone={toneOf(stage.status)}>{stageStatusLabel[stage.status]}</Pill>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-small text-stone">
                  {stage.started_on ? <span>Начали: {formatDate(stage.started_on)}</span> : null}
                  <span>
                    План:{' '}
                    {stage.planned_on ? formatDate(stage.planned_on) : 'дата уточняется'}
                  </span>
                  {stage.completed_on ? <span>Завершили: {formatDate(stage.completed_on)}</span> : null}
                </div>

                {stage.client_comment ? (
                  <p className="border-l-2 border-line pl-3 text-ui leading-relaxed text-stone">
                    {stage.client_comment}
                  </p>
                ) : null}

                {staff && stage.internal_comment ? (
                  <p className="border-l-2 border-ink/40 bg-bone px-3 py-2 text-ui leading-relaxed text-ink">
                    Внутреннее: {stage.internal_comment}
                  </p>
                ) : null}

                {staff ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Action size="sm" variant="quiet" onClick={() => setEditing(stage)}>
                      Изменить
                    </Action>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {staff ? (
        <>
          <StageModal stage={editing} onClose={() => setEditing(null)} reload={reload} />
          <Modal
            open={adding}
            onClose={() => setAdding(false)}
            title="Новый этап"
            footer={
              <>
                <Action onClick={() => setAdding(false)}>Отмена</Action>
                <Action
                  variant="primary"
                  busy={busy}
                  onClick={async () => {
                    if (!newName.trim()) return;
                    setBusy(true);
                    setError(null);
                    try {
                      await addStage(projectId, newName.trim(), stages.length + 1);
                      await reload();
                      setNewName('');
                      setAdding(false);
                    } catch (e) {
                      setError(humanError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Добавить
                </Action>
              </>
            }
          >
            <LabeledInput
              label="Название этапа"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например: замер столешницы по месту"
            />
          </Modal>
        </>
      ) : null}
    </div>
  );
}

function StageModal({
  stage,
  onClose,
  reload,
}: {
  stage: Stage | null;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Stage | null>(stage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (stage && (!draft || draft.id !== stage.id)) setDraft(stage);
  if (!stage || !draft) return null;

  const set = (patch: Partial<Stage>) => setDraft({ ...draft, ...patch });

  return (
    <Modal
      open
      onClose={onClose}
      title={stage.name}
      footer={
        <>
          <Action
            variant="danger"
            onClick={() => {
              if (!window.confirm('Удалить этап?')) return;
              void (async () => {
                await removeStage(stage.id);
                await reload();
                onClose();
              })();
            }}
          >
            Удалить
          </Action>
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await updateStage(stage.id, {
                  name: draft.name,
                  status: draft.status,
                  started_on: draft.started_on || null,
                  planned_on: draft.planned_on || null,
                  completed_on: draft.completed_on || null,
                  client_comment: draft.client_comment || null,
                  internal_comment: draft.internal_comment || null,
                });
                await reload();
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
        <LabeledInput label="Название" value={draft.name} onChange={(e) => set({ name: e.target.value })} />

        <div className="grid gap-2">
          <label htmlFor="stage-status" className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Состояние
          </label>
          <select
            id="stage-status"
            value={draft.status}
            onChange={(e) => set({ status: e.target.value as StageStatus })}
            className="w-full rounded-none border border-line bg-bone px-4 py-3 text-body text-ink focus:border-ink focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {stageStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <LabeledInput
            label="Начали"
            type="date"
            value={draft.started_on ?? ''}
            onChange={(e) => set({ started_on: e.target.value })}
          />
          <LabeledInput
            label="План"
            type="date"
            value={draft.planned_on ?? ''}
            onChange={(e) => set({ planned_on: e.target.value })}
            hint="Пусто — «дата уточняется»"
          />
          <LabeledInput
            label="Завершили"
            type="date"
            value={draft.completed_on ?? ''}
            onChange={(e) => set({ completed_on: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="stage-client" className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Комментарий для клиента
          </label>
          <textarea
            id="stage-client"
            rows={3}
            value={draft.client_comment ?? ''}
            onChange={(e) => set({ client_comment: e.target.value })}
            className="w-full rounded-none border border-line bg-bone px-4 py-3 text-body text-ink focus:border-ink focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="stage-internal" className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
            Внутренний комментарий (клиент не увидит)
          </label>
          <textarea
            id="stage-internal"
            rows={2}
            value={draft.internal_comment ?? ''}
            onChange={(e) => set({ internal_comment: e.target.value })}
            className="w-full rounded-none border border-line bg-bone px-4 py-3 text-body text-ink focus:border-ink focus:outline-none"
          />
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
