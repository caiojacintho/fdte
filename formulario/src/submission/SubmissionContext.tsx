import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type SubmissionDTO } from '../api/client';

interface SubmissionContextValue {
  submission: SubmissionDTO | null;
  loading: boolean;
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
    setLoading(true);
    try {
      const { submission } = await api.getCurrentSubmission();
      setSubmission(submission);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    <SubmissionContext.Provider value={{ submission, loading, getCard, setCard, complete, refresh }}>
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error('useSubmission precisa estar dentro de SubmissionProvider');
  return ctx;
}
