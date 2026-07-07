// Popula o banco com dados FALSOS/ALEATÓRIOS para demonstração do painel.
// Uso: (na pasta server) `node scripts/seed-fake-data.js`
// ATENÇÃO: apaga todas as submissões, placements e usuários não-admin antes de inserir.

import { db } from '../src/db.js';
import { hashPassword } from '../src/auth.js';

// ---------- Pools de dados fictícios ----------
const FIRST_NAMES = [
  'Maria', 'José', 'Ana', 'João', 'Antônio', 'Francisca', 'Carlos', 'Adriana', 'Paulo', 'Juliana',
  'Marcos', 'Fernanda', 'Luiz', 'Patrícia', 'Rafael', 'Camila', 'Rodrigo', 'Aline', 'Bruno', 'Vanessa',
  'Tiago', 'Larissa', 'Gustavo', 'Beatriz', 'Diego', 'Sabrina', 'Everton', 'Cláudia', 'Igor', 'Rebeca',
];
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Nascimento', 'Araújo', 'Barbosa', 'Rocha', 'Dias',
];
const CITIES = [
  'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro',
  'Ilhéus', 'Lauro de Freitas', 'Barreiras', 'Porto Seguro', 'Alagoinhas', 'Simões Filho',
];
const ENTITIES = [
  'Associação de Moradores do Bairro da Paz',
  'Cooperativa Habitacional Novo Horizonte',
  'Associação Comunitária São Francisco',
  'Movimento por Moradia Digna',
  'Sindicato dos Trabalhadores Rurais',
  'Associação de Moradores do Subúrbio',
  'Central de Movimentos Populares',
  'Associação de Bairro Vila Esperança',
];

const TIPOLOGIA = [
  'tipologia-ocupacao', 'tipologia-encosta', 'tipologia-apartamento', 'tipologia-rural', 'tipologia-casa-propria',
];
const MUDANCA = ['mudanca-casa-nova', 'mudanca-reforma'];
const CASA = [
  'casa-adaptacao', 'casa-agua', 'casa-aluguel', 'casa-banheiro-1', 'casa-banheiro-2', 'casa-cozinha',
  'casa-documento', 'casa-endereco', 'casa-esgoto', 'casa-garagem', 'casa-lavanderia', 'casa-luz',
  'casa-sem-fila', 'casa-parede', 'casa-pisos', 'casa-quarto-1', 'casa-quarto-2', 'casa-quarto-3',
  'casa-quintal', 'casa-reboco', 'casa-telhado',
];
const PAINEL = [
  'arvores', 'centro-cultural', 'creche', 'escola', 'praca', 'quadra', 'saude', 'esgoto', 'iluminacao',
  'internet', 'lixo', 'agua', 'acessibilidade', 'asfalto-calcada', 'calcada', 'ciclovia', 'transporte',
  'seguranca', 'contencao', 'enchente',
];

// ---------- Helpers ----------
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const chance = (p) => Math.random() < p;

function pickMany(arr, min, max) {
  const count = min + rand(max - min + 1);
  const pool = [...arr];
  const out = [];
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(rand(pool.length), 1)[0]);
  }
  return out;
}

function fakeCpf() {
  return Array.from({ length: 11 }, () => rand(10)).join('');
}

function slug(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-zA-Z]+/g, '.').toLowerCase();
}

// Data no passado (até `daysAgo` dias) no formato do SQLite: "YYYY-MM-DD HH:MM:SS".
function pastDateTime(maxDaysAgo) {
  const ms = Date.now() - rand(maxDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

// ---------- Limpeza ----------
console.log('[seed-fake] limpando placements, submissions e usuários não-admin…');
db.exec('DELETE FROM placements;');
db.exec('DELETE FROM submissions;');
db.prepare("DELETE FROM users WHERE role != 'admin'").run();

// ---------- Inserção ----------
const TOTAL = 24;
const insertUser = db.prepare(
  `INSERT INTO users (name, email, password_hash, entity, city, cpf, role, created_at)
   VALUES (?, ?, ?, ?, ?, ?, 'user', ?)`
);
const insertSubmission = db.prepare(
  `INSERT INTO submissions (user_id, status, created_at, updated_at, completed_at)
   VALUES (?, ?, ?, ?, ?)`
);
const insertPlacement = db.prepare(
  `INSERT INTO placements (submission_id, board, slot_key, card_id, created_at)
   VALUES (?, ?, ?, ?, ?)`
);

const defaultHash = hashPassword('senha123');
const usedEmails = new Set();
let completed = 0;

for (let i = 0; i < TOTAL; i++) {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`;
  let email = `${slug(name)}@exemplo.com`;
  while (usedEmails.has(email)) email = `${slug(name)}${rand(999)}@exemplo.com`;
  usedEmails.add(email);

  const createdAt = pastDateTime(30);
  const userInfo = insertUser.run(
    name,
    email,
    defaultHash,
    pick(ENTITIES),
    pick(CITIES),
    fakeCpf(),
    createdAt
  );
  const userId = userInfo.lastInsertRowid;

  const isCompleted = chance(0.75);
  if (isCompleted) completed++;
  const completedAt = isCompleted ? pastDateTime(20) : null;
  const subInfo = insertSubmission.run(
    userId,
    isCompleted ? 'completed' : 'in_progress',
    createdAt,
    completedAt || createdAt,
    completedAt
  );
  const submissionId = subInfo.lastInsertRowid;

  // Etapa 1 e 2 (1 carta cada)
  insertPlacement.run(submissionId, 'tabuleiro', 'como_e_hoje', pick(TIPOLOGIA), createdAt);
  insertPlacement.run(submissionId, 'tabuleiro', 'como_mudar', pick(MUDANCA), createdAt);

  // Etapa 3 — o que a casa precisa (3 a 8 cartas)
  pickMany(CASA, 3, 8).forEach((cardId, idx) => {
    insertPlacement.run(submissionId, 'tabuleiro', `precisa_${idx + 1}`, cardId, createdAt);
  });

  // Etapa 4 — o que o bairro precisa (4 a 10 cartas)
  pickMany(PAINEL, 4, 10).forEach((cardId, idx) => {
    insertPlacement.run(submissionId, 'painel', `hex_${idx + 1}`, cardId, createdAt);
  });
}

const placementsCount = db.prepare('SELECT COUNT(*) AS n FROM placements').get().n;
console.log(
  `[seed-fake] pronto: ${TOTAL} participantes (${completed} enviadas, ${TOTAL - completed} em andamento), ${placementsCount} cartas.`
);
