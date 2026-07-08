import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

// Filtro de cidade com dropdown customizado (o <select> nativo não permite
// estilizar a lista que abre). Reutiliza o visual de menu do painel:
// cantos arredondados, sombra leve e borda suave.
export function CitySelect({
  value,
  cities,
  onChange,
}: {
  value: string;
  cities: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const options = [{ value: '', label: 'Todas as cidades' }, ...cities.map((c) => ({ value: c, label: c }))];
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="city-select" data-open={open} ref={ref}>
      <button
        type="button"
        className="city-select-trigger"
        aria-label="Filtrar por cidade"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{current.label}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="menu city-select-menu" role="listbox">
          {options.map((o) => (
            <button
              key={o.value || 'all'}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={`menu-item${o.value === value ? ' active' : ''}`}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span style={{ flex: 1, textAlign: 'left' }}>{o.label}</span>
              {o.value === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
