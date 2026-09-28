'use client';

import { useId, useState, type ReactNode } from 'react';
import { Checkbox, Input, TextArea } from './ui';
import { ImagePicker } from './ImagePicker';
import type { ImageRef } from '@/lib/content/types';

/**
 * Универсальный редактор списков.
 * Почти весь контент сайта — это списки: шаги процесса, преимущества,
 * вопросы, отзывы, материалы проекта. Вместо десятка почти одинаковых форм
 * здесь один компонент, которому описывают поля.
 *
 * Значение уезжает на сервер одним скрытым полем в виде JSON — так форма
 * остаётся обычной HTML-формой и работает через серверные действия.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'stringlist'
  | 'image';

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  rows?: number;
  /** Ширина поля в сетке из двух колонок */
  wide?: boolean;
  /** Вложенный список объектов */
  fields?: FieldDef[];
};

type Item = Record<string, unknown>;

function StringList({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      {value.map((line, i) => (
        <div key={i} className="flex gap-2">
          <TextArea
            rows={2}
            value={line}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            aria-label="Удалить пункт"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="shrink-0 self-start rounded-lg border border-line px-3 py-2 text-sm text-stone hover:border-red-300 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="justify-self-start rounded-full border border-line px-3.5 py-1.5 text-sm text-ink hover:border-ink/40"
      >
        + Добавить пункт
      </button>
    </div>
  );
}

function FieldControl({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (def.type) {
    case 'textarea':
      return (
        <TextArea
          rows={def.rows ?? 3}
          value={String(value ?? '')}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={String(value ?? '')}
          placeholder={def.placeholder}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          label={def.hint ?? 'Да'}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'stringlist':
      return (
        <StringList
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          placeholder={def.placeholder}
        />
      );
    case 'image':
      return (
        <ImagePicker
          label=""
          value={(value as ImageRef) ?? null}
          onChange={(img) => onChange(img)}
          hint={def.hint}
        />
      );
    default:
      return (
        <Input
          value={String(value ?? '')}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function ItemFields({
  fields,
  item,
  onPatch,
}: {
  fields: FieldDef[];
  item: Item;
  onPatch: (key: string, value: unknown) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((def) => {
        if (def.type === 'checkbox') {
          return (
            <div key={def.key} className="sm:col-span-2">
              <FieldControl
                def={def}
                value={item[def.key]}
                onChange={(v) => onPatch(def.key, v)}
              />
            </div>
          );
        }

        if (def.fields) {
          return (
            <div key={def.key} className="sm:col-span-2">
              <p className="mb-2 text-[0.8125rem] font-semibold text-ink">
                {def.label}
              </p>
              <NestedList
                fields={def.fields}
                value={Array.isArray(item[def.key]) ? (item[def.key] as Item[]) : []}
                onChange={(v) => onPatch(def.key, v)}
              />
            </div>
          );
        }

        const wide = def.wide || def.type === 'textarea' || def.type === 'stringlist';
        return (
          <div key={def.key} className={wide ? 'sm:col-span-2' : ''}>
            <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink">
              {def.label}
            </p>
            <FieldControl
              def={def}
              value={item[def.key]}
              onChange={(v) => onPatch(def.key, v)}
            />
            {def.hint && def.type !== 'image' ? (
              <p className="mt-1.5 text-xs text-stone">{def.hint}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function NestedList({
  fields,
  value,
  onChange,
}: {
  fields: FieldDef[];
  value: Item[];
  onChange: (v: Item[]) => void;
}) {
  return (
    <div className="grid gap-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-lg border border-line bg-bone/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone">
              {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="text-sm text-stone hover:text-red-700"
            >
              Удалить
            </button>
          </div>
          <ItemFields
            fields={fields}
            item={item}
            onPatch={(key, v) => {
              const next = [...value];
              next[i] = { ...next[i], [key]: v };
              onChange(next);
            }}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...value, Object.fromEntries(fields.map((f) => [f.key, '']))])
        }
        className="justify-self-start rounded-full border border-line px-3.5 py-1.5 text-sm text-ink hover:border-ink/40"
      >
        + Добавить
      </button>
    </div>
  );
}

export function ListEditor<T extends Item>({
  name,
  initial,
  fields,
  itemTitle,
  newItem,
  addLabel = 'Добавить',
  collapsible = true,
  emptyHint,
}: {
  name: string;
  initial: T[];
  fields: FieldDef[];
  itemTitle: (item: T, index: number) => string;
  newItem: () => T;
  addLabel?: string;
  collapsible?: boolean;
  emptyHint?: ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initial);
  const [open, setOpen] = useState<number | null>(collapsible ? null : -2);
  const baseId = useId();

  const patch = (index: number, key: string, value: unknown) =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? ({ ...it, [key]: value } as T) : it)),
    );

  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 && emptyHint ? (
        <p className="mb-4 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-stone">
          {emptyHint}
        </p>
      ) : null}

      <div className="grid gap-3">
        {items.map((item, i) => {
          const expanded = !collapsible || open === i;
          const panelId = `${baseId}-${i}`;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-line bg-bone/40"
            >
              <div className="flex items-center gap-2 px-4 py-3">
                {collapsible ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="text-xs font-bold text-stone">{i + 1}</span>
                    <span className="truncate text-[0.9375rem] font-medium text-ink">
                      {itemTitle(item, i) || 'Без названия'}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`ml-auto shrink-0 text-stone transition-transform ${expanded ? 'rotate-180' : ''}`}
                    >
                      ▾
                    </span>
                  </button>
                ) : (
                  <span className="flex-1 text-[0.9375rem] font-medium text-ink">
                    {itemTitle(item, i)}
                  </span>
                )}

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Поднять выше"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded px-2 py-1 text-stone hover:bg-ink/5 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Опустить ниже"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    className="rounded px-2 py-1 text-stone hover:bg-ink/5 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Удалить"
                    onClick={() => {
                      if (confirm('Удалить этот пункт?')) {
                        setItems((prev) => prev.filter((_, idx) => idx !== i));
                      }
                    }}
                    className="rounded px-2 py-1 text-stone hover:bg-red-50 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {expanded ? (
                <div id={panelId} className="border-t border-line bg-cream p-4 sm:p-5">
                  <ItemFields
                    fields={fields}
                    item={item}
                    onPatch={(key, v) => patch(i, key, v)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          setItems((prev) => [...prev, newItem()]);
          setOpen(items.length);
        }}
        className="mt-4 rounded-full border border-ink/25 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/60"
      >
        + {addLabel}
      </button>
    </div>
  );
}
