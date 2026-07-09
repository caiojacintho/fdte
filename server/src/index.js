import express from 'express';
import cors from 'cors';
import { authMiddleware, requireAdmin } from './auth.js';
import { authRouter } from './routes/auth.js';
import { submissionRouter } from './routes/submission.js';
import { bairroRouter } from './routes/bairro.js';
import { adminRouter } from './routes/admin.js';
import './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
// O formulário é público: os participantes não têm conta. Cada submissão é
// identificada por um token próprio (header X-Submission-Token).
app.use('/api/submission', submissionRouter);
// O "Jogo do Bairro" também é público: cada grupo acessa pelo código do link.
app.use('/api/bairro', bairroRouter);
app.use('/api/admin', authMiddleware, requireAdmin, adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`[server] API rodando em http://localhost:${PORT}`);
});
