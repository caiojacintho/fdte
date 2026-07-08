import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import type { SubmissionListItem } from '../api/client';
import { exportSubmissions, type ExportFormat } from '../lib/export';

export function ExportMenu({
  rows,
  iconOnly = false,
  disabled = false,
}: {
  rows: SubmissionListItem[];
  iconOnly?: boolean;
  disabled?: boolean;
}) {
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

  function exportAll(format: ExportFormat) {
    exportSubmissions(rows, format, 'respostas');
    setOpen(false);
  }

  return (
    <div ref={ref} className="export-menu" style={{ position: 'relative' }}>
      {iconOnly ? (
        <button
          className="btn btn-secondary icon-btn"
          type="button"
          aria-label="Exportar"
          title={disabled ? undefined : 'Exportar'}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          className="btn btn-secondary"
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          Exportar
        </button>
      )}

      {disabled && (
        <span className="export-tooltip" role="tooltip">
          A exportação só será liberada depois que a sessão for encerrada.
        </span>
      )}

      {open && (
        <div className="menu" role="menu">
          <div className="menu-section-label">Exportar tudo</div>
          <div style={{ display: 'flex', gap: 8, padding: '2px 6px 6px' }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, aspectRatio: '1.7', flexDirection: 'column', gap: 6, borderRadius: 8 }}
              onClick={() => exportAll('csv')}
            >
              <FileText size={17} />
              CSV
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, aspectRatio: '1.7', flexDirection: 'column', gap: 6, borderRadius: 8 }}
              onClick={() => exportAll('xlsx')}
            >
              <FileSpreadsheet size={17} />
              Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
