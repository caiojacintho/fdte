import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import sedurLogo from '../../assets/logos/sedur.svg';
import planehabLogo from '../../assets/logos/planehab.svg';

export function GameHeader(_props: { stepLabel?: string }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function goToEdit() {
    setMenuOpen(false);
    navigate('/editar-cadastro');
  }

  const logos = (
    <>
      <img
        src={sedurLogo}
        alt="SEDUR — Secretaria de Desenvolvimento Urbano"
        style={{ height: 36, width: 'auto' }}
      />
      <img src={planehabLogo} alt="PLANEHAB" style={{ height: 42, width: 'auto' }} />
    </>
  );

  return (
    <header className="game-header" style={{ padding: '16px 24px', background: 'transparent' }}>
      <div className="game-header-logos">{logos}</div>

      <div className="game-header-actions">
        <button
          className="btn btn-ghost game-header-editar"
          type="button"
          onClick={goToEdit}
          style={{ padding: '8px 16px' }}
        >
          Editar informações
        </button>
        <button
          className="btn btn-ghost game-header-sair"
          type="button"
          onClick={logout}
          style={{ padding: '8px 16px' }}
        >
          Sair
        </button>
        <button
          className="btn btn-ghost game-header-hamburger"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="game-header-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="game-header-menu" role="menu">
            <button className="btn btn-ghost" type="button" onClick={goToEdit} style={{ width: '100%' }}>
              Editar informações
            </button>
            <button className="btn" type="button" onClick={logout} style={{ width: '100%' }}>
              Sair
            </button>
          </div>
        </>
      )}
    </header>
  );
}
