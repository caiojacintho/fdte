const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fdte_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Erro inesperado. Tente novamente.', res.status);
  }
  return data as T;
}

export const api = {
  register: (payload: { name: string; email: string; password: string; entity: string; city: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<{ user: UserDTO }>('/api/auth/me'),

  getCurrentSubmission: () => request<{ submission: SubmissionDTO }>('/api/submission/current'),

  savePlacement: (payload: { board: string; slotKey: string; cardId: string | null }) =>
    request<{ submission: SubmissionDTO }>('/api/submission/placements', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  completeSubmission: () =>
    request<{ submission: SubmissionDTO }>('/api/submission/complete', { method: 'POST' }),
};

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  entity: string;
  city: string;
  role: 'user' | 'admin';
}

export interface PlacementDTO {
  board: string;
  slot_key: string;
  card_id: string;
}

export interface SubmissionDTO {
  id: number;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  placements: PlacementDTO[];
}
