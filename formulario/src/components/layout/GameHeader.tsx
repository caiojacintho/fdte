import { useAuth } from '../../auth/AuthContext';

export function GameHeader({ stepLabel }: { stepLabel: string }) {
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
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
          PLANEHAB · Nosso Bairro
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>{stepLabel}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <span className="badge">
            {user.name} · {user.entity} · {user.city}
          </span>
        )}
        <button className="btn btn-ghost" type="button" onClick={logout} style={{ padding: '8px 16px' }}>
          Sair
        </button>
      </div>
    </header>
  );
}
