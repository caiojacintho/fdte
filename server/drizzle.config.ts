import { defineConfig } from 'drizzle-kit';

// Dev-only config file: no dotenv anywhere else in this codebase (routes
// just read `process.env.*` directly, relying on the shell/compose env), so
// we do the same here rather than introducing a new dependency. The
// fallback matches `server/.env.example`'s `DATABASE_URL` and
// `docker-compose.yml`'s default Postgres credentials.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://planehab:planehab@localhost:5432/planehab',
  },
});
