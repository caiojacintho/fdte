import { NavLink } from 'react-router-dom';
import { useTransmissions } from '../transmissions/store';

const MONTHS_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS_ABBR[Number(m) - 1]} ${y}`;
}

export function TransmissionSidebar() {
  const items = useTransmissions();

  return (
    <aside className="sidebar">
      <NavLink to="/" end className="sidebar-all">
        Todas as sessões
      </NavLink>

      {items.length === 0 ? (
        <p className="sidebar-empty">Nenhuma transmissão criada ainda.</p>
      ) : (
        <nav className="sidebar-list">
          {items.map((t) => (
            <NavLink
              key={t.id}
              to={`/transmissoes/${t.id}`}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-item-date">{formatDate(t.date)}</span>
              <span className="sidebar-item-time">{t.end ? `${t.start} – ${t.end}` : `${t.start} – aberto`}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </aside>
  );
}
