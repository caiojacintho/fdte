// Popula o banco com dados FALSOS/ALEATÓRIOS para demonstração do painel.
// Uso: (na pasta server) `npm run db:seed:fake`
// ATENÇÃO: apaga todas as submissões e placements antes de inserir.

import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { client, db } from '../src/db/index.js';
import { placements, submissions } from '../src/db/schema.js';

// ---------- Pools de dados fictícios ----------
const FIRST_NAMES = [
  'Maria',
  'José',
  'Ana',
  'João',
  'Antônio',
  'Francisca',
  'Carlos',
  'Adriana',
  'Paulo',
  'Juliana',
  'Marcos',
  'Fernanda',
  'Luiz',
  'Patrícia',
  'Rafael',
  'Camila',
  'Rodrigo',
  'Aline',
  'Bruno',
  'Vanessa',
  'Tiago',
  'Larissa',
  'Gustavo',
  'Beatriz',
  'Diego',
  'Sabrina',
  'Everton',
  'Cláudia',
  'Igor',
  'Rebeca',
];
const LAST_NAMES = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Almeida',
  'Nascimento',
  'Araújo',
  'Barbosa',
  'Rocha',
  'Dias',
];
const CITIES = [
  'Salvador',
  'Feira de Santana',
  'Vitória da Conquista',
  'Camaçari',
  'Itabuna',
  'Juazeiro',
  'Ilhéus',
  'Lauro de Freitas',
  'Barreiras',
  'Porto Seguro',
  'Alagoinhas',
  'Simões Filho',
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

const TIPOLOGIA = Array.from({ length: 15 }, (_, i) => `tipologia-${String(i + 1).padStart(2, '0')}`);
const MUDANCA = ['mudanca-casa-nova', 'mudanca-reforma'];
const CASA = [
  'casa-adaptacao',
  'casa-agua',
  'casa-aluguel',
  'casa-banheiro-1',
  'casa-banheiro-2',
  'casa-cozinha',
  'casa-documento',
  'casa-endereco',
  'casa-esgoto',
  'casa-garagem',
  'casa-lavanderia',
  'casa-luz',
  'casa-sem-fila',
  'casa-parede',
  'casa-pisos',
  'casa-quarto-1',
  'casa-quarto-2',
  'casa-quarto-3',
  'casa-quintal',
  'casa-reboco',
  'casa-telhado',
];
const PAINEL = [
  'arvores',
  'centro-cultural',
  'creche',
  'escola',
  'praca',
  'quadra',
  'saude',
  'esgoto',
  'iluminacao',
  'internet',
  'lixo',
  'agua',
  'acessibilidade',
  'asfalto-calcada',
  'calcada',
  'ciclovia',
  'transporte',
  'seguranca',
  'contencao',
  'enchente',
];

// ---------- Helpers ----------
const rand = (n: number): number => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rand(arr.length)];
const chance = (p: number): boolean => Math.random() < p;

function pickMany<T>(arr: T[], min: number, max: number): T[] {
  const count = min + rand(max - min + 1);
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(rand(pool.length), 1)[0]);
  }
  return out;
}

// Data no passado (até `maxDaysAgo` dias) no formato "YYYY-MM-DD HH:MM:SS".
// Continua no formato de string do SQLite - funciona como literal de
// timestamp aceito pelo Postgres também (interpretado no fuso do servidor).
function pastDateTime(maxDaysAgo: number): string {
  const ms = Date.now() - rand(maxDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
}

async function main(): Promise<void> {
  // ---------- Limpeza ----------
  // placements referencia submissions via FK - apaga os filhos primeiro.
  console.log('[seed-fake] limpando placements e submissions…');
  await db.delete(placements);
  await db.delete(submissions);

  // ---------- Inserção ----------
  const TOTAL = 24;
  let completed = 0;

  for (let i = 0; i < TOTAL; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${pick(LAST_NAMES)}`;
    const createdAt = pastDateTime(30);

    const isCompleted = chance(0.75);
    if (isCompleted) completed++;
    const completedAt = isCompleted ? pastDateTime(20) : null;

    const [inserted] = await db
      .insert(submissions)
      .values({
        token: randomUUID(),
        name,
        city: pick(CITIES),
        entity: pick(ENTITIES),
        status: isCompleted ? 'completed' : 'in_progress',
        createdAt,
        updatedAt: completedAt || createdAt,
        completedAt,
      })
      .returning({ id: submissions.id });

    const submissionId = inserted.id;

    // Etapa 1 e 2 (1 carta cada), Etapa 3 - o que a casa precisa (3 a 8
    // cartas), Etapa 4 - o que o bairro precisa (4 a 10 cartas).
    await db.insert(placements).values([
      { submissionId, board: 'tabuleiro', slotKey: 'como_e_hoje', cardId: pick(TIPOLOGIA), createdAt },
      { submissionId, board: 'tabuleiro', slotKey: 'como_mudar', cardId: pick(MUDANCA), createdAt },
      ...pickMany(CASA, 3, 8).map((cardId, idx) => ({
        submissionId,
        board: 'tabuleiro',
        slotKey: `precisa_${idx + 1}`,
        cardId,
        createdAt,
      })),
      ...pickMany(PAINEL, 4, 10).map((cardId, idx) => ({
        submissionId,
        board: 'painel',
        slotKey: `hex_${idx + 1}`,
        cardId,
        createdAt,
      })),
    ]);
  }

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(placements);
  console.log(
    `[seed-fake] pronto: ${TOTAL} participantes (${completed} enviadas, ${TOTAL - completed} em andamento), ${total} cartas.`
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
