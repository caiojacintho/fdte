// Cria o usuário admin inicial (painel de gestores), caso ainda não exista.
// Uso: (na pasta server) `npm run db:seed`
// Idempotente: se já existir um usuário com role='admin', não faz nada.

import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/auth.js';
import { client, db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';

async function seedAdmin(): Promise<void> {
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin')).limit(1);
  if (existing) {
    console.log('[seed] usuário admin já existe, pulando.');
    return;
  }

  const email = process.env.ADMIN_EMAIL || 'admin@planehab.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = hashPassword(password);

  await db.insert(users).values({
    name: 'Administrador PLANEHAB',
    email,
    passwordHash: hash,
    entity: 'PLANEHAB',
    city: 'Salvador',
    role: 'admin',
  });

  console.log(`[seed] usuário admin criado: ${email} / senha: ${password}`);
}

seedAdmin()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
