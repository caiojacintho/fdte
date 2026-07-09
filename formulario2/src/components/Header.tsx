import type { ReactNode } from 'react';
import sedurLogo from '../assets/logos/sedur.svg';
import planehabLogo from '../assets/logos/planehab.svg';
import fdteLogo from '../assets/logos/fdte.png';

export function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="bairro-header">
      <div className="bairro-header-logos">
        <img src={sedurLogo} alt="SEDUR — Secretaria de Desenvolvimento Urbano" style={{ height: 34 }} />
        <img src={planehabLogo} alt="PLANEHAB" style={{ height: 40 }} />
        <img className="bairro-header-fdte" src={fdteLogo} alt="FDTE" />
      </div>
      {right && <div className="bairro-header-right">{right}</div>}
    </header>
  );
}
