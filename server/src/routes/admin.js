import { Router } from 'express';
import { db } from '../db.js';

export const adminRouter = Router();

adminRouter.get('/submissions', (req, res) => {
  const { entity, city, status } = req.query;

  let sql = `
    SELECT s.id, s.status, s.created_at, s.updated_at, s.completed_at,
           s.name, s.entity, s.city
    FROM submissions s
    WHERE 1=1
  `;
  const params = [];

  if (entity) {
    sql += ' AND s.entity LIKE ?';
    params.push(`%${entity}%`);
  }
  if (city) {
    sql += ' AND s.city LIKE ?';
    params.push(`%${city}%`);
  }
  if (status) {
    sql += ' AND s.status = ?';
    params.push(status);
  }
  sql += ' ORDER BY s.updated_at DESC';

  const rows = db.prepare(sql).all(...params);
  res.json({ submissions: rows });
});

adminRouter.get('/submissions/:id', (req, res) => {
  const submission = db
    .prepare(
      `SELECT id, status, created_at, updated_at, completed_at, name, entity, city
       FROM submissions
       WHERE id = ?`
    )
    .get(req.params.id);

  if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

  const placements = db
    .prepare('SELECT board, slot_key, card_id FROM placements WHERE submission_id = ?')
    .all(submission.id);

  res.json({ submission: { ...submission, placements } });
});

adminRouter.get('/export.csv', (req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id as submission_id, s.name, s.entity, s.city,
              s.status, s.created_at, s.completed_at,
              p.board, p.slot_key, p.card_id
       FROM submissions s
       LEFT JOIN placements p ON p.submission_id = s.id
       ORDER BY s.id`
    )
    .all();

  const header = 'submission_id,name,entity,city,status,created_at,completed_at,board,slot_key,card_id';
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.submission_id,
      r.name,
      r.entity,
      r.city,
      r.status,
      r.created_at,
      r.completed_at,
      r.board,
      r.slot_key,
      r.card_id,
    ]
      .map(escape)
      .join(',')
  );

  const csv = [header, ...lines].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="submissoes.csv"');
  res.send('﻿' + csv);
});

adminRouter.get('/stats', (req, res) => {
  const cardCounts = db
    .prepare(
      `SELECT board, card_id, COUNT(*) as total
       FROM placements
       GROUP BY board, card_id
       ORDER BY total DESC`
    )
    .all();

  const totals = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM submissions) as total_submissions,
         (SELECT COUNT(*) FROM submissions WHERE status = 'completed') as completed_submissions,
         (SELECT COUNT(DISTINCT city) FROM submissions WHERE city != '') as total_cities,
         (SELECT COUNT(DISTINCT entity) FROM submissions WHERE entity != '') as total_entities
      `
    )
    .get();

  res.json({ cardCounts, totals });
});
