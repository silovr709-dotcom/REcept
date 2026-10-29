'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useCabinet } from '@/lib/cabinet/session';
import { AuthScreen } from './AuthScreen';
import { NotConfigured } from './CabinetShell';
import { DashboardScreen } from './DashboardScreen';
import { ProjectScreen } from './ProjectScreen';
import { EmptyState, Loading } from './ui';

/**
 * Панель сотрудников подгружается отдельным файлом и только тогда, когда
 * её действительно открывают. Заказчику незачем скачивать рабочий
 * инструмент мастерской ради просмотра своего проекта.
 */
const AdminScreen = dynamic(() => import('./AdminScreen').then((m) => m.AdminScreen), {
  loading: () => <Loading />,
});
const AdminClientScreen = dynamic(
  () => import('./AdminClientScreen').then((m) => m.AdminClientScreen),
  { loading: () => <Loading /> },
);
const AdminProjectScreen = dynamic(
  () => import('./AdminProjectScreen').then((m) => m.AdminProjectScreen),
  { loading: () => <Loading /> },
);

/**
 * ТОЧКИ ВХОДА МАРШРУТОВ
 * =====================
 * Сайт собирается статически, поэтому идентификаторы ездят в адресной
 * строке параметром (?id=...), а не отдельным сегментом пути. Читаем их
 * после монтирования: на сервере этих данных просто нет.
 */

/** Общая калитка: пока не вошли — показываем форму входа, а не пустоту. */
function Gate({ children }: { children: ReactNode }) {
  const { status } = useCabinet();
  if (status === 'loading') return <Loading />;
  if (status === 'unconfigured') return <NotConfigured />;
  if (status === 'anonymous') return <AuthScreen />;
  return <>{children}</>;
}

/** Параметр адресной строки, прочитанный уже в браузере. */
function useQueryParam(name: string) {
  const [value, setValue] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get(name));
  }, [name]);
  return value;
}

function MissingId({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <EmptyState
      title="Не указано, что открыть"
      action={
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center justify-center border border-ink/25 px-5 py-2.5 text-caption font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          {backLabel}
        </Link>
      }
    >
      Похоже, ссылка потеряла часть адреса. Вернитесь к списку и откройте
      нужную карточку заново.
    </EmptyState>
  );
}

export function HomeRoute() {
  return (
    <Gate>
      <DashboardScreen />
    </Gate>
  );
}

export function SignInRoute() {
  const { status } = useCabinet();
  if (status === 'unconfigured') return <NotConfigured />;
  return <AuthScreen initialMode="signin" />;
}

export function PasswordRoute() {
  const { status } = useCabinet();
  if (status === 'unconfigured') return <NotConfigured />;
  return <AuthScreen initialMode="reset" />;
}

export function ProjectRoute() {
  const id = useQueryParam('id');
  return (
    <Gate>
      {id === undefined ? (
        <Loading />
      ) : id ? (
        <ProjectScreen projectId={id} />
      ) : (
        <MissingId backHref="/kabinet" backLabel="Мои проекты" />
      )}
    </Gate>
  );
}

export function AdminRoute() {
  return (
    <Gate>
      <AdminScreen />
    </Gate>
  );
}

export function AdminClientRoute() {
  const id = useQueryParam('id');
  return (
    <Gate>
      {id === undefined ? (
        <Loading />
      ) : id ? (
        <AdminClientScreen clientId={id} />
      ) : (
        <MissingId backHref="/kabinet/admin" backLabel="Панель" />
      )}
    </Gate>
  );
}

export function AdminProjectRoute() {
  const id = useQueryParam('id');
  return (
    <Gate>
      {id === undefined ? (
        <Loading />
      ) : id ? (
        <AdminProjectScreen projectId={id} />
      ) : (
        <MissingId backHref="/kabinet/admin" backLabel="Панель" />
      )}
    </Gate>
  );
}
