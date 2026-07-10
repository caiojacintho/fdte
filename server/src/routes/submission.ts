import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

export const submissionRouter = Router();

function withPlacements(submission) {
  const placements = db
    .prepare('SELECT board, slot_key, card_id FROM placements WHERE submission_id = ?')
    .all(submission.id);
  return { ...submission, placements };
}

// Resolve a submissão atual a partir do token enviado no header.
// Responde 401 (e retorna null) quando o token está ausente ou é inválido,
// para o front limpar a sessão e voltar à tela de identificação.
function requireSubmission(req, res) {
  const token = req.get('X-Submission-Token');
  const submission = token
    ? db.prepare('SELECT * FROM submissions WHERE token = ?').get(token)
    : null;
  if (!submission) {
    res.status(401).json({ error: 'Sessão não encontrada. Recomece o preenchimento.' });
    return null;
  }
  return submission;
}

// Cria uma nova submissão anônima (tela inicial de identificação).
submissionRouter.post('/start', (req, res) => {
  const { name, city, entity } = req.body || {};
  if (!name?.trim() || !city?.trim() || !entity?.trim()) {
    return res.status(400).json({ error: 'Preencha nome, cidade e entidade.' });
  }

  const token = randomUUID();
  const info = db
    .prepare('INSERT INTO submissions (token, name, city, entity) VALUES (?, ?, ?, ?)')
    .run(token, name.trim(), city.trim(), entity.trim());

  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token, submission: withPlacements(submission) });
});

submissionRouter.get('/current', (req, res) => {
  const submission = requireSubmission(req, res);
  if (!submission) return;
  res.json({ submission: withPlacements(submission) });
});

submissionRouter.put('/placements', (req, res) => {
  const submission = requireSubmission(req, res);
  if (!submission) return;

  const { board, slotKey, cardId } = req.body || {};
  if (!board || !slotKey) {
    return res.status(400).json({ error: 'board e slotKey são obrigatórios.' });
  }
  if (submission.status !== 'in_progress') {
    return res.status(409).json({ error: 'Este formulário já foi enviado e não pode ser alterado.' });
  }

  if (cardId) {
    db.prepare(
      `INSERT INTO placements (submission_id, board, slot_key, card_id)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(submission_id, board, slot_key) DO UPDATE SET card_id = excluded.card_id`
    ).run(submission.id, board, slotKey, cardId);
  } else {
    db.prepare('DELETE FROM placements WHERE submission_id = ? AND board = ? AND slot_key = ?').run(
      submission.id,
      board,
      slotKey
    );
  }

  db.prepare(`UPDATE submissions SET updated_at = datetime('now') WHERE id = ?`).run(submission.id);

  const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission.id);
  res.json({ submission: withPlacements(updated) });
});

submissionRouter.post('/complete', (req, res) => {
  const submission = requireSubmission(req, res);
  if (!submission) return;

  db.prepare(
    `UPDATE submissions SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  ).run(submission.id);

  const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission.id);
  res.json({ submission: withPlacements(updated) });
});
