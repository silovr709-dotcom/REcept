'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchApprovals,
  fetchCosts,
  fetchDocuments,
  fetchMessages,
  fetchNotes,
  fetchPayments,
  fetchProject,
  fetchStages,
} from '@/lib/cabinet/api';
import { humanError } from '@/lib/cabinet/supabase';
import type {
  Approval,
  Cost,
  Doc,
  Message,
  Note,
  Payment,
  ProjectWithClient,
  Stage,
} from '@/lib/cabinet/types';

/**
 * Единая загрузка всего, что относится к проекту.
 * Запросы идут параллельно, ошибки прав выглядят как пустые списки —
 * решение всё равно принимает база, интерфейс лишь показывает результат.
 */
export function useProjectData(projectId: string | null, enabled: boolean) {
  const [project, setProject] = useState<ProjectWithClient | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId || !enabled) return;
    try {
      const [p, d, s, n, m, a, c, pay] = await Promise.all([
        fetchProject(projectId),
        fetchDocuments(projectId),
        fetchStages(projectId),
        fetchNotes(projectId),
        fetchMessages(projectId),
        fetchApprovals(projectId),
        fetchCosts(projectId),
        fetchPayments(projectId),
      ]);
      setProject(p);
      setDocs(d);
      setStages(s);
      setNotes(n);
      setMessages(m);
      setApprovals(a);
      setCosts(c);
      setPayments(pay);
      setError(null);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setLoading(false);
    }
  }, [projectId, enabled]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  return {
    project,
    docs,
    stages,
    notes,
    messages,
    approvals,
    costs,
    payments,
    loading,
    error,
    reload: load,
  };
}
