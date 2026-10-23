'use client';

import { useMemo, useState } from 'react';
import { sendMessage, setMessageStatus } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { messageStatusLabel, toneOf } from '@/lib/cabinet/labels';
import { formatDateTime, personName } from '@/lib/cabinet/format';
import type { Doc, Message } from '@/lib/cabinet/types';
import { Action, EmptyState, LabeledSelect, LabeledTextarea, Notice, Panel, Pill } from '../ui';

/**
 * ВОПРОСЫ ПО ПРОЕКТУ
 * ==================
 * Не мессенджер, а именно обращения: вопрос — ответ — отметка «решено».
 * Если вопрос задан из карточки документа, он к ней и привязывается,
 * чтобы потом не выяснять, о каком эскизе шла речь.
 */

export function MessagesSection({
  projectId,
  messages,
  docs,
  staff,
  authorId,
  reload,
  presetDocumentId,
}: {
  projectId: string;
  messages: Message[];
  docs: Doc[];
  staff: boolean;
  authorId: string;
  reload: () => Promise<void>;
  presetDocumentId?: string | null;
}) {
  const [body, setBody] = useState('');
  const [docId, setDocId] = useState<string>(presetDocumentId ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const threads = useMemo(() => {
    const roots = messages.filter((m) => !m.parent_id);
    return roots
      .map((root) => ({
        root,
        replies: messages.filter((m) => m.parent_id === root.id),
      }))
      .reverse();
  }, [messages]);

  async function submit() {
    if (!body.trim()) {
      setError('Напишите вопрос');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendMessage({
        project_id: projectId,
        body: body.trim(),
        author_id: authorId,
        from_staff: staff,
        parent_id: replyTo?.id ?? null,
        document_id: docId || null,
      });
      setBody('');
      setReplyTo(null);
      await reload();
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8">
      <Panel className="grid gap-5">
        <div>
          <p className="font-display text-[1.125rem] text-ink">
            {replyTo ? 'Ответ на обращение' : staff ? 'Написать клиенту' : 'Задать вопрос по проекту'}
          </p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-stone">
            {staff
              ? 'Сообщение появится у клиента в кабинете.'
              : 'Вопрос придёт Роберту и Кате. Отвечаем в рабочее время — ответ появится здесь же, в кабинете.'}
          </p>
        </div>

        {replyTo ? (
          <Notice title="Отвечаем на">
            {replyTo.body.slice(0, 200)}
            <div className="mt-2">
              <Action size="sm" variant="quiet" onClick={() => setReplyTo(null)}>
                Отменить ответ
              </Action>
            </div>
          </Notice>
        ) : null}

        <LabeledTextarea
          label="Сообщение"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder={
            staff
              ? 'Напишем, что сделали и чего ждём'
              : 'Например: можно ли заменить ручки на профиль, и как это повлияет на срок?'
          }
        />

        {docs.length > 0 && !replyTo ? (
          <LabeledSelect
            label="Привязать к документу (необязательно)"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          >
            <option value="">Без привязки</option>
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </LabeledSelect>
        ) : null}

        {error ? <Notice tone="error">{error}</Notice> : null}

        <div>
          <Action variant="primary" busy={busy} onClick={() => void submit()}>
            Отправить
          </Action>
        </div>
      </Panel>

      {threads.length === 0 ? (
        <EmptyState title="Обращений пока не было">
          Любой вопрос по проекту лучше задавать здесь: он останется в истории
          вместе с ответом.
        </EmptyState>
      ) : (
        <ul className="grid gap-4">
          {threads.map(({ root, replies }) => {
            const linked = docs.find((d) => d.id === root.document_id);
            return (
              <Panel as="li" key={root.id} className="grid gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-stone">
                      {root.from_staff ? 'Сообщение «РЕцепт»' : 'Вопрос клиента'} ·{' '}
                      {formatDateTime(root.created_at)}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-body leading-relaxed text-ink">{root.body}</p>
                    {linked ? (
                      <p className="mt-2 text-[0.8125rem] text-stone">К документу: {linked.title}</p>
                    ) : null}
                    <p className="mt-2 text-[0.8125rem] text-stone">{personName(root.profiles, 'Клиент')}</p>
                  </div>
                  <Pill tone={toneOf(root.status)}>{messageStatusLabel[root.status]}</Pill>
                </div>

                {replies.length ? (
                  <ul className="grid gap-3 border-l-2 border-line pl-4">
                    {replies.map((r) => (
                      <li key={r.id}>
                        <p className="text-[0.8125rem] text-stone">
                          {r.from_staff ? 'Ответ «РЕцепт»' : 'Клиент'} · {formatDateTime(r.created_at)}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink">
                          {r.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Action size="sm" variant="quiet" onClick={() => setReplyTo(root)}>
                    Ответить
                  </Action>
                  {staff ? (
                    <>
                      <Action
                        size="sm"
                        variant="quiet"
                        onClick={() => void setMessageStatus(root.id, 'closed').then(reload)}
                      >
                        Отметить решённым
                      </Action>
                      {root.status === 'closed' ? (
                        <Action
                          size="sm"
                          variant="quiet"
                          onClick={() => void setMessageStatus(root.id, 'open').then(reload)}
                        >
                          Вернуть в работу
                        </Action>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </Panel>
            );
          })}
        </ul>
      )}
    </div>
  );
}
