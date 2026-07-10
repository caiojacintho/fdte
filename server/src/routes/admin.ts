import { Hono } from 'hono';
import { and, asc, count, countDistinct, desc, eq, ilike, ne, type SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import { bairroSubmissions, placements, submissions } from '../db/schema.js';
import { authMiddleware, requireAdmin, type AuthVariables } from '../auth.js';

export const adminRoutes = new Hono<{ Variables: AuthVariables }>();

// Todo endpoint deste roteador exige um JWT de admin válido (ver server/src/auth.ts).
adminRoutes.use('*', authMiddleware, requireAdmin);

adminRoutes.get('/submissions', async (c) => {
  const entity = c.req.query('entity');
  const city = c.req.query('city');
  const status = c.req.query('status');

  // Postgres' LIKE is case-sensitive by default (unlike SQLite's), so `ilike`
  // is required here to preserve today's case-insensitive substring filter.
  const conditions: SQL[] = [];
  if (entity) conditions.push(ilike(submissions.entity, `%${entity}%`));
  if (city) conditions.push(ilike(submissions.city, `%${city}%`));
  if (status) conditions.push(eq(submissions.status, status));

  const rows = await db
    .select({
      id: submissions.id,
      status: submissions.status,
      created_at: submissions.createdAt,
      updated_at: submissions.updatedAt,
      completed_at: submissions.completedAt,
      name: submissions.name,
      entity: submissions.entity,
      city: submissions.city,
    })
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.updatedAt));

  return c.json({ submissions: rows });
});

adminRoutes.get('/submissions/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id)) {
    return c.json({ error: 'Submissão não encontrada.' }, 404);
  }

  const [submission] = await db
    .select({
      id: submissions.id,
      status: submissions.status,
      created_at: submissions.createdAt,
      updated_at: submissions.updatedAt,
      completed_at: submissions.completedAt,
      name: submissions.name,
      entity: submissions.entity,
      city: submissions.city,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);

  if (!submission) {
    return c.json({ error: 'Submissão não encontrada.' }, 404);
  }

  const placementRows = await db
    .select({
      board: placements.board,
      slot_key: placements.slotKey,
      card_id: placements.cardId,
    })
    .from(placements)
    .where(eq(placements.submissionId, id));

  return c.json({ submission: { ...submission, placements: placementRows } });
});

// Respostas do "Jogo do Bairro" (Etapa 2), para o painel casar cada uma com o
// grupo da sessão pelo código do link.
adminRoutes.get('/bairro', async (c) => {
  const rows = await db
    .select({
      code: bairroSubmissions.code,
      group_name: bairroSubmissions.groupName,
      board: bairroSubmissions.board,
      status: bairroSubmissions.status,
      placements: bairroSubmissions.placements,
      created_at: bairroSubmissions.createdAt,
      updated_at: bairroSubmissions.updatedAt,
      completed_at: bairroSubmissions.completedAt,
    })
    .from(bairroSubmissions)
    .orderBy(desc(bairroSubmissions.updatedAt));

  return c.json({ submissions: rows });
});

function csvEscape(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

adminRoutes.get('/export.csv', async (c) => {
  const rows = await db
    .select({
      submission_id: submissions.id,
      name: submissions.name,
      entity: submissions.entity,
      city: submissions.city,
      status: submissions.status,
      created_at: submissions.createdAt,
      completed_at: submissions.completedAt,
      board: placements.board,
      slot_key: placements.slotKey,
      card_id: placements.cardId,
    })
    .from(submissions)
    .leftJoin(placements, eq(placements.submissionId, submissions.id))
    .orderBy(asc(submissions.id));

  const header = 'submission_id,name,entity,city,status,created_at,completed_at,board,slot_key,card_id';
  const lines = rows.map((r) =>
    [r.submission_id, r.name, r.entity, r.city, r.status, r.created_at, r.completed_at, r.board, r.slot_key, r.card_id]
      .map(csvEscape)
      .join(',')
  );
  const csv = [header, ...lines].join('\n');

  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="submissoes.csv"');
  return c.body('\ufeff' + csv);
});

adminRoutes.get('/stats', async (c) => {
  // Reused in both the select list and orderBy so both sides refer to the
  // exact same `count(*)` aggregate expression.
  const total = count();
  const cardCounts = await db
    .select({
      board: placements.board,
      card_id: placements.cardId,
      total,
    })
    .from(placements)
    .groupBy(placements.board, placements.cardId)
    .orderBy(desc(total));

  const [totalRows, completedRows, citiesRows, entitiesRows] = await Promise.all([
    db.select({ value: count() }).from(submissions),
    db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'completed')),
    db
      .select({ value: countDistinct(submissions.city) })
      .from(submissions)
      .where(ne(submissions.city, '')),
    db
      .select({ value: countDistinct(submissions.entity) })
      .from(submissions)
      .where(ne(submissions.entity, '')),
  ]);

  return c.json({
    cardCounts,
    totals: {
      total_submissions: totalRows[0].value,
      completed_submissions: completedRows[0].value,
      total_cities: citiesRows[0].value,
      total_entities: entitiesRows[0].value,
    },
  });
});
