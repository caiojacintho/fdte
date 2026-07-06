import { Router } from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword, signToken, authMiddleware } from '../auth.js';

export const authRouter = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    entity: user.entity,
    city: user.city,
    cpf: user.cpf ?? '',
    role: user.role,
  };
}

authRouter.post('/register', (req, res) => {
  const { name, email, password, entity, city, cpf } = req.body || {};

  if (!name || !email || !password || !entity || !city || !cpf) {
    return res.status(400).json({ error: 'Preencha nome, e-mail, senha, entidade, cidade e CPF.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  const cpfDigits = String(cpf).replace(/\D/g, '');
  if (cpfDigits.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido. Informe os 11 dígitos.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
  }

  const hash = hashPassword(password);
  const info = db
    .prepare(
      `INSERT INTO users (name, email, password_hash, entity, city, cpf, role)
       VALUES (?, ?, ?, ?, ?, ?, 'user')`
    )
    .run(name.trim(), email.toLowerCase().trim(), hash, entity.trim(), city.trim(), cpfDigits);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

authRouter.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user: publicUser(user) });
});
