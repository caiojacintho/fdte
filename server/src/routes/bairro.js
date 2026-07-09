import { Router } from 'express';
import { db } from '../db.js';

export const bairroRouter = Router();

function getByCode(code) {
  return db.prepare('SELECT * FROM bairro_submissions WHERE code = ?').get(code);
}

function serialize(row) {
  if (!row) return null;
  let placements = {};
  try {
    placements = JSON.parse(row.placements || '{}');
  } catch {
    placements = {};
  }
  return {
    code: row.code,
    group_name: row.group_name,
    board: row.board,
    status: row.status,
    placements,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
  };
}

// Estado atual de um código de grupo (null se ainda nada foi salvo).
bairroRouter.get('/:code', (req, res) => {
  res.json({ submission: serialize(getByCode(req.params.code)) });
});

// Salva as cartas do painel (upsert). Cria o registro na primeira gravação.
bairroRouter.put('/:code/placements', (req, res) => {
  const { code } = req.params;
  const { placements = {}, group = '', board = 1 } = req.body || {};
  const existing = getByCode(code);
  if (existing && existing.status === 'completed') {
    return res.status(409).json({ error: 'As respostas já foram enviadas. Este link foi encerrado.' });
  }
  const json = JSON.stringify(placements || {});
  if (existing) {
    db.prepare(
      `UPDATE bairro_submissions SET placements = ?, group_name = ?, board = ?, updated_at = datetime('now') WHERE code = ?`
    ).run(json, group, board, code);
  } else {
    db.prepare(
      `INSERT INTO bairro_submissions (code, group_name, board, placements) VALUES (?, ?, ?, ?)`
    ).run(code, group, board, json);
  }
  res.json({ submission: serialize(getByCode(code)) });
});

// Envia as respostas e encerra o link (status 'completed').
bairroRouter.post('/:code/submit', (req, res) => {
  const { code } = req.params;
  const { placements = {}, group = '', board = 1 } = req.body || {};
  const existing = getByCode(code);
  if (existing && existing.status === 'completed') {
    return res.status(409).json({ error: 'As respostas já foram enviadas. Este link foi encerrado.' });
  }
  const json = JSON.stringify(placements || {});
  if (existing) {
    db.prepare(
      `UPDATE bairro_submissions
       SET placements = ?, group_name = ?, board = ?, status = 'completed',
           completed_at = datetime('now'), updated_at = datetime('now')
       WHERE code = ?`
    ).run(json, group, board, code);
  } else {
    db.prepare(
      `INSERT INTO bairro_submissions (code, group_name, board, placements, status, completed_at)
       VALUES (?, ?, ?, ?, 'completed', datetime('now'))`
    ).run(code, group, board, json);
  }
  res.json({ submission: serialize(getByCode(code)) });
});
