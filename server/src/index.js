import express from 'express';
import cors from 'cors';
import { authMiddleware, requireAdmin } from './auth.js';
import { authRouter } from './routes/auth.js';
import { submissionRouter } from './routes/submission.js';
import { adminRouter } from './routes/admin.js';
import './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/submission', authMiddleware, submissionRouter);
app.use('/api/admin', authMiddleware, requireAdmin, adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`[server] API rodando em http://localhost:${PORT}`);
});
