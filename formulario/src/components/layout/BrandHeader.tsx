import sedurLogo from '../../assets/logos/sedur.svg';
import planehabLogo from '../../assets/logos/planehab.svg';
import fdteLogo from '../../assets/logos/fdte.png';

export function BrandHeader() {
  return (
    <header className="brand-header">
      <div className="brand-header-gov">
        <img
          src={sedurLogo}
          alt="SEDUR — Secretaria de Desenvolvimento Urbano"
          style={{ height: 44, width: 'auto' }}
        />
        <img src={planehabLogo} alt="PLANEHAB" style={{ height: 52, width: 'auto' }} />
      </div>
      <img className="brand-header-fdte" src={fdteLogo} alt="FDTE" style={{ height: 34, width: 'auto' }} />
    </header>
  );
}
