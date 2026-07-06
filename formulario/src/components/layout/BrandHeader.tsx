import sedurLogo from '../../assets/logos/sedur.svg';
import planehabLogo from '../../assets/logos/planehab.svg';

export function BrandHeader() {
  return (
    <header style={{ width: '100%', padding: '18px 28px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <img
          src={sedurLogo}
          alt="SEDUR — Secretaria de Desenvolvimento Urbano"
          style={{ height: 44, width: 'auto' }}
        />
        <img src={planehabLogo} alt="PLANEHAB" style={{ height: 52, width: 'auto' }} />
      </div>
    </header>
  );
}
