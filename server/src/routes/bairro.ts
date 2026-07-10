import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bairroSubmissions } from '../db/schema.js';

export const bairroRoutes = new Hono();

// Mesma mensagem em ambos os handlers que podem recusar uma gravação em um
// código já encerrado - contrato inalterado do `bairro.js` original.
const ALREADY_SUBMITTED_ERROR = 'As respostas já foram enviadas. Este link foi encerrado.';

type BairroRow = typeof bairroSubmissions.$inferSelect;

// Serializa a linha do Drizzle (camelCase) no mesmo formato snake_case que o
// front (formulario2/src/api/client.ts) e `@fdte/shared-types`'s
// `BairroSubmission` sempre esperaram. `placements` já chega aqui como
// objeto (jsonb nativo) - nunca fazer JSON.parse/stringify manual dele.
function serialize(row: BairroRow | null | undefined) {
  if (!row) return null;
  return {
    code: row.code,
    group_name: row.groupName,
    board: row.board,
    status: row.status,
    placements: row.placements,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    completed_at: row.completedAt,
  };
}

// Estado atual de um código de grupo (null se ainda nada foi salvo).
bairroRoutes.get('/:code', async (c) => {
  const code = c.req.param('code');
  const [row] = await db.select().from(bairroSubmissions).where(eq(bairroSubmissions.code, code)).limit(1);
  return c.json({ submission: serialize(row) });
});

// Salva as cartas do painel (upsert). Cria o registro na primeira gravação.
// `INSERT ... ON CONFLICT (code) DO UPDATE ... setWhere status='in_progress'`
// substitui o antigo "ler, decidir, gravar" em passos separados (ver
// AGENTS.md "Concurrency-safe writes"): sob duas gravações concorrentes para
// o mesmo código novo, o Postgres serializa o INSERT/UPDATE atomicamente -
// nunca duas linhas, nunca um 500 de chave duplicada. Se a linha já estiver
// `completed`, o `setWhere` impede a atualização e `.returning()` volta
// vazio - sinal usado abaixo para manter o mesmo 409 de antes.
bairroRoutes.put('/:code/placements', async (c) => {
  const code = c.req.param('code');
  const body = await c.req.json().catch(() => ({}));
  const { placements = {}, group = '', board = 1 } = body ?? {};

  const [row] = await db
    .insert(bairroSubmissions)
    .values({ code, groupName: group, board, placements, status: 'in_progress' })
    .onConflictDoUpdate({
      target: bairroSubmissions.code,
      set: { groupName: group, board, placements, updatedAt: sql`now()` },
      setWhere: eq(bairroSubmissions.status, 'in_progress'),
    })
    .returning();

  if (!row) {
    return c.json({ error: ALREADY_SUBMITTED_ERROR }, 409);
  }

  return c.json({ submission: serialize(row) });
});

// Envia as respostas e encerra o link (status 'completed'). Mesma proteção
// de corrida do PUT acima, mas o `set` também fixa `status`/`completed_at`.
// Duas chamadas concorrentes de /submit contra o mesmo código já completado
// caem ambas no `setWhere` (nenhuma vê status='in_progress') e ambas recebem
// 409 - nunca duas confirmações, nunca um 500.
bairroRoutes.post('/:code/submit', async (c) => {
  const code = c.req.param('code');
  const body = await c.req.json().catch(() => ({}));
  const { placements = {}, group = '', board = 1 } = body ?? {};

  const [row] = await db
    .insert(bairroSubmissions)
    .values({ code, groupName: group, board, placements, status: 'completed', completedAt: sql`now()` })
    .onConflictDoUpdate({
      target: bairroSubmissions.code,
      set: {
        groupName: group,
        board,
        placements,
        status: 'completed',
        completedAt: sql`now()`,
        updatedAt: sql`now()`,
      },
      setWhere: eq(bairroSubmissions.status, 'in_progress'),
    })
    .returning();

  if (!row) {
    return c.json({ error: ALREADY_SUBMITTED_ERROR }, 409);
  }

  return c.json({ submission: serialize(row) });
});
