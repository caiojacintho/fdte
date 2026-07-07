import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, LogOut, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-secondary icon-btn"
        type="button"
        aria-label="Minha conta"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <User size={18} />
      </button>

      {open && (
        <div className="menu" role="menu" style={{ minWidth: 200 }}>
          <Link to="/conta" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <User size={16} />
            Dados do usuário
          </Link>
          <Link to="/suporte" className="menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <LifeBuoy size={16} />
            Suporte
          </Link>
          <div className="menu-divider" />
          <button
            className="menu-item danger"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
