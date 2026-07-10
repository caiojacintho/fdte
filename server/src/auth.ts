import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createMiddleware } from 'hono/factory';

// Dev-only fallback - same pattern as `server/src/db/index.ts`'s
// DATABASE_URL fallback. No dotenv anywhere else in this codebase.
const JWT_SECRET = process.env.JWT_SECRET || 'planehab-dev-secret-change-me';

// Minimal shape `signToken` needs from a `users` row. Deliberately not
// `typeof users.$inferSelect` so this module has no dependency on the
// Drizzle schema - callers (routes/auth.ts) pass the full row, which is a
// structural superset of this.
interface TokenSubject {
  id: number;
  role: string;
  name: string;
}

// Decoded JWT payload shape - kept minimal and stable. Do not change these
// three fields or the 30-day expiry below: the admin frontend's
// `AuthContext.tsx` and a later todo (#16, admin routes) depend on this
// exact contract.
export interface AuthTokenPayload {
  sub: number;
  role: string;
  name: string;
}

// Hono context-variable type carried by `authMiddleware`/`requireAdmin` -
// exported so a later router (e.g. todo #16's admin routes) can compose
// against the same `user` variable without redeclaring it.
export type AuthVariables = {
  user: AuthTokenPayload;
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derived] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derived, 'hex'), Buffer.from(check, 'hex'));
}

export function signToken(user: TokenSubject): string {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
}

// Reads the Bearer token from `Authorization`, verifies it, and stashes the
// decoded payload on the request context as `user` - Hono's `c.set`/`c.get`
// context-variable pattern, equivalent to Express's `req.user = ...`.
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const header = c.req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return c.json({ error: 'Token ausente.' }, 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Token inválido ou expirado.' }, 401);
  }
});

// Must run after `authMiddleware` in the chain (reads `user` off the
// context that `authMiddleware` sets).
export const requireAdmin = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get('user');
  if (user?.role !== 'admin') {
    return c.json({ error: 'Acesso restrito a administradores.' }, 403);
  }
  await next();
});
