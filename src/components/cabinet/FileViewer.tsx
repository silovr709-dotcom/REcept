'use client';

import { useEffect, useState } from 'react';
import { signedUrl } from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import { formatDateTime, formatSize, isImage, isPdf } from '@/lib/cabinet/format';
import type { DocumentVersion } from '@/lib/cabinet/types';
import { Action, Loading, Modal, Notice } from './ui';

/**
 * ПРОСМОТР ФАЙЛА
 * ==============
 * Ссылка на файл запрашивается в момент открытия и живёт пять минут.
 * Постоянных адресов у документов не существует: если кто-то перешлёт
 * ссылку, она протухнет, а без входа в кабинет она не работает вовсе.
 */

export function FileViewer({
  version,
  title,
  onClose,
}: {
  version: DocumentVersion | null;
  title: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(null);
    setError(null);
    if (!version) return;
    let cancelled = false;
    signedUrl(version.storage_path, 300)
      .then((link) => !cancelled && setUrl(link))
      .catch((e) => !cancelled && setError(humanError(e)));
    return () => {
      cancelled = true;
    };
  }, [version]);

  if (!version) return null;

  const image = isImage(version.mime_type, version.file_name);
  const pdf = isPdf(version.mime_type, version.file_name);

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`${title} — версия ${version.version}`}
      footer={
        <>
          <Action onClick={onClose}>Закрыть</Action>
          <DownloadButton version={version} variant="primary" />
        </>
      }
    >
      <div className="grid gap-4">
        <p className="text-[0.8125rem] text-stone">
          {version.file_name} · {formatSize(version.size_bytes)} · загружен{' '}
          {formatDateTime(version.created_at)}
        </p>
        {version.comment ? <Notice title="Комментарий к версии">{version.comment}</Notice> : null}

        {error ? <Notice tone="error">{error}</Notice> : null}
        {!url && !error ? <Loading label="Готовим файл…" /> : null}

        {url && image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`${title}, версия ${version.version}`}
            className="max-h-[70vh] w-full bg-bone object-contain"
          />
        ) : null}

        {url && pdf ? (
          <iframe
            src={url}
            title={`${title}, версия ${version.version}`}
            className="h-[70vh] w-full border border-line bg-bone"
          />
        ) : null}

        {url && !image && !pdf ? (
          <Notice>
            Этот тип файла в браузере не показывается — скачайте его кнопкой ниже.
          </Notice>
        ) : null}
      </div>
    </Modal>
  );
}

export function DownloadButton({
  version,
  variant = 'outline',
  size = 'md',
  label = 'Скачать',
}: {
  version: DocumentVersion;
  variant?: 'outline' | 'primary' | 'quiet';
  size?: 'sm' | 'md';
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Action
        variant={variant}
        size={size}
        busy={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const link = await signedUrl(version.storage_path, 120, version.file_name);
            window.open(link, '_blank', 'noopener');
          } catch (e) {
            setError(humanError(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {label}
      </Action>
      {error ? <span className="text-[0.8125rem] text-ink">{error}</span> : null}
    </>
  );
}
