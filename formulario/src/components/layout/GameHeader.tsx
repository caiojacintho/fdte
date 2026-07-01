import { useAuth } from '../../auth/AuthContext';

export function GameHeader(_props: { stepLabel?: string }) {
  const { user, logout } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';

  const infoPillStyle = { padding: '8px 16px', fontSize: '0.85rem', cursor: 'default' } as const;

  return (
    <header
      className="game-header"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: 'transparent',
      }}
    >
      {user ? (
        <div
          className="game-header-info"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}
        >
          <span className="btn btn-ghost" style={infoPillStyle}>{firstName}</span>
          <span className="btn btn-ghost" style={infoPillStyle}>{user.entity}</span>
          <span className="btn btn-ghost" style={infoPillStyle}>{user.city}</span>
        </div>
      ) : (
        <span />
      )}
      <button className="btn btn-ghost" type="button" onClick={logout} style={{ padding: '8px 16px' }}>
        Sair
      </button>
    </header>
  );
}
