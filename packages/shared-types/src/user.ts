// Reconciled from admin/src/api/client.ts (admin is the only current consumer
// of user accounts/auth). No `cpf` field: the real `users` schema (Drizzle,
// planehab-hardening plan todo 10) never had one, and the only routes that
// referenced it (`POST /register`, `PATCH /me`) were dead/broken code, not
// ported (Wave 2b auth-route port, todo 13). See AGENTS.md.
export interface UserDTO {
  id: number;
  name: string;
  email: string;
  entity: string;
  city: string;
  role: 'user' | 'admin';
  created_at?: string;
}
