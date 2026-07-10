import sedurLogo from '../assets/logos/sedur.svg';
import planehabLogo from '../assets/logos/planehab.svg';
import fdteLogo from '../assets/logos/fdte.png';

export function BrandLogos({ height = 48 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      <img src={sedurLogo} alt="Governo da Bahia — SEDUR" style={{ height, width: 'auto', display: 'block' }} />
      <img src={planehabLogo} alt="PLANEHAB" style={{ height, width: 'auto', display: 'block' }} />
      <img src={fdteLogo} alt="FDTE" style={{ height: Math.round(height * 0.72), width: 'auto', display: 'block' }} />
    </div>
  );
}
