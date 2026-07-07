import { useState } from 'react';
import { Check, Copy, Plus, X } from 'lucide-react';
import { DateField, TimeField } from './PickerFields';

// Base do link de acesso ao formulário (mock — o backend gerará o link real depois).
const LINK_BASE = 'https://consulta.planehab.ba.gov.br/acesso';

function makeCode() {
  return (
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6)
  ).toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function TransmissionButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  function reset() {
    setStep('form');
    setDate('');
    setStart('');
    setEnd('');
    setError(null);
    setUrl('');
    setCopied(false);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function handleStart() {
    setError(null);
    if (!date || !start || !end) {
      setError('Preencha a data e os horários inicial e final.');
      return;
    }
    if (end <= start) {
      setError('O horário final deve ser depois do inicial.');
      return;
    }
    setUrl(`${LINK_BASE}/${makeCode()}`);
    setStep('result');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — o usuário pode copiar manualmente */
    }
  }

  return (
    <>
      <button
        className="btn btn-secondary icon-btn"
        type="button"
        aria-label="Nova transmissão"
        title="Nova transmissão"
        onClick={() => setOpen(true)}
      >
        <Plus size={20} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {step === 'form' ? (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Nova transmissão</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
                      Defina quando o link de acesso ao formulário ficará aberto.
                    </p>
                  </div>
                  <button className="modal-close" type="button" aria-label="Fechar" onClick={close}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  <div className="field">
                    <label>Data</label>
                    <DateField value={date} onChange={setDate} />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Horário inicial</label>
                      <TimeField value={start} onChange={setStart} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Horário final</label>
                      <TimeField value={end} onChange={setEnd} />
                    </div>
                  </div>

                  {error && <span className="error-text">{error}</span>}

                  <button className="btn btn-block" type="button" onClick={handleStart} style={{ marginTop: 4, padding: '14px 16px' }}>
                    Iniciar transmissão
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Transmissão criada</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
                      O link ficará aberto em {formatDate(date)}, das {start} às {end}.
                    </p>
                  </div>
                  <button className="modal-close" type="button" aria-label="Fechar" onClick={close}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  <div className="field">
                    <label htmlFor="t-url">Link de acesso</label>
                    <div className="copy-field">
                      <input id="t-url" className="input" readOnly value={url} onFocus={(e) => e.target.select()} />
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={copy}
                        aria-label={copied ? 'Copiado' : 'Copiar link'}
                        title={copied ? 'Copiado' : 'Copiar'}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-block" type="button" style={{ padding: '14px 16px' }}>
                    Iniciar Jogo do Bairro
                  </button>

                  <button className="btn btn-secondary btn-block" type="button" onClick={close} style={{ padding: '14px 16px', marginTop: -6 }}>
                    Concluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
