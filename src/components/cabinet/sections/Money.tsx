'use client';

import { useMemo, useState } from 'react';
import { deleteCost, deletePayment, saveCost, savePayment } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { paymentStatusLabel, toneOf } from '@/lib/cabinet/labels';
import { formatDate, formatMoney } from '@/lib/cabinet/format';
import type { Cost, Payment, PaymentStatus } from '@/lib/cabinet/types';
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
 * СТОИМОСТЬ И ОПЛАТЫ
 * ==================
 * Все цифры вносит сотрудник руками — онлайн-оплат здесь нет.
 * Остаток считается только по тем строкам, которые внесены и
 * опубликованы; если ничего не внесено, так и написано.
 */

export function MoneySection({
  projectId,
  costs,
  payments,
  staff,
  reload,
}: {
  projectId: string;
  costs: Cost[];
  payments: Payment[];
  staff: boolean;
  reload: () => Promise<void>;
}) {
  const [editCost, setEditCost] = useState<Partial<Cost> | null>(null);
  const [editPayment, setEditPayment] = useState<Partial<Payment> | null>(null);

  const totals = useMemo(() => {
    const sum = costs.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const planned = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const paid = payments.reduce((acc, p) => acc + (Number(p.paid_amount) || 0), 0);
    return { sum, planned, paid, rest: Math.max(planned - paid, 0) };
  }, [costs, payments]);

  const empty = costs.length === 0 && payments.length === 0;

  return (
    <div className="grid gap-8">
      {empty ? (
        <EmptyState title="Финансовая часть ещё не заполнена">
          {staff
            ? 'Внесите позиции сметы и график платежей — клиент увидит только опубликованные строки.'
            : 'Здесь появятся состав комплектации, согласованная стоимость и график платежей. Пока мы ничего не вносили — значит, и показывать нечего.'}
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Panel>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                Согласованная стоимость
              </p>
              <p className="mt-2 font-display text-[1.5rem] text-ink">
                {costs.length ? formatMoney(totals.sum) : 'не внесена'}
              </p>
            </Panel>
            <Panel>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">Оплачено</p>
              <p className="mt-2 font-display text-[1.5rem] text-ink">
                {payments.length ? formatMoney(totals.paid) : '—'}
              </p>
            </Panel>
            <Panel>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                Остаток по графику
              </p>
              <p className="mt-2 font-display text-[1.5rem] text-ink">
                {payments.length ? formatMoney(totals.rest) : '—'}
              </p>
            </Panel>
          </div>

          <section className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-[1.25rem] text-ink">Состав и стоимость</h3>
              {staff ? (
                <Action size="sm" onClick={() => setEditCost({ project_id: projectId })}>
                  Добавить позицию
                </Action>
              ) : null}
            </div>
            {costs.length === 0 ? (
              <p className="text-[0.9375rem] text-stone">Позиции пока не внесены.</p>
            ) : (
              <ul className="grid divide-y divide-line border border-line">
                {costs.map((cost) => (
                  <li key={cost.id} className="flex flex-wrap items-center justify-between gap-3 bg-cream p-4">
                    <div className="min-w-0">
                      <p className="text-body text-ink">{cost.title}</p>
                      {cost.details ? (
                        <p className="mt-1 text-[0.8125rem] leading-snug text-stone">{cost.details}</p>
                      ) : null}
                      {staff && !cost.is_published ? (
                        <p className="mt-1 text-[0.75rem] uppercase tracking-[0.14em] text-stone">
                          не опубликовано
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[1.0625rem] text-ink">
                        {formatMoney(cost.amount, 'уточняется')}
                      </span>
                      {staff ? (
                        <Action size="sm" variant="quiet" onClick={() => setEditCost(cost)}>
                          Изменить
                        </Action>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-[1.25rem] text-ink">График платежей</h3>
              {staff ? (
                <Action size="sm" onClick={() => setEditPayment({ project_id: projectId })}>
                  Добавить платёж
                </Action>
              ) : null}
            </div>
            {payments.length === 0 ? (
              <p className="text-[0.9375rem] text-stone">График пока не составлен.</p>
            ) : (
              <ul className="grid gap-3">
                {payments.map((p) => (
                  <Panel as="li" key={p.id} className="grid gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-body text-ink">{p.title}</p>
                      <Pill tone={toneOf(p.status)}>{paymentStatusLabel[p.status]}</Pill>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[0.875rem] text-stone">
                      <span>Сумма: {formatMoney(p.amount, 'уточняется')}</span>
                      <span>Внесено: {formatMoney(p.paid_amount, '0 ₽')}</span>
                      <span>Срок: {p.due_on ? formatDate(p.due_on) : 'дата уточняется'}</span>
                      {p.paid_on ? <span>Оплачен: {formatDate(p.paid_on)}</span> : null}
                    </div>
                    {p.note ? <p className="text-[0.875rem] text-stone">{p.note}</p> : null}
                    {staff ? (
                      <div>
                        <Action size="sm" variant="quiet" onClick={() => setEditPayment(p)}>
                          Изменить
                        </Action>
                      </div>
                    ) : null}
                  </Panel>
                ))}
              </ul>
            )}
          </section>

          <Notice>
            Оплата принимается обычным способом — переводом или наличными при
            встрече. Онлайн-оплаты в кабинете нет: здесь только учёт того, что
            уже внесено, и подтверждающие документы.
          </Notice>
        </>
      )}

      {staff ? (
        <>
          <CostModal
            draft={editCost}
            onClose={() => setEditCost(null)}
            reload={reload}
          />
          <PaymentModal
            draft={editPayment}
            onClose={() => setEditPayment(null)}
            reload={reload}
          />
        </>
      ) : null}
    </div>
  );
}

function CostModal({
  draft,
  onClose,
  reload,
}: {
  draft: Partial<Cost> | null;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [state, setState] = useState<Partial<Cost> | null>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (draft && state !== draft && state?.id !== draft.id) setState(draft);
  if (!draft || !state) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={state.id ? 'Позиция сметы' : 'Новая позиция'}
      footer={
        <>
          {state.id ? (
            <Action
              variant="danger"
              onClick={() => {
                if (!window.confirm('Удалить позицию?')) return;
                void deleteCost(state.id as string).then(reload).then(onClose);
              }}
            >
              Удалить
            </Action>
          ) : null}
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!state.title?.trim()) {
                setError('Нужно название');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                await saveCost({
                  id: state.id,
                  project_id: state.project_id as string,
                  title: state.title.trim(),
                  details: state.details ?? null,
                  amount: state.amount ?? null,
                  position: state.position ?? 0,
                  is_published: state.is_published ?? true,
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
        <LabeledInput
          label="Название"
          value={state.title ?? ''}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          placeholder="Корпуса и фасады, доставка, сборка…"
        />
        <LabeledTextarea
          label="Пояснение"
          rows={2}
          value={state.details ?? ''}
          onChange={(e) => setState({ ...state, details: e.target.value })}
        />
        <LabeledInput
          label="Сумма, ₽"
          type="number"
          inputMode="numeric"
          value={state.amount ?? ''}
          onChange={(e) => setState({ ...state, amount: e.target.value ? Number(e.target.value) : null })}
          hint="Пусто — «уточняется»"
        />
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={state.is_published ?? true}
            onChange={(e) => setState({ ...state, is_published: e.target.checked })}
            className="mt-1"
          />
          Показывать клиенту
        </label>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}

function PaymentModal({
  draft,
  onClose,
  reload,
}: {
  draft: Partial<Payment> | null;
  onClose: () => void;
  reload: () => Promise<void>;
}) {
  const [state, setState] = useState<Partial<Payment> | null>(draft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (draft && state !== draft && state?.id !== draft.id) setState(draft);
  if (!draft || !state) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={state.id ? 'Платёж' : 'Новый платёж'}
      footer={
        <>
          {state.id ? (
            <Action
              variant="danger"
              onClick={() => {
                if (!window.confirm('Удалить запись о платеже?')) return;
                void deletePayment(state.id as string).then(reload).then(onClose);
              }}
            >
              Удалить
            </Action>
          ) : null}
          <Action onClick={onClose}>Отмена</Action>
          <Action
            variant="primary"
            busy={busy}
            onClick={async () => {
              if (!state.title?.trim()) {
                setError('Нужно название');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                await savePayment({
                  id: state.id,
                  project_id: state.project_id as string,
                  title: state.title.trim(),
                  amount: state.amount ?? null,
                  paid_amount: state.paid_amount ?? 0,
                  due_on: state.due_on || null,
                  paid_on: state.paid_on || null,
                  status: (state.status ?? 'planned') as PaymentStatus,
                  note: state.note ?? null,
                  position: state.position ?? 0,
                  is_published: state.is_published ?? true,
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
        <LabeledInput
          label="Название"
          value={state.title ?? ''}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          placeholder="Первый платёж 50%"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            label="Сумма, ₽"
            type="number"
            value={state.amount ?? ''}
            onChange={(e) => setState({ ...state, amount: e.target.value ? Number(e.target.value) : null })}
          />
          <LabeledInput
            label="Внесено, ₽"
            type="number"
            value={state.paid_amount ?? 0}
            onChange={(e) => setState({ ...state, paid_amount: Number(e.target.value || 0) })}
          />
          <LabeledInput
            label="Срок"
            type="date"
            value={state.due_on ?? ''}
            onChange={(e) => setState({ ...state, due_on: e.target.value })}
          />
          <LabeledInput
            label="Дата оплаты"
            type="date"
            value={state.paid_on ?? ''}
            onChange={(e) => setState({ ...state, paid_on: e.target.value })}
          />
        </div>
        <LabeledSelect
          label="Состояние"
          value={state.status ?? 'planned'}
          onChange={(e) => setState({ ...state, status: e.target.value as PaymentStatus })}
        >
          {(['planned', 'partial', 'paid'] as PaymentStatus[]).map((s) => (
            <option key={s} value={s}>
              {paymentStatusLabel[s]}
            </option>
          ))}
        </LabeledSelect>
        <LabeledInput
          label="Примечание"
          value={state.note ?? ''}
          onChange={(e) => setState({ ...state, note: e.target.value })}
        />
        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={state.is_published ?? true}
            onChange={(e) => setState({ ...state, is_published: e.target.checked })}
            className="mt-1"
          />
          Показывать клиенту
        </label>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </Modal>
  );
}
