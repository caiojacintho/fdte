import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { BrandLogos } from './BrandLogos';

export function Header({ actions }: { actions?: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <BrandLogos />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <Link
            to="/conta"
            className="btn btn-secondary icon-btn"
            aria-label="Minha conta"
            title="Minha conta"
          >
            <User size={18} />
          </Link>
        )}
        {actions}
        <button className="btn btn-secondary" type="button" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}
