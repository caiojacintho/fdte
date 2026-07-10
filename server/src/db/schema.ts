import { pgTable, pgEnum, serial, integer, text, boolean, timestamp, date, jsonb, unique } from 'drizzle-orm/pg-core';

// Which kind of submission an audit event refers to (Etapa 1 individual
// submission vs Etapa 2 group/"bairro" submission). See `auditEvents` below.
export const auditSubjectTypeEnum = pgEnum('audit_subject_type', ['submission', 'bairro']);

// Painel admin accounts (gestores) only. Participants never authenticate -
// each submission carries its own identity (name/city/entity), matched by an
// anonymous token instead of a user row. No `cpf` column: `POST
// /api/auth/register` and `PATCH /api/auth/me` referenced a `cpf` column
// that never existed in the SQLite schema (dead/broken code) and are not
// ported - see AGENTS.md.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  entity: text('entity').notNull(),
  city: text('city').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// A scheduled live consultation run (facilitator + one or more groups),
// historically an out-of-band Meet call plus verbally-shared links. This is
// the new first-class backend entity this hardening plan introduces so
// "which session did this submission belong to" becomes an actual queryable
// fact instead of an informal convention. `start_at`/`end_at` are
// timestamptz so Wave 3's participant-facing window checks are UTC-correct
// regardless of server/client timezone. `submit_unlocked` is one-way
// (default false -> true via an admin action only, never re-locked).
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  date: date('date', { mode: 'string' }).notNull(),
  startAt: timestamp('start_at', { withTimezone: true, mode: 'string' }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true, mode: 'string' }),
  description: text('description').notNull().default(''),
  submitUnlocked: boolean('submit_unlocked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// A per-group link within a session (Etapa 2 "Jogo do Bairro" - groups 1-6,
// one hexagonal board each). Replaces the admin frontend's hardcoded
// group/board mapping with a real backend row per group per session. No
// rows exist yet as of this todo - Wave 3 backfills the 6 hardcoded group
// codes and wires `bairroSubmissions.sessionGroupId` to them.
export const sessionGroups = pgTable('session_groups', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => sessions.id),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  boardIndex: integer('board_index').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

// Etapa 1 (individual) submission. `token` identifies the anonymous
// participant in the browser (no user account). `sessionId` is nullable:
// Wave 2b's route port (todo #14) preserves today's ungated behavior as-is -
// session-gating is Wave 3's concern (todo #20), so no session rows are
// attached by anything yet.
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  token: text('token').unique(),
  name: text('name').notNull().default(''),
  city: text('city').notNull().default(''),
  entity: text('entity').notNull().default(''),
  status: text('status').notNull().default('in_progress'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
  sessionId: integer('session_id').references(() => sessions.id),
});

// One card placed on one slot of one board of Etapa 1's tabuleiro (3 steps).
// Unique per (submission, board, slot) so re-placing a card upserts instead
// of duplicating a row - unchanged from the SQLite schema.
export const placements = pgTable(
  'placements',
  {
    id: serial('id').primaryKey(),
    submissionId: integer('submission_id')
      .notNull()
      .references(() => submissions.id),
    board: text('board').notNull(),
    slotKey: text('slot_key').notNull(),
    cardId: text('card_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [
    unique('placements_submission_id_board_slot_key_unique').on(table.submissionId, table.board, table.slotKey),
  ]
);

// Etapa 2 ("Jogo do Bairro") group submission - one row per group-link code.
// ALL existing columns are kept exactly as-is and fully functional: `code`
// and `group_name` stay real, independently-populated columns (NOT
// superseded by a join to `session_groups`), because Wave 2b's todo #15
// upsert (`INSERT ... ON CONFLICT (code) DO UPDATE`) requires `code` to be a
// real unique column on THIS table - a join can't serve as a Postgres
// conflict target. `placements` moves from SQLite TEXT (manually
// JSON.parse/stringify'd) to a native Postgres `jsonb` column (shape:
// Record<slotKey, cardId>). `sessionGroupId` is nullable: no
// `session_groups` rows exist until Wave 3 backfills them - todo #15's
// upsert does not (and must not) require it.
export const bairroSubmissions = pgTable('bairro_submissions', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  groupName: text('group_name').notNull().default(''),
  board: integer('board').notNull().default(1),
  placements: jsonb('placements').$type<Record<string, string>>().notNull().default({}),
  status: text('status').notNull().default('in_progress'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
  sessionGroupId: integer('session_group_id').references(() => sessionGroups.id),
});

// Allow-listed, identity-light audit trail (Wave 4). Only
// submission_started/step_entered/submitted events are ever expected here -
// enforced by an allow-list at the ingestion endpoint itself (todo #27+),
// not by this schema; there is deliberately no placement-level event.
// Events are labeled by session + a submission token or group code
// (`subjectRef`), not by asserted participant identity (there is none).
export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => sessions.id),
  subjectType: auditSubjectTypeEnum('subject_type').notNull(),
  subjectRef: text('subject_ref').notNull(),
  eventType: text('event_type').notNull(),
  path: text('path').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
