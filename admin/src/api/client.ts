import { getToken } from '../auth/token';
import type { UserDTO, SubmissionListItem, SubmissionDetail, BairroSubmission, StatsDTO } from '@fdte/shared-types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return {} as T;

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    throw new ApiError((data as { error?: string })?.error || 'Erro inesperado. Tente novamente.', res.status);
  }
  return data as T;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<{ user: UserDTO }>('/api/auth/me'),

  updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ ok: true }>('/api/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  listSubmissions: (params: { entity?: string; city?: string; status?: string } = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return request<{ submissions: SubmissionListItem[] }>(`/api/admin/submissions${query ? `?${query}` : ''}`);
  },

  getSubmission: (id: number) => request<{ submission: SubmissionDetail }>(`/api/admin/submissions/${id}`),

  getStats: () => request<StatsDTO>('/api/admin/stats'),

  listBairroSubmissions: () => request<{ submissions: BairroSubmission[] }>('/api/admin/bairro'),
};
