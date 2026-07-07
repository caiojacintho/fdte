import { useEffect, useRef, useState } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const pad = (n: number) => String(n).padStart(2, '0');

function useOutside(active: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, onClose]);
  return ref;
}

// ---------- Data ----------
export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const sel = value ? value.split('-').map(Number) : null;
  const [view, setView] = useState(() =>
    sel ? { y: sel[0], m: sel[1] - 1 } : { y: today.getFullYear(), m: today.getMonth() }
  );

  const first = new Date(view.y, view.m, 1).getDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(view.y, view.m, i - first + 1);
    return {
      d: date.getDate(),
      muted: date.getMonth() !== view.m,
      iso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    };
  });

  function shift(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  }

  const display = value
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}`
    : 'dd/mm/aaaa';

  return (
    <div className="picker" ref={ref}>
      <button
        type="button"
        className={`picker-trigger input${value ? '' : ' placeholder'}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{display}</span>
        <CalIcon size={16} />
      </button>

      {open && (
        <div className="picker-pop">
          <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="Mês anterior" onClick={() => shift(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="cal-title">
              {MONTHS[view.m]} {view.y}
            </span>
            <button type="button" className="cal-nav" aria-label="Próximo mês" onClick={() => shift(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="cal-dow">
                {w}
              </span>
            ))}
            {cells.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`cal-day${c.muted ? ' muted' : ''}${c.iso === value ? ' selected' : ''}${
                  c.iso === todayIso ? ' today' : ''
                }`}
                onClick={() => {
                  onChange(c.iso);
                  setOpen(false);
                }}
              >
                {c.d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Horário ----------
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

export function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const [h, m] = value ? value.split(':') : ['', ''];

  return (
    <div className="picker" ref={ref}>
      <button
        type="button"
        className={`picker-trigger input${value ? '' : ' placeholder'}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value || '--:--'}</span>
        <Clock size={16} />
      </button>

      {open && (
        <div className="picker-pop time-pop">
          <div className="time-col">
            <span className="time-col-label">Hora</span>
            <div className="time-list">
              {HOURS.map((hh) => (
                <button
                  key={hh}
                  type="button"
                  className={`time-opt${hh === h ? ' selected' : ''}`}
                  onClick={() => onChange(`${hh}:${m || '00'}`)}
                >
                  {hh}
                </button>
              ))}
            </div>
          </div>
          <div className="time-col">
            <span className="time-col-label">Min</span>
            <div className="time-list">
              {MINUTES.map((mm) => (
                <button
                  key={mm}
                  type="button"
                  className={`time-opt${mm === m ? ' selected' : ''}`}
                  onClick={() => onChange(`${h || '00'}:${mm}`)}
                >
                  {mm}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
