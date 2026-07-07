import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'app.db'));

// A tabela `users` guarda apenas as contas do painel admin (gestores).
// Os participantes do formulário NÃO têm conta: cada submissão é anônima e
// carrega a própria identidade (nome/cidade/entidade), identificada por um token.
const SUBMISSIONS_DDL = `
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    entity TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );
`;

const PLACEMENTS_DDL = `
  CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    board TEXT NOT NULL,
    slot_key TEXT NOT NULL,
    card_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(submission_id, board, slot_key)
  );
`;

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

  ${SUBMISSIONS_DDL}
  ${PLACEMENTS_DDL}
`);

// Migração: bancos antigos amarravam a submissão a `users(id)` via user_id.
// O novo modelo é anônimo por token. Se a tabela ainda estiver no formato
// antigo (sem a coluna `token`), recriamos submissions/placements no novo
// formato. Os dados antigos (de teste) são descartados — repopule com o seed.
const subColumns = db.prepare('PRAGMA table_info(submissions)').all();
if (subColumns.length > 0 && !subColumns.some((c) => c.name === 'token')) {
  db.exec('DROP TABLE IF EXISTS placements;');
  db.exec('DROP TABLE IF EXISTS submissions;');
  db.exec(SUBMISSIONS_DDL);
  db.exec(PLACEMENTS_DDL);
  console.warn('[migração] submissions recriada no novo formato (token). Dados antigos removidos.');
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
