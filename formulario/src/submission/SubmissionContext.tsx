import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError, SUBMISSION_TOKEN_KEY } from '../api/client';
import type { SubmissionDTO } from '@fdte/shared-types';

interface SubmissionContextValue {
  submission: SubmissionDTO | null;
  loading: boolean;
  start: (identity: { name: string; city: string; entity: string }) => Promise<void>;
  getCard: (board: string, slotKey: string) => string | null;
  setCard: (board: string, slotKey: string, cardId: string | null) => Promise<void>;
  complete: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem(SUBMISSION_TOKEN_KEY);
    if (!token) {
      setSubmission(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { submission } = await api.getCurrentSubmission();
      setSubmission(submission);
    } catch (err) {
      // Token inválido/expirado: limpa a sessão para voltar à identificação.
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem(SUBMISSION_TOKEN_KEY);
        setSubmission(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const start = useCallback(async (identity: { name: string; city: string; entity: string }) => {
    const { token, submission } = await api.startSubmission(identity);
    localStorage.setItem(SUBMISSION_TOKEN_KEY, token);
    setSubmission(submission);
  }, []);

  const getCard = useCallback(
    (board: string, slotKey: string) => {
      const placement = submission?.placements.find((p) => p.board === board && p.slot_key === slotKey);
      return placement?.card_id ?? null;
    },
    [submission]
  );

  const setCard = useCallback(async (board: string, slotKey: string, cardId: string | null) => {
    const { submission } = await api.savePlacement({ board, slotKey, cardId });
    setSubmission(submission);
  }, []);

  const complete = useCallback(async () => {
    const { submission } = await api.completeSubmission();
    setSubmission(submission);
  }, []);

  return (
    <SubmissionContext.Provider value={{ submission, loading, start, getCard, setCard, complete, refresh }}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error('useSubmission precisa estar dentro de SubmissionProvider');
  return ctx;
}
