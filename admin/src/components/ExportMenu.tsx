import { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import type { SubmissionListItem } from '../api/client';
import { exportSubmissions, type ExportFormat } from '../lib/export';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function ExportMenu({ rows, cities }: { rows: SubmissionListItem[]; cities: string[] }) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
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

  function exportAll(format: ExportFormat) {
    exportSubmissions(rows, format, 'respostas');
    setOpen(false);
  }

  function exportByCity(format: ExportFormat) {
    if (!city) return;
    const filtered = rows.filter((r) => r.city === city);
    exportSubmissions(filtered, format, `respostas-${slugify(city)}`);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-secondary" type="button" onClick={() => setOpen((o) => !o)}>
        Exportar
      </button>

      {open && (
        <div className="menu" role="menu">
          <div className="menu-section-label">Exportar tudo</div>
          <div style={{ display: 'flex', gap: 8, padding: '2px 6px 6px' }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => exportAll('csv')}>
              <FileText size={15} />
              CSV
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => exportAll('xlsx')}>
              <FileSpreadsheet size={15} />
              Excel
            </button>
          </div>

          <div className="menu-divider" />

          <div className="menu-section-label">Exportar por cidade</div>
          <div style={{ padding: '2px 6px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Selecione a cidade…</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                disabled={!city}
                onClick={() => exportByCity('csv')}
              >
                <FileText size={15} />
                CSV
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                disabled={!city}
                onClick={() => exportByCity('xlsx')}
              >
                <FileSpreadsheet size={15} />
                Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
