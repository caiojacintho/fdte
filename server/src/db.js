import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'app.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    entity TEXT NOT NULL,
    city TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    board TEXT NOT NULL,
    slot_key TEXT NOT NULL,
    card_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(submission_id, board, slot_key)
  );
`);

// Migração: adiciona a coluna cpf em bancos já existentes (CREATE TABLE IF NOT EXISTS não altera colunas).
const userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((c) => c.name === 'cpf')) {
  db.exec("ALTER TABLE users ADD COLUMN cpf TEXT NOT NULL DEFAULT ''");
}

function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (existing) return;

  const email = process.env.ADMIN_EMAIL || 'admin@planehab.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = hashPassword(password);

  db.prepare(
    `INSERT INTO users (name, email, password_hash, entity, city, role)
     VALUES (?, ?, ?, ?, ?, 'admin')`
  ).run('Administrador PLANEHAB', email, hash, 'PLANEHAB', 'Salvador');

  console.log(`[seed] usuário admin criado: ${email} / senha: ${password}`);
}

seedAdmin();
