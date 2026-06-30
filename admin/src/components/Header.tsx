import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'var(--color-surface)',
        borderBottom: '3px solid var(--color-ink)',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
          PLANEHAB · Painel do Gestor
        </div>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && <span className="badge">{user.name}</span>}
        <button className="btn btn-ghost" type="button" onClick={logout} style={{ padding: '8px 16px' }}>
          Sair
        </button>
      </div>
    </header>
  );
}
