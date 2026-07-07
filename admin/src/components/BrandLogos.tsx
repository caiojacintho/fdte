import sedurLogo from '../assets/logos/sedur.svg';
import planehabLogo from '../assets/logos/planehab.svg';

export function BrandLogos({ height = 38 }: { height?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <img
        src={sedurLogo}
        alt="Governo da Bahia — SEDUR"
        style={{ height, width: 'auto', display: 'block' }}
      />
      <img src={planehabLogo} alt="PLANEHAB" style={{ height, width: 'auto', display: 'block' }} />
    </div>
  );
}
