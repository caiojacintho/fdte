import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BrandLogos } from '../components/BrandLogos';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 28,
      }}
    >
      <BrandLogos height={40} />

      <div className="card" style={{ maxWidth: 400, width: '100%', padding: '32px 30px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.35rem' }}>Painel do Gestor</h1>
          <p style={{ marginTop: 6, color: 'var(--text-soft)', fontSize: '0.9rem' }}>
            Acesso restrito à equipe gestora
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <div className="input-icon">
              <Mail size={16} />
              <input
                id="email"
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.gov.br"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <div className="input-icon">
              <Lock size={16} />
              <input
                id="password"
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          {error && <span className="error-text">{error}</span>}
          <button className="btn btn-block" type="submit" disabled={loading}>
            <LogIn size={16} />
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
