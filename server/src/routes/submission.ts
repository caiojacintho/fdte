import { Hono } from 'hono';
import type { Context } from 'hono';
import { randomUUID } from 'node:crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { placements, submissions } from '../db/schema.js';

export const submissionRoutes = new Hono();

// Mensagens de erro reutilizadas em mais de um handler - mesma string em
// todos os pontos que representam a mesma condição de negócio (token
// ausente/inválido, ou formulário já enviado), para consistência com o
// contrato que o front já conhece.
const SESSION_NOT_FOUND_ERROR = 'Sessão não encontrada. Recomece o preenchimento.';
const ALREADY_SUBMITTED_ERROR = 'Este formulário já foi enviado e não pode ser alterado.';

type SubmissionRow = typeof submissions.$inferSelect;

// Serializa a submissão + suas cartas no mesmo formato snake_case que o
// front (formulario/src/api/client.ts) sempre recebeu - o código antigo lia
// linhas cruas do SQLite (já snake_case) e as espalhava direto na resposta,
// então `token` viaja dentro do objeto `submission` mesmo não estando
// declarado em `SubmissionDTO` (@fdte/shared-types). Prioridade: bater
// exatamente com o JSON que o front já consome, não com a interface TS.
async function withPlacements(submission: SubmissionRow) {
  const rows = await db
    .select({ board: placements.board, slotKey: placements.slotKey, cardId: placements.cardId })
    .from(placements)
    .where(eq(placements.submissionId, submission.id));

  return {
    id: submission.id,
    token: submission.token,
    name: submission.name,
    city: submission.city,
    entity: submission.entity,
    status: submission.status,
    created_at: submission.createdAt,
    updated_at: submission.updatedAt,
    completed_at: submission.completedAt,
    session_id: submission.sessionId,
    placements: rows.map((p) => ({ board: p.board, slot_key: p.slotKey, card_id: p.cardId })),
  };
}

// Resolve a submissão atual a partir do token enviado no header. Retorna
// `null` quando o token está ausente ou é inválido - cada handler decide
// como responder (sempre 401, mas cada rota mantém seu próprio `c.json`
// para não acoplar o helper ao formato de resposta do Hono).
async function requireSubmission(c: Context): Promise<SubmissionRow | null> {
  const token = c.req.header('X-Submission-Token');
  if (!token) return null;
  const [submission] = await db.select().from(submissions).where(eq(submissions.token, token)).limit(1);
  return submission ?? null;
}

// Cria uma nova submissão anônima (tela inicial de identificação).
submissionRoutes.post('/start', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { name, city, entity } = body ?? {};
  if (!name?.trim() || !city?.trim() || !entity?.trim()) {
    return c.json({ error: 'Preencha nome, cidade e entidade.' }, 400);
  }

  const token = randomUUID();
  const [submission] = await db
    .insert(submissions)
    .values({ token, name: name.trim(), city: city.trim(), entity: entity.trim() })
    .returning();

  return c.json({ token, submission: await withPlacements(submission) }, 201);
});

submissionRoutes.get('/current', async (c) => {
  const submission = await requireSubmission(c);
  if (!submission) return c.json({ error: SESSION_NOT_FOUND_ERROR }, 401);
  return c.json({ submission: await withPlacements(submission) });
});

submissionRoutes.put('/placements', async (c) => {
  const submission = await requireSubmission(c);
  if (!submission) return c.json({ error: SESSION_NOT_FOUND_ERROR }, 401);

  const body = await c.req.json().catch(() => ({}));
  const { board, slotKey, cardId } = body ?? {};
  if (!board || !slotKey) {
    return c.json({ error: 'board e slotKey são obrigatórios.' }, 400);
  }
  // Checagem simples (leitura + decisão), sem proteção contra corrida -
  // deliberadamente inalterada do comportamento de hoje. Apenas /complete
  // recebe o UPDATE atômico (ver AGENTS.md "Concurrency-safe writes").
  if (submission.status !== 'in_progress') {
    return c.json({ error: ALREADY_SUBMITTED_ERROR }, 409);
  }

  if (cardId) {
    await db
      .insert(placements)
      .values({ submissionId: submission.id, board, slotKey, cardId })
      .onConflictDoUpdate({
        target: [placements.submissionId, placements.board, placements.slotKey],
        set: { cardId },
      });
  } else {
    await db
      .delete(placements)
      .where(
        and(eq(placements.submissionId, submission.id), eq(placements.board, board), eq(placements.slotKey, slotKey))
      );
  }

  // `sql`now()`` (banco) em vez de um timestamp gerado no processo Node,
  // para não divergir do `defaultNow()` usado nas demais colunas por
  // possível desvio de relógio entre app e banco.
  const [updated] = await db
    .update(submissions)
    .set({ updatedAt: sql`now()` })
    .where(eq(submissions.id, submission.id))
    .returning();

  return c.json({ submission: await withPlacements(updated) });
});

// Finaliza a submissão. UPDATE atômico condicionado a `status='in_progress'`
// (em vez do antigo "ler status, decidir, escrever" em passos separados):
// sob duas chamadas concorrentes para o mesmo token, só a primeira encontra
// uma linha para atualizar e recebe 200; a segunda encontra zero linhas
// (`.returning()` vazio) e recebe 409 - nunca duas confirmações, nunca um 500.
submissionRoutes.post('/complete', async (c) => {
  const submission = await requireSubmission(c);
  if (!submission) return c.json({ error: SESSION_NOT_FOUND_ERROR }, 401);

  const [updated] = await db
    .update(submissions)
    .set({ status: 'completed', completedAt: sql`now()`, updatedAt: sql`now()` })
    .where(and(eq(submissions.id, submission.id), eq(submissions.status, 'in_progress')))
    .returning();

  if (!updated) {
    return c.json({ error: ALREADY_SUBMITTED_ERROR }, 409);
  }

  return c.json({ submission: await withPlacements(updated) });
});
