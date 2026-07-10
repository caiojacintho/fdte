import type { BairroSubmission, SubmitPayload } from '@fdte/shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || 'Erro inesperado. Tente novamente.', res.status);
  }
  return data as T;
}

export const api = {
  getBairro: (code: string) =>
    request<{ submission: BairroSubmission | null }>(`/api/bairro/${encodeURIComponent(code)}`),

  submitBairro: (code: string, payload: SubmitPayload) =>
    request<{ submission: BairroSubmission }>(`/api/bairro/${encodeURIComponent(code)}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
