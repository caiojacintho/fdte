const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('fdte_admin_token');
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
    throw new ApiError((data as any)?.error || 'Erro inesperado. Tente novamente.', res.status);
  }
  return data as T;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  entity: string;
  city: string;
  role: 'user' | 'admin';
}

export interface SubmissionListItem {
  id: number;
  status: 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  name: string;
  email: string;
  entity: string;
  city: string;
}

export interface PlacementDTO {
  board: string;
  slot_key: string;
  card_id: string;
}

export interface SubmissionDetail extends SubmissionListItem {
  placements: PlacementDTO[];
}

export interface CardCount {
  board: string;
  card_id: string;
  total: number;
}

export interface StatsDTO {
  cardCounts: CardCount[];
  totals: {
    total_submissions: number;
    completed_submissions: number;
    total_cities: number;
    total_entities: number;
  };
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: UserDTO }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  me: () => request<{ user: UserDTO }>('/api/auth/me'),

  listSubmissions: (params: { entity?: string; city?: string; status?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString();
    return request<{ submissions: SubmissionListItem[] }>(`/api/admin/submissions${query ? `?${query}` : ''}`);
  },

  getSubmission: (id: number) => request<{ submission: SubmissionDetail }>(`/api/admin/submissions/${id}`),

  getStats: () => request<StatsDTO>('/api/admin/stats'),

  async downloadExportCsv() {
    const token = localStorage.getItem('fdte_admin_token');
    const res = await fetch(`${API_URL}/api/admin/export.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError('Não foi possível exportar os dados.', res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissoes.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
