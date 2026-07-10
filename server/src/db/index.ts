import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Dev-only fallback kept in sync with `drizzle.config.ts`'s own fallback and
// `docker-compose.yml`'s default Postgres credentials - no dotenv anywhere
// else in this codebase (routes just read `process.env.*` directly), so we
// do the same here rather than introducing a new dependency.
const connectionString = process.env.DATABASE_URL ?? 'postgres://planehab:planehab@localhost:5432/planehab';

// Exported so one-off scripts (seed.ts, seed-fake-data.ts) can call
// `client.end()` when done - otherwise the open connection pool keeps the
// Node process alive after the script's work is finished.
export const client = postgres(connectionString);

export const db = drizzle(client, { schema });
