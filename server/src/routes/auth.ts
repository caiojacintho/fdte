import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword, signToken, authMiddleware } from '../auth.js';

export const authRoutes = new Hono();

function publicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    entity: user.entity,
    city: user.city,
    role: user.role,
    created_at: user.createdAt,
  };
}

// NOTE: `POST /register` and `PATCH /me` are intentionally not ported - both
// referenced a `cpf` column that never existed in the schema (dead/broken
// code), per AGENTS.md/D12. Hono's default 404 handler covers them.

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body ?? {};
  if (!email || !password) {
    return c.json({ error: 'Informe e-mail e senha.' }, 400);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ error: 'E-mail ou senha inválidos.' }, 401);
  }

  const token = signToken(user);
  return c.json({ token, user: publicUser(user) });
});

authRoutes.get('/me', authMiddleware, async (c) => {
  const auth = c.get('user');
  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user) return c.json({ error: 'Usuário não encontrado.' }, 404);
  return c.json({ user: publicUser(user) });
});

// Altera a senha do usuário autenticado (exige a senha atual).
authRoutes.patch('/password', authMiddleware, async (c) => {
  const auth = c.get('user');
  const body = await c.req.json().catch(() => ({}));
  const { currentPassword, newPassword } = body ?? {};

  if (!currentPassword || !newPassword) {
    return c.json({ error: 'Informe a senha atual e a nova senha.' }, 400);
  }
  if (newPassword.length < 6) {
    return c.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, 400);
  }

  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user) return c.json({ error: 'Usuário não encontrado.' }, 404);
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return c.json({ error: 'A senha atual está incorreta.' }, 401);
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(users.id, auth.sub));

  return c.json({ ok: true });
});
