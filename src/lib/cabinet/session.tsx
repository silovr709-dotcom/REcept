'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, initSupabase } from './supabase';
import { fetchMyProjects, fetchNotifications, fetchProfile } from './api';
import type { Notification, Profile, ProjectWithClient } from './types';

/**
 * СОСТОЯНИЕ ВХОДА
 * ===============
 * Один провайдер на весь кабинет: кто вошёл, какая у него роль, какие
 * проекты ему доступны и сколько непрочитанных событий.
 *
 * Важно: роль читается из базы (таблица profiles), а не из токена и не
 * из localStorage. Подменить её в браузере бессмысленно — все запросы
 * всё равно проверяются политиками на сервере.
 */

type Status = 'loading' | 'unconfigured' | 'anonymous' | 'ready';

type CabinetState = {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  projects: ProjectWithClient[];
  notifications: Notification[];
  unread: number;
  isStaff: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  markRead: (ids: string[]) => void;
};

const Ctx = createContext<CabinetState | null>(null);

export function CabinetProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadUserData = useCallback(async (active: Session | null) => {
    if (!active?.user) {
      setProfile(null);
      setProjects([]);
      setNotifications([]);
      return;
    }
    try {
      const [p, list, notes] = await Promise.all([
        fetchProfile(active.user.id),
        fetchMyProjects(),
        fetchNotifications(),
      ]);
      if (!mounted.current) return;
      setProfile(p);
      setProjects(list);
      setNotifications(notes);
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные');
    }
  }, []);

  useEffect(() => {
    // Настройки лежат в отдельном файле и читаются только в браузере,
    // поэтому вся инициализация живёт в эффекте.
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const supabase = await initSupabase();
      if (cancelled) return;
      if (!supabase) {
        setStatus('unconfigured');
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      await loadUserData(data.session);
      if (!cancelled) setStatus(data.session ? 'ready' : 'anonymous');

      const { data: sub } = supabase.auth.onAuthStateChange(async (event, next) => {
        if (cancelled) return;
        setSession(next);
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProjects([]);
          setNotifications([]);
          setStatus('anonymous');
          return;
        }
        if (next) {
          await loadUserData(next);
          if (!cancelled) setStatus('ready');
        }
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [loadUserData]);

  const refresh = useCallback(async () => {
    await loadUserData(session);
  }, [loadUserData, session]);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
    setSession(null);
    setProfile(null);
    setProjects([]);
    setNotifications([]);
    setStatus('anonymous');
  }, []);

  const markRead = useCallback((ids: string[]) => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) && !n.read_at ? { ...n, read_at: now } : n)),
    );
  }, []);

  const value = useMemo<CabinetState>(
    () => ({
      status,
      session,
      profile,
      projects,
      notifications,
      unread: notifications.filter((n) => !n.read_at).length,
      isStaff: profile?.role === 'staff' || profile?.role === 'admin',
      error,
      refresh,
      signOut,
      markRead,
    }),
    [status, session, profile, projects, notifications, error, refresh, signOut, markRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCabinet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCabinet вызван вне CabinetProvider');
  return ctx;
}
