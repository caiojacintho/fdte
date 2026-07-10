import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BrandLogos } from '../components/BrandLogos';
import mural from '../assets/bg/mural.jpg';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, remember);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-left">
        <div className="login-brand">
          <BrandLogos height={48} />
        </div>

        <div className="login-center">
          <h1 className="login-title">Seja bem-vindo(a)</h1>
          <p className="login-sub">Entre com seu e-mail e senha para acessar o painel</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">E-mail</label>
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

            <div className="field">
              <label htmlFor="password">Senha</label>
              <div className="input-pass">
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="input-pass-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-row">
              <label className="login-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Lembrar-me
              </label>
              <button type="button" className="login-forgot" onClick={() => setForgot(true)}>
                Esqueci a senha
              </button>
            </div>

            {forgot && <p className="login-hint">Contate o administrador do sistema para redefinir sua senha.</p>}
            {error && <span className="error-text">{error}</span>}

            <button className="btn btn-block login-submit" type="submit" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="login-footer">
          © 2026 · Governo do Estado da Bahia · PLANEHAB · Fundação para o Desenvolvimento Tecnológico da Engenharia
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-panel" style={{ backgroundImage: `url(${mural})` }} />
      </div>
    </div>
  );
}
