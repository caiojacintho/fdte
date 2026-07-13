import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronRight, Copy, Trash2, Users, X } from 'lucide-react';
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
import { api } from '../api/client';
import type { SubmissionListItem, BairroSubmission } from '@fdte/shared-types';
import { codeFromUrl } from '../data/bairroCards';
import { BairroBoardPreview } from '../components/BairroBoardPreview';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
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
  const end = session.end ? new Date(`${session.date}T${session.end}:00`) : new Date(`${session.date}T23:59:59`);
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
  const [bairroRows, setBairroRows] = useState<BairroSubmission[]>([]);
  const [viewGroup, setViewGroup] = useState<{ name: string; sub: BairroSubmission } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const [subs, bairro] = await Promise.all([
          api.listSubmissions(),
          api.listBairroSubmissions().catch(() => ({ submissions: [] as BairroSubmission[] })),
        ]);
        if (!active) return;
        setRows(subs.submissions);
        setBairroRows(bairro.submissions);
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

  // Casa cada grupo (pelo código do link) com a resposta enviada no Jogo do Bairro.
  const bairroByCode = useMemo(() => {
    const m = new Map<string, BairroSubmission>();
    bairroRows.forEach((b) => m.set(b.code, b));
    return m;
  }, [bairroRows]);

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
            <div
              className="table-wrap"
              style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-faint)' }}
            >
              Sessão não encontrada.
            </div>
          ) : (
            <div className="session-panel">
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
                  {/* Alterna entre as duas etapas — abaixo do título, alinhado à esquerda.
                      O botão "Jogo do bairro" acompanha as abas e só aparece na Etapa 2. */}
                  <div className="etapa-row">
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
                  </div>
                </div>

                <div className="session-head-side">
                  {/* "Encerrar sessão" no topo, alinhado ao título. */}
                  {isSessionLive(session) && (
                    <button className="btn" type="button" onClick={endSession}>
                      Encerrar sessão
                    </button>
                  )}
                  {/* Ícones embaixo, na linha do segmented control. O botão de
                      links fica à esquerda da lixeira. */}
                  <div className="session-actions">
                    <button
                      className="btn btn-secondary btn-inline"
                      type="button"
                      onClick={() => {
                        setCopiedGroupIdx(null);
                        setShowGroups(true);
                      }}
                    >
                      Link
                    </button>
                    <button
                      className="btn btn-secondary icon-btn"
                      type="button"
                      aria-label="Excluir sessão"
                      title="Excluir sessão"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <ExportMenu rows={rows} iconOnly disabled={isSessionLive(session)} />
                  </div>
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
                        <th>Resposta</th>
                        <th style={{ width: 40 }} />
                      </tr>
                    </thead>
                    <tbody>
                      {session.groups && session.groups.length > 0 ? (
                        session.groups.slice(0, 6).map((g, i) => {
                          const sub = bairroByCode.get(codeFromUrl(g.url));
                          const done = sub?.status === 'completed';
                          const count = sub ? Object.keys(sub.placements).length : 0;
                          return (
                            <tr
                              key={i}
                              className={done ? 'row-clickable' : ''}
                              onClick={done && sub ? () => setViewGroup({ name: g.name, sub }) : undefined}
                            >
                              <td>
                                <div style={{ fontWeight: 600 }}>{g.name}</div>
                              </td>
                              <td style={{ color: 'var(--text-soft)' }}>{g.url}</td>
                              <td>
                                {done ? (
                                  <span
                                    className="live-badge ended"
                                    style={{ background: 'var(--ok-soft, #e3f3e4)', color: '#2f7a34' }}
                                  >
                                    Enviada · {count} {count === 1 ? 'carta' : 'cartas'}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-faint)' }}>Aguardando</span>
                                )}
                              </td>
                              <td>
                                {done && (
                                  <span style={{ display: 'inline-flex', color: 'var(--text-faint)' }}>
                                    <ChevronRight size={18} />
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <EmptyRow icon={<Users size={28} />} message="Nenhum grupo criado para esta sessão." />
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
                            <tr key={s.id} className="row-clickable" onClick={() => navigate(`/submissoes/${s.id}`)}>
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

                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Links de acesso: Etapa 1 (Jogo da Moradia = link do formulário da sessão)
          ou Etapa 2 (Jogo do bairro = um link por grupo). */}
      {showGroups && (
        <div className="modal-overlay" onClick={() => setShowGroups(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 style={{ fontSize: '1.15rem' }}>{tab === 'etapa1' ? 'Jogo da Moradia' : 'Jogo do bairro'}</h2>
              </div>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setShowGroups(false)}>
                <X size={18} />
              </button>
            </div>

            {tab === 'etapa1' ? (
              <div style={{ marginTop: 16 }}>
                <div className="field">
                  <label>Link de acesso</label>
                  <div className="copy-field">
                    <input
                      className="input"
                      readOnly
                      value={session?.url ?? ''}
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => copyGroup(0, session?.url ?? '')}
                      aria-label={copiedGroupIdx === 0 ? 'Copiado' : 'Copiar link'}
                      title={copiedGroupIdx === 0 ? 'Copiado' : 'Copiar'}
                    >
                      {copiedGroupIdx === 0 ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : session?.groups?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {session.groups.map((g, i) => (
                  <div className="field" key={i}>
                    <label>{g.name}</label>
                    <div className="copy-field">
                      <input className="input" readOnly value={g.url} onFocus={(e) => e.target.select()} />
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

      {/* Respostas enviadas por um grupo no Jogo do Bairro */}
      {viewGroup && (
        <div className="modal-overlay" onClick={() => setViewGroup(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2 style={{ fontSize: '1.15rem' }}>{viewGroup.name} — respostas</h2>
                <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', marginTop: 4 }}>
                  {viewGroup.sub.completed_at
                    ? `Enviadas em ${new Date(viewGroup.sub.completed_at).toLocaleString('pt-BR')}`
                    : ''}
                </p>
              </div>
              <button className="modal-close" type="button" aria-label="Fechar" onClick={() => setViewGroup(null)}>
                <X size={18} />
              </button>
            </div>

            {Object.keys(viewGroup.sub.placements).length === 0 ? (
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginTop: 12 }}>
                Este grupo enviou o painel sem cartas.
              </p>
            ) : (
              <BairroBoardPreview board={viewGroup.sub.board} placements={viewGroup.sub.placements} />
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
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita e o link de acesso deixará de
              funcionar.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary btn-block" type="button" onClick={() => setConfirmDelete(false)}>
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
