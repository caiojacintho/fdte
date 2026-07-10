import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Plus, X } from 'lucide-react';
import { DateField, TimeField } from './PickerFields';
import { addTransmission, updateTransmission } from '../transmissions/store';

// Base do link de acesso ao formulário (mock — o backend gerará o link real depois).
const LINK_BASE = 'https://consulta.planehab.ba.gov.br/acesso';

function makeCode() {
  return (Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6)).toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Data de hoje no formato ISO (yyyy-mm-dd), usada para pré-preencher o campo.
function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function TransmissionButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'result' | 'quantity' | 'groups'>('form');
  const [date, setDate] = useState(todayIso);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [noEnd, setNoEnd] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [createdId, setCreatedId] = useState('');
  const [copied, setCopied] = useState(false);
  const [groups, setGroups] = useState<{ name: string; url: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function reset() {
    setStep('form');
    setDate(todayIso());
    setStart('');
    setEnd('');
    setNoEnd(false);
    setDescription('');
    setError(null);
    setUrl('');
    setCreatedId('');
    setCopied(false);
    setGroups([]);
    setCopiedIdx(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function handleStart() {
    setError(null);
    if (!date || !start || (!noEnd && !end)) {
      setError(noEnd ? 'Preencha a data e o horário inicial.' : 'Preencha a data e os horários inicial e final.');
      return;
    }
    if (!noEnd && end <= start) {
      setError('O horário final deve ser depois do inicial.');
      return;
    }
    const finalEnd = noEnd ? '' : end;
    const link = `${LINK_BASE}/${makeCode()}`;
    setUrl(link);
    const item = addTransmission({ date, start, end: finalEnd, description: description.trim(), url: link });
    setCreatedId(item.id);
    setStep('result');
  }

  // Abre a página da sessão recém-criada (fica selecionada na barra lateral).
  function goToSession() {
    if (createdId) navigate(`/transmissoes/${createdId}`);
    close();
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

  // Gera N grupos, cada um com um link de acesso próprio.
  function chooseQuantity(n: number) {
    // O número do grupo vai embutido no link (/acesso/<n>-<codigo>) para que cada
    // grupo abra o tabuleiro na sua cor no Jogo do Bairro.
    const list = Array.from({ length: n }, (_, i) => ({
      name: `Grupo ${i + 1}`,
      url: `${LINK_BASE}/${i + 1}-${makeCode()}`,
    }));
    setGroups(list);
    // Persiste os grupos na sessão para o painel poder exibi-los depois.
    if (createdId) updateTransmission(createdId, { groups: list });
    setCopiedIdx(null);
    setStep('groups');
  }

  async function copyGroup(idx: number, groupUrl: string) {
    try {
      await navigator.clipboard.writeText(groupUrl);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((cur) => (cur === idx ? null : cur)), 2000);
    } catch {
      /* clipboard indisponível — o usuário pode copiar manualmente */
    }
  }

  return (
    <>
      <button
        className="btn btn-secondary icon-btn"
        type="button"
        aria-label="Nova sessão"
        title="Nova sessão"
        onClick={() => {
          setDate(todayIso());
          setOpen(true);
        }}
      >
        <Plus size={16} />
      </button>

      {open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {step === 'form' && (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Nova sessão</h2>
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
                      <TimeField value={noEnd ? '' : end} onChange={setEnd} disabled={noEnd} />
                    </div>
                  </div>

                  <label className="checkbox-row">
                    <input type="checkbox" checked={noEnd} onChange={(e) => setNoEnd(e.target.checked)} />
                    <span>Não definir horário final</span>
                  </label>

                  <div className="field">
                    <label htmlFor="t-desc">Descrição</label>
                    <textarea
                      id="t-desc"
                      className="input"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Alguma observação sobre esta sessão"
                      style={{ resize: 'vertical', minHeight: 72 }}
                    />
                  </div>

                  {error && <span className="error-text">{error}</span>}

                  <button
                    className="btn btn-block"
                    type="button"
                    onClick={handleStart}
                    style={{ marginTop: 4, padding: '14px 16px' }}
                  >
                    Iniciar sessão
                  </button>
                </div>
              </>
            )}

            {step === 'result' && (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Sessão em andamento</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
                      O link ficará aberto em {formatDate(date)},{' '}
                      {end ? `das ${start} às ${end}` : `a partir das ${start}`}.
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

                  <button
                    className="btn btn-block"
                    type="button"
                    style={{ padding: '14px 16px' }}
                    onClick={() => setStep('quantity')}
                  >
                    Iniciar Jogo do Bairro
                  </button>
                </div>
              </>
            )}

            {step === 'quantity' && (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Jogo do Bairro</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
                      Quantos formulários você gostaria de criar?
                    </p>
                  </div>
                  <button className="modal-close" type="button" aria-label="Fechar" onClick={close}>
                    <X size={18} />
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      className="btn btn-secondary btn-block"
                      type="button"
                      onClick={() => chooseQuantity(n)}
                      style={{ padding: '14px 0', fontSize: '1.15rem', fontWeight: 600 }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'groups' && (
              <>
                <div className="modal-head">
                  <div>
                    <h2 style={{ fontSize: '1.15rem' }}>Links dos grupos</h2>
                    <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 4 }}>
                      {groups.length === 1
                        ? '1 formulário criado. Compartilhe o link com o grupo.'
                        : `${groups.length} formulários criados. Compartilhe cada link com o grupo correspondente.`}
                    </p>
                  </div>
                  <button className="modal-close" type="button" aria-label="Fechar" onClick={close}>
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  {groups.map((g, i) => (
                    <div className="field" key={i}>
                      <label>{g.name}</label>
                      <div className="copy-field">
                        <input className="input" readOnly value={g.url} onFocus={(e) => e.target.select()} />
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => copyGroup(i, g.url)}
                          aria-label={copiedIdx === i ? 'Copiado' : 'Copiar link'}
                          title={copiedIdx === i ? 'Copiado' : 'Copiar'}
                        >
                          {copiedIdx === i ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn btn-secondary btn-block"
                    type="button"
                    onClick={goToSession}
                    style={{ padding: '14px 16px' }}
                  >
                    Ver sessão
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
