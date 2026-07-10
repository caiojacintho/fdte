import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth.js';
import { submissionRoutes } from './routes/submission.js';
import { bairroRoutes } from './routes/bairro.js';
import { adminRoutes } from './routes/admin.js';

const app = new Hono();
const PORT = Number(process.env.PORT) || 4000;

app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ ok: true }));

app.route('/api/auth', authRoutes);
app.route('/api/submission', submissionRoutes);
app.route('/api/bairro', bairroRoutes);
app.route('/api/admin', adminRoutes);

/**
 * Extracts a Postgres error code (e.g. '23505') from a thrown error, if
 * present. The `postgres` driver (and drizzle-orm/postgres-js on top of it)
 * surfaces the original Postgres error code on a `.code` string property of
 * the thrown `PostgresError` - duck-typed here instead of an `instanceof`
 * check so this bootstrap file doesn't need to import the driver directly.
 */
function getPostgresErrorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

app.onError((err, c) => {
  console.error(err);

  const pgCode = getPostgresErrorCode(err);
  if (pgCode === '23505') {
    // unique_violation - matches today's duplicate-code/email-exists 409 contracts.
    return c.json({ error: err.message }, 409);
  }
  if (pgCode === '23503') {
    // foreign_key_violation
    return c.json({ error: err.message }, 400);
  }

  return c.json({ error: 'Erro interno do servidor.' }, 500);
});

app.notFound((c) => c.json({ error: 'Não encontrado.' }, 404));

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`[server] API rodando em http://localhost:${info.port}`);
});
