import sedurLogo from '../../assets/logos/sedur.svg';
import planehabLogo from '../../assets/logos/planehab.svg';
import fdteLogo from '../../assets/logos/fdte.png';

export function GameHeader(_props: { stepLabel?: string }) {
  return (
    <header className="game-header" style={{ padding: '16px 24px', background: 'transparent' }}>
      <div className="game-header-logos">
        <img
          src={sedurLogo}
          alt="SEDUR — Secretaria de Desenvolvimento Urbano"
          style={{ height: 36, width: 'auto' }}
        />
        <img src={planehabLogo} alt="PLANEHAB" style={{ height: 42, width: 'auto' }} />
      </div>
      <img className="game-header-fdte" src={fdteLogo} alt="FDTE" />
    </header>
  );
}
