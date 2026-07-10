# AGENTS.md — PLANEHAB "Nosso Bairro"

This file is for contributors (human or agent) working on this codebase. It
covers domain context, repo topology, how to run things, conventions, the
architectural decisions behind the current hardening effort, and explicit
non-goals. For a quick-start "how do I run this" in plain terms, see
`README.md` — this file is the "why", README is the "how, fast".

## 1. Domain concept

PLANEHAB is a **gamified live public-housing consultation** ("Consulta
Popular da Habitação") run during in-person or video-call sessions
(historically over Google Meet) with a facilitator guiding a group of
participants in real time. It has two distinct stages, run as two separate
frontends:

- **Etapa 1 — `formulario/`** (individual): a single participant identifies
  themselves (name, city, entity — no account/password), then plays through
  a personal "tabuleiro da casa" (house board): 3 steps where they drag
  cards onto slots to describe how their housing situation is today, what
  they'd change, and what their home needs most. Ends with a review screen
  and submission.
- **Etapa 2 — `formulario2/`** ("Jogo do Bairro", group): a facilitator
  shares a per-group link (`/acesso/<n>-<codigo>`, groups 1–6, desktop
  only), and the group collectively fills a 13-space hexagonal "Painel
  Nosso Bairro" board, then submits once for the whole group.

Both stages' submissions are reviewed by managers in `admin/`. A live
session (a scheduled run of the game with a facilitator and one or more
groups) is the organizing unit this hardening plan introduces formally as a
first-class backend entity (see §5) — today a session is an informal,
out-of-band concept (a Meet call + a set of links shared verbally), not yet
represented as a database row shared consistently by both stages.

## 2. Repo topology

npm workspaces monorepo:

```
fdte/
├── admin/                  fdte-admin      — manager dashboard (React+TS+Vite, :5174)
├── formulario/              fdte-formulario — Etapa 1 game (React+TS+Vite, :5173)
├── formulario2/              fdte-formulario2 — Etapa 2 game (React+TS+Vite, :5176)
├── server/                  fdte-server     — shared API (Node, :4000)
└── packages/
    ├── board-kit/           @fdte/board-kit      — shared drag-and-drop mechanics
    │                        (DraggableCard, CardTray, HexSlot, Slot, useBoardSensors),
    │                        deduplicated from formulario+formulario2. Game DATA
    │                        (card definitions, board layouts) stays per-app —
    │                        board-kit is mechanics-only.
    └── shared-types/        @fdte/shared-types   — API request/response DTOs shared
                             across the 3 frontends (UserDTO, SubmissionDTO,
                             PlacementDTO, BairroSubmission, StatsDTO, etc.), plus
                             forward-looking stubs (SessionDTO, SessionGroupDTO,
                             AuditEventDTO) for entities the backend is growing
                             into per this plan. Game-domain types are NOT here.
```

Both `packages/*` are plain-TypeScript, source-only workspaces (no build
step — consumed directly via `"main"/"types"/"exports"` pointing at
`./src/index.ts`; Vite/tsc handle transformation for the frontends, `tsc -b`
type-checks them standalone).

## 3. How to run everything

From the repo root (NOT per-app — this is an npm workspaces monorepo, one
install/one lockfile for everything):

```bash
npm install     # single root node_modules + package-lock.json
npm run dev     # boots all 4 apps concurrently on their existing ports
```

This starts: server → http://localhost:4000, admin → :5174, formulario →
:5173, formulario2 → :5176 (open `/acesso/<codigo>` for a group link). Use
`npm run dev -w <workspace>` to run just one app.

Root scripts also provide `npm run lint`, `npm run format` / `format:check`,
and `npm run typecheck` — all run across the whole repo in one shot (see §4).

> Server persistence: as of this section being written, the server still
> uses Node's built-in `node:sqlite` (see `server/src/db.js`). This hardening
> plan's Wave 2 replaces it with Postgres, run via `docker compose up -d`
> (Postgres + Adminer) — once that lands, this section should be amended to
> lead with the Docker step. Check for a root `docker-compose.yml` to see
> whether that migration has landed in your checkout yet.

## 4. Conventions

- **TypeScript everywhere** — all 3 frontends and both shared packages are
  strict-mode TypeScript. `server/` is still plain ESM JavaScript as of
  Wave 1 of this plan; it becomes TypeScript in Wave 2 (Hono + Drizzle
  rewrite). Don't add new plain-`.js` application code to the frontends or
  to `packages/*`.
- **Lint/format via CI, not pre-commit hooks** — root `eslint.config.js`
  (flat config: `typescript-eslint` recommended for `.ts`/`.tsx`,
  `eslint-plugin-react-hooks` for the 3 React apps, base JS rules for
  `server`'s current plain-JS files) and root `.prettierrc.json` are
  enforced by `.github/workflows/ci.yml` on push/PR to `main` (`npm ci &&
npm run lint && npm run typecheck` — no build/deploy step). There is
  intentionally no husky/pre-commit hook; CI is the single enforcement
  layer. Run `npm run lint` / `npm run format:check` / `npm run typecheck`
  locally before pushing.
- **npm workspaces, one lockfile** — never run `npm install` inside an
  individual app/package directory; always from the repo root. Adding a
  dependency to a specific workspace: `npm install <pkg> -w <workspace>`.
- **Drizzle + Hono** (Wave 2 onward) — the server's persistence layer is
  Drizzle ORM against Postgres (`server/src/db/schema.ts`, migrations via
  `drizzle-kit`), and the HTTP framework is Hono (`@hono/node-server`),
  replacing the original Express + `node:sqlite` stack. Postgres/Drizzle
  errors are mapped to HTTP status codes by a single `app.onError` handler
  (unique-violation → 409, foreign-key-violation → 400, else → 500) rather
  than being handled ad hoc per route.
- **No automated test suite exists.** This hardening plan verifies each unit
  of work via agent-executed manual QA (curl/browser walkthroughs with
  captured evidence — see `.omo/plans/planehab-hardening.md`'s "Verification
  strategy") rather than retrofitting a test framework mid-rewrite. If you
  add substantial new logic going forward, consider whether this project has
  since gained a test setup worth extending — check before assuming there's
  still none.

## 5. Key architectural decisions (the "why" behind this hardening plan)

These are decisions from `.omo/plans/planehab-hardening.md` worth a future
contributor understanding before touching related code (full detail lives
in that plan file — this is the summary):

- **Sessions are becoming a first-class backend entity.** A `sessions` row
  (server-generated code, UTC-correct start/end window, one-way
  `submit_unlocked` flag) plus `session_groups` (per-group code + board
  index, FK'd to a session) replace the admin frontend's current
  localStorage-only `Transmission` mock. Etapa 1 stays an open
  self-identification form gated by a session code from the URL; Etapa 2
  keeps its per-group link, now backed by a real `session_groups` row
  instead of ad hoc code matching. This is what makes "which session did
  this submission belong to" an actual, queryable fact instead of an
  informal Meet-call convention.
- **Submit-gate is server-enforced, one-way, and scoped to the submit
  action only.** `sessions.submit_unlocked` defaults `false`; only an admin
  "Liberar envio" action can flip it to `true` (no re-lock, mirroring how
  "Encerrar sessão" is also one-way). Enforcement lives server-side on
  `POST /complete` and `POST /:code/submit` ONLY — autosave
  (`PUT /placements` in both games) is explicitly unaffected, so
  participants can keep playing/saving before the facilitator unlocks
  submission; only the final "send" action is gated. Participant-side
  polling for unlock state starts only once a participant reaches the
  review/submit screen, not session-wide from the start — this is a
  deliberate scope boundary, not an oversight (see "Must NOT have" in the
  plan: no WebSockets/SSE, polling only, and only where needed).
- **Audit log is allow-listed and identity-light by design.** Only
  `submission_started` / `step_entered` / `submitted` events are captured
  (no keystroke- or placement-level logging — there is deliberately no
  `placement_saved`-equivalent event, enforced by an allow-list at the
  ingestion endpoint itself, not just by convention). Events are labeled by
  session/submission token or group code, not by asserted participant
  identity (there is none to assert — participants never authenticate).
  This is a privacy/scope boundary as much as a technical one.
- **Concurrency-safe writes replace check-then-act races.** The original
  Express+SQLite routes had classic check-then-act races on submission
  completion and bairro create-or-update. The Postgres/Drizzle rewrite
  replaces these with atomic `UPDATE ... WHERE status='in_progress'
RETURNING *` (zero rows = already completed, mapped to 409) and
  `INSERT ... ON CONFLICT DO UPDATE ... WHERE status='in_progress'` guards,
  rather than a `SELECT` followed by a separate `INSERT`/`UPDATE`.
- **The certificate feature is Etapa 1 only, and its visual design is an
  intentionally documented placeholder.** There is no individual-name field
  in the Etapa 2 (group) data model, so certificate generation only makes
  sense for individual Etapa 1 submissions. The canvas renderer reuses the
  existing `formulario/src/lib/share.ts` pattern and is fully wired up now
  (additive to the existing tabuleiro-share button on `ResumoPage`), but the
  template art is a placeholder pending the client's final asset — the
  swap-in point is documented at the renderer's call site specifically so a
  future contributor can drop in the real template without re-deriving the
  integration.
- **`cpf` is dead weight, not a real column.** `POST /api/auth/register`
  and `PATCH /api/auth/me` referenced a `cpf` column that doesn't exist in
  the schema (broken, never worked) — they're dropped entirely rather than
  fixed, since nothing in the product ever needed participant CPF capture.
  Don't reintroduce a `cpf` column without a real product reason.

## 6. Explicit non-goals (this plan's Scope OUT)

Carried verbatim in spirit from the plan's "Must NOT have" — if you find
yourself about to build one of these as a "natural extension" of hardening
work, stop and check whether it's actually in scope:

- A full roster / pre-registered-attendee invite system for Etapa 1.
- WebSockets/SSE for anything — polling only, and only starting at the
  screen that actually needs it (not session-wide).
- Containerizing the 3 Vite frontends. Only Postgres + Adminer (and a
  production server Dockerfile, not part of default `docker compose up`)
  are containerized.
- Keystroke/placement-level audit logging.
- Pixel-perfect certificate visual design — the template is a documented
  placeholder pending a client-provided asset.
- Certificate generation for Etapa 2 / group submissions.
- Re-adding `POST /api/auth/register` or `PATCH /api/auth/me`.
- Cleaning up the committed image asset footprint (see the note below) —
  acknowledged as a known characteristic, not fixed by this plan.
- Building a new automated test suite from scratch — this round relies on
  agent-executed manual QA per unit of work instead (see §4).
- A re-lock control for the submit-gate once unlocked, or a true
  session/session-group hard-delete (the backend only supports
  create/list/get/close; the admin "Excluir sessão" button is repointed to
  `close`, not a real delete).

## Assets

The repo currently commits **~346MB of image assets**: `formulario/src/assets`
(≈280MB), `admin/src/assets` (≈61MB), `formulario2/src/assets` (≈5MB). This is
a known, existing characteristic of the repo and is **not addressed by this
hardening plan** — no assets are deleted, compressed, or moved as part of
this work. The original client-provided source files for the game's card/board
art are the PDFs under `formulario/src/assets/img/base/*.pdf`; the committed
images are derived from those. If asset-footprint cleanup ever becomes a
priority, start there rather than the derived image directories.
