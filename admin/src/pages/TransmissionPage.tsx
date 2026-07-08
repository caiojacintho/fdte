import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, Copy, Link as LinkIcon, Trash2, Users, X } from 'lucide-react';
import { Header } from '../components/Header';
import { TransmissionSidebar } from '../components/TransmissionSidebar';
import { ExportMenu } from '../components/ExportMenu';
import {
  deleteTransmission,
  getTransmission,
  subscribe,
  updateTransmission,
  type Transmission,
} from '../transmissions/store';
import { api, type SubmissionListItem } from '../api/client';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function distinct(values: (string | null)[]): number {
  return new Set(values.filter((v): v is string => Boolean(v && v.trim()))).size;
}

// Formata "HH:mm" como "19h" (minuto zero) ou "20h43" (minuto diferente de zero).
function formatHour(hm: string) {
  const [h, m] = hm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

// Trecho de horário que continua a frase do título ("… de 2026 das 19h às 23h").
function timePhrase(session: Transmission) {
  if (!session.start) return '';
  return session.end
    ? `das ${formatHour(session.start)} às ${formatHour(session.end)}`
    : `a partir das ${formatHour(session.start)}`;
}

// A sessão está "ao vivo" apenas se o momento atual estiver dentro do dia e do
// horário em que o link ficou aberto. Sem horário final ("aberto"), vale até o
// fim do dia da sessão. Fora desse período, considera-se encerrada.
function isSessionLive(session: Transmission): boolean {
  const now = new Date();
  const start = new Date(`${session.date}T${session.start || '00:00'}:00`);
  if (Number.isNaN(start.getTime()) || now < start) return false;
  const end = session.end
    ? new Date(`${session.date}T${session.end}:00`)
    : new Date(`${session.date}T23:59:59`);
  return now <= end;
}

// Estado da sessão para a badge: "upcoming" quando ainda não começou (data/horário
// no futuro), "live" enquanto o link está aberto, "ended" depois de encerrada.
type SessionStatus = 'live' | 'upcoming' | 'ended';
function sessionStatus(session: Transmission): SessionStatus {
  const now = new Date();
  const start = new Date(`${session.date}T${session.start || '00:00'}:00`);
  if (!Number.isNaN(start.getTime()) && now < start) return 'upcoming';
  return isSessionLive(session) ? 'live' : 'ended';
}

// Intervalo de atualização em tempo real (ms).
const POLL_MS = 4000;

export function TransmissionPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<Transmission | undefined>(() => getTransmission(id));
  const [rows, setRows] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [copiedGroupIdx, setCopiedGroupIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'etapa1' | 'etapa2'>('etapa1');

  // Recarrega os dados da sessão quando o id muda (troca de sessão na sidebar)
  // ou quando o store é alterado (ex.: grupos criados no modal de nova sessão).
  useEffect(() => {
    setSession(getTransmission(id));
    return subscribe(() => setSession(getTransmission(id)));
  }, [id]);

  // Polling: busca as respostas periodicamente para refletir, em tempo real,
  // os participantes que vão finalizando o preenchimento do formulário.
  const firstLoad = useRef(true);
  useEffect(() => {
    let active = true;
    firstLoad.current = true;
    setLoading(true);

    async function tick() {
      try {
        const { submissions } = await api.listSubmissions();
        if (!active) return;
        setRows(submissions);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Erro ao carregar as respostas.');
      } finally {
        if (active && firstLoad.current) {
          firstLoad.current = false;
          setLoading(false);
        }
      }
    }

    tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  // "Já enviaram as respostas" = submissões concluídas (mais recentes primeiro).
  const sent = useMemo(
    () =>
      rows
        .filter((r) => r.status === 'completed')
        .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? '')),
    [rows]
  );
  const inProgress = useMemo(() => rows.filter((r) => r.status === 'in_progress').length, [rows]);
  const citiesCount = useMemo(() => distinct(sent.map((r) => r.city)), [sent]);

  // Encerra a sessão: define o horário final como o momento atual, saindo do
  // "ao vivo". No back-end (futuro) é aqui que o link deixaria de funcionar.
  function endSession() {
    if (!session) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    updateTransmission(session.id, { end: `${hh}:${mm}` });
    setSession(getTransmission(session.id));
  }

  // Exclui a sessão de forma definitiva e volta ao painel geral.
  function handleDelete() {
    if (!session) return;
    deleteTransmission(session.id);
    setConfirmDelete(false);
    navigate('/');
  }

  async function copy() {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — o usuário pode copiar manualmente */
    }
  }

  async function copyGroup(idx: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGroupIdx(idx);
      setTimeout(() => setCopiedGroupIdx((cur) => (cur === idx ? null : cur)), 2000);
    } catch {
      /* clipboard indisponível — o usuário pode copiar manualmente */
    }
  }

  return (
    <div>
      <Header />
      <div className="app-body">
        <TransmissionSidebar />
        <main className="app-main" style={{ padding: '28px 24px 80px 0' }}>
          {!session ? (
            <div className="table-wrap" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-faint)' }}>
              Sessão não encontrada.
            </div>
          ) : (
            <>
              {/* Cabeçalho da sessão */}
              <div className="session-head">
                <div>
                  <div className="session-title-row">
                    <h1 className="session-title">{formatDate(session.date)}</h1>
                    <span className="session-sub">{timePhrase(session)}</span>
                    {sessionStatus(session) === 'live' ? (
                      <span className="live-badge">
                        <span className="live-dot" />
                        Ao vivo
                      </span>
                    ) : sessionStatus(session) === 'upcoming' ? (
                      <span className="live-badge upcoming">Em breve</span>
                    ) : (
                      <span className="live-badge ended">Encerrado</span>
                    )}
                  </div>
                  {session.description && <p className="session-desc">{session.description}</p>}
                </div>

                {/* Alterna entre as duas etapas (ambas exibem uma tabela) */}
                <div className="segmented" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'etapa1'}
                    className={`segmented-btn${tab === 'etapa1' ? ' active' : ''}`}
                    onClick={() => setTab('etapa1')}
                  >
                    Etapa 1
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'etapa2'}
                    className={`segmented-btn${tab === 'etapa2' ? ' active' : ''}`}
                    onClick={() => setTab('etapa2')}
                  >
                    Etapa 2
                  </button>
                </div>

                <div className="session-actions">
                  <button
                    className="btn btn-secondary icon-btn"
                    type="button"
                    aria-label="Excluir sessão"
                    title="Excluir sessão"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={16} />
                  </button>
                  {isSessionLive(session) && (
                    <button
                      className="btn btn-secondary icon-btn"
                      type="button"
                      aria-label={copied ? 'Link copiado' : 'Copiar link de acesso'}
                      title={copied ? 'Link copiado' : 'Copiar link de acesso'}
                      onClick={copy}
                    >
                      {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                    </button>
                  )}
                  <ExportMenu rows={rows} iconOnly disabled={isSessionLive(session)} />
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      setCopiedGroupIdx(null);
                      setShowGroups(true);
                    }}
                  >
                    Jogo do bairro
                  </button>
                  {isSessionLive(session) && (
                    <button className="btn" type="button" onClick={endSession}>
                      Encerrar sessão
                    </button>
                  )}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="session-row">
                <div className="session-stats">
                  <StatCard value={rows.length} label="Páginas abertas" />
                  <StatCard value={sent.length} label="Respostas enviadas" />
                  <StatCard value={inProgress} label="Em andamento" />
                  <StatCard value={citiesCount} label="Cidades" />
                </div>
              </div>

              {/* Etapa 2: lista os grupos criados para o Jogo do Bairro (no máximo 6 linhas). */}
              {tab === 'etapa2' && (
                <div className="table-wrap table-open">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Grupo</th>
                        <th>Link de acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.groups && session.groups.length > 0 ? (
                        session.groups.slice(0, 6).map((g, i) => (
                          <tr key={i}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{g.name}</div>
                            </td>
                            <td style={{ color: 'var(--text-soft)' }}>{g.url}</td>
                          </tr>
                        ))
                      ) : (
                        <EmptyRow
                          icon={<Users size={28} />}
                          message="Nenhum grupo criado para esta sessão."
                        />
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Etapa 1: participantes que já enviaram (atualiza em tempo real) */}
              {tab === 'etapa1' && (
                <>
                  <div className="table-wrap table-open">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Participante</th>
                          <th>Entidade</th>
                          <th>Cidade</th>
                          <th>Enviado em</th>
                          <th style={{ width: 40 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <EmptyRow message="Carregando…" />
                        ) : error ? (
                          <EmptyRow message={error} />
                        ) : sent.length === 0 ? (
                          <EmptyRow
                            icon={<Users size={28} />}
                            message="Aguardando os primeiros envios. Esta lista atualiza sozinha."
                          />
                        ) : (
                          sent.map((s) => (
                            <tr
                              key={s.id}
                              className="row-clickable"
                              onClick={() => navigate(`/submissoes/${s.id}`)}
                            >
                              <td>
                                <div style={{ fontWeight: 600 }}>{s.name}</div>
                              </td>
                              <td>{s.entity}</td>
                              <td>{s.city}</td>
                              <td style={{ color: 'var(--text-soft)' }}>
                                {s.completed_at ? new Date(s.completed_at).toLocaleString('pt-BR') : '—'}
                              </td>
                              <td>
                                <span style={{ display: 'inline-flex', color: 'var(--text-faint)' }}>
                                  <ChevronRight size={18} />
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {!loading && !error && sent.length > 0 && (
                    <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-faint)' }}>
                      {sent.length} {sent.length === 1 ? 'resposta enviada' : 'respostas enviadas'} · atualiza a cada{' '}
                      {POLL_MS / 1000}s
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Links dos grupos do Jogo do Bairro criados para esta sessão */}
      {showGroups && (
        <div className="modal-overlay" onClick={() => setShowGroups(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 style={{ fontSize: '1.15rem' }}>Links dos grupos</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Fechar"
                onClick={() => setShowGroups(false)}
              >
                <X size={18} />
              </button>
            </div>

            {session?.groups?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {session.groups.map((g, i) => (
                  <div className="field" key={i}>
                    <label>{g.name}</label>
                    <div className="copy-field">
                      <input
                        className="input"
                        readOnly
                        value={g.url}
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => copyGroup(i, g.url)}
                        aria-label={copiedGroupIdx === i ? 'Copiado' : 'Copiar link'}
                        title={copiedGroupIdx === i ? 'Copiado' : 'Copiar'}
                      >
                        {copiedGroupIdx === i ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem', marginTop: 12 }}>
                Nenhum formulário do Jogo do Bairro foi criado para esta sessão.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmação de exclusão da sessão */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.15rem' }}>Excluir sessão</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: 6 }}>
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e o link
              de acesso deixará de funcionar.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-secondary btn-block"
                type="button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-danger btn-block" type="button" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="stat-card stat-card-inline">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function EmptyRow({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-faint)' }}>
        {icon && <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{icon}</div>}
        {message}
      </td>
    </tr>
  );
}
