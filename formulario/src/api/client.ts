import type { SubmissionDTO } from '@fdte/shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Token da submissão anônima atual (gerado ao preencher a tela de identificação).
export const SUBMISSION_TOKEN_KEY = 'fdte_submission_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(SUBMISSION_TOKEN_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['X-Submission-Token'] = token;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Erro inesperado. Tente novamente.', res.status);
  }
  return data as T;
}

export const api = {
  startSubmission: (payload: { name: string; city: string; entity: string }) =>
    request<{ token: string; submission: SubmissionDTO }>('/api/submission/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentSubmission: () => request<{ submission: SubmissionDTO }>('/api/submission/current'),

  savePlacement: (payload: { board: string; slotKey: string; cardId: string | null }) =>
    request<{ submission: SubmissionDTO }>('/api/submission/placements', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  completeSubmission: () => request<{ submission: SubmissionDTO }>('/api/submission/complete', { method: 'POST' }),
};
