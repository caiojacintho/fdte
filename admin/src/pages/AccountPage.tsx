import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, ShieldCheck, UserCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';

function formatDate(value?: string) {
  if (!value) return '—';
  // O banco guarda "YYYY-MM-DD HH:MM:SS" em UTC; normaliza para ISO.
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  const fields = [
    { label: 'Nome', value: user.name },
    { label: 'E-mail', value: user.email },
    { label: 'Entidade', value: user.entity || '—' },
    { label: 'Cidade', value: user.city || '—' },
    { label: 'Função', value: user.role === 'admin' ? 'Administrador(a)' : 'Participante' },
    { label: 'Membro desde', value: formatDate(user.created_at) },
  ];

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 80px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-soft)',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        {/* Dados da conta */}
        <section className="card" style={{ padding: 4, margin: '20px 0' }}>
          <SectionHeader icon={<UserCircle size={17} />} title="Dados da conta" />
          <div>
            {fields.map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '13px 18px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                }}
              >
                <span style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{f.label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{f.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Segurança / senha */}
        <section className="card" style={{ padding: 4 }}>
          <SectionHeader icon={<ShieldCheck size={17} />} title="Segurança" />
          <PasswordSection />
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        color: 'var(--text)',
        fontWeight: 700,
        fontSize: '0.95rem',
      }}
    >
      <span style={{ color: 'var(--text-faint)', display: 'inline-flex' }}>{icon}</span>
      {title}
    </div>
  );
}

function PasswordSection() {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setCurrent('');
    setNext('');
    setConfirm('');
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (next.length < 6) return setError('A nova senha deve ter pelo menos 6 caracteres.');
    if (next !== confirm) return setError('A confirmação não corresponde à nova senha.');

    setLoading(true);
    try {
      await api.updatePassword({ currentPassword: current, newPassword: next });
      setSuccess(true);
      setEditing(false);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          padding: '13px 18px',
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>Senha</div>
          <div style={{ fontWeight: 700, letterSpacing: '0.15em', marginTop: 2 }}>••••••••</div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.78rem', marginTop: 4 }}>
            Por segurança, a senha é criptografada e não pode ser exibida.
          </div>
          {success && (
            <div style={{ color: 'var(--success)', fontSize: '0.82rem', fontWeight: 600, marginTop: 6 }}>
              Senha alterada com sucesso.
            </div>
          )}
        </div>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setSuccess(false);
            setEditing(true);
          }}
        >
          <KeyRound size={16} />
          Alterar senha
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '16px 18px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="field">
        <label htmlFor="current">Senha atual</label>
        <input
          id="current"
          className="input"
          type="password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="next">Nova senha</label>
        <input
          id="next"
          className="input"
          type="password"
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="Mínimo de 6 caracteres"
        />
      </div>
      <div className="field">
        <label htmlFor="confirm">Confirmar nova senha</label>
        <input
          id="confirm"
          className="input"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && <span className="error-text">{error}</span>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            setEditing(false);
            reset();
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
