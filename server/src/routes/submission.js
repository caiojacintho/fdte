import { Router } from 'express';
import { db } from '../db.js';

export const submissionRouter = Router();

function getOrCreateCurrentSubmission(userId) {
  let submission = db
    .prepare(`SELECT * FROM submissions WHERE user_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1`)
    .get(userId);

  if (!submission) {
    const info = db.prepare(`INSERT INTO submissions (user_id) VALUES (?)`).run(userId);
    submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(info.lastInsertRowid);
  }
  return submission;
}

function withPlacements(submission) {
  const placements = db
    .prepare('SELECT board, slot_key, card_id FROM placements WHERE submission_id = ?')
    .all(submission.id);
  return { ...submission, placements };
}

submissionRouter.get('/current', (req, res) => {
  const submission = getOrCreateCurrentSubmission(req.user.sub);
  res.json({ submission: withPlacements(submission) });
});

submissionRouter.put('/placements', (req, res) => {
  const { board, slotKey, cardId } = req.body || {};
  if (!board || !slotKey) {
    return res.status(400).json({ error: 'board e slotKey são obrigatórios.' });
  }

  const submission = getOrCreateCurrentSubmission(req.user.sub);
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
  const submission = getOrCreateCurrentSubmission(req.user.sub);
  db.prepare(
    `UPDATE submissions SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
  ).run(submission.id);

  const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission.id);
  res.json({ submission: withPlacements(updated) });
});
