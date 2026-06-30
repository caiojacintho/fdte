import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { api, type StatsDTO, type SubmissionListItem } from '../api/client';
import { CATEGORY_COLORS, CATEGORY_LABELS, getCard } from '../data/cards';

export function DashboardPage() {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [filters, setFilters] = useState({ entity: '', city: '', status: '' });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [{ submissions }, statsData] = await Promise.all([api.listSubmissions(filters), api.getStats()]);
      setSubmissions(submissions);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  const topCards = (stats?.cardCounts ?? []).slice(0, 8);

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <StatCard label="Submissões" value={stats?.totals.total_submissions ?? '—'} />
          <StatCard label="Concluídas" value={stats?.totals.completed_submissions ?? '—'} />
          <StatCard label="Cidades" value={stats?.totals.total_cities ?? '—'} />
          <StatCard label="Entidades" value={stats?.totals.total_entities ?? '—'} />
        </div>

        {topCards.length > 0 && (
          <div className="card-surface" style={{ padding: 20, marginBottom: 28 }}>
            <h3 style={{ marginBottom: 14, color: 'var(--color-primary-dark)' }}>Itens mais escolhidos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topCards.map((c) => {
                const card = getCard(c.card_id);
                const max = topCards[0].total || 1;
                return (
                  <div key={`${c.board}-${c.card_id}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 150, fontSize: '0.85rem' }}>{card?.label ?? c.card_id}</span>
                    <div style={{ flex: 1, background: 'var(--color-bg)', borderRadius: 6, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(c.total / max) * 100}%`,
                          background: card ? CATEGORY_COLORS[card.category] : 'var(--color-ink-faint)',
                          height: 14,
                        }}
                      />
                    </div>
                    <span style={{ width: 24, textAlign: 'right', fontSize: '0.85rem' }}>{c.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: 'var(--color-primary-dark)' }}>Submissões</h2>
          <button className="btn btn-secondary" type="button" onClick={() => api.downloadExportCsv()}>
            Exportar CSV
          </button>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}
        >
          <input
            placeholder="Filtrar por entidade"
            value={filters.entity}
            onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: '2px solid var(--color-ink-faint)' }}
          />
          <input
            placeholder="Filtrar por cidade"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: '2px solid var(--color-ink-faint)' }}
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: '2px solid var(--color-ink-faint)' }}
          >
            <option value="">Todos os status</option>
            <option value="in_progress">Em andamento</option>
            <option value="completed">Concluídas</option>
          </select>
          <button className="btn btn-ghost" type="submit">
            Filtrar
          </button>
        </form>

        <div className="card-surface" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-deep)', textAlign: 'left' }}>
                <Th>Nome</Th>
                <Th>Entidade</Th>
                <Th>Cidade</Th>
                <Th>Status</Th>
                <Th>Atualizado em</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>
                    Carregando...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>
                    Nenhuma submissão encontrada.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--color-bg-deep)' }}>
                    <Td>{s.name}</Td>
                    <Td>{s.entity}</Td>
                    <Td>{s.city}</Td>
                    <Td>
                      <span
                        className="badge"
                        style={
                          s.status === 'completed'
                            ? { background: '#d9efda', color: 'var(--color-success)' }
                            : undefined
                        }
                      >
                        {s.status === 'completed' ? 'Concluída' : 'Em andamento'}
                      </span>
                    </Td>
                    <Td>{new Date(s.updated_at).toLocaleString('pt-BR')}</Td>
                    <Td>
                      <Link to={`/submissoes/${s.id}`} style={{ color: 'var(--color-secondary-dark)', fontWeight: 700 }}>
                        Ver detalhes →
                      </Link>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 18, fontSize: '0.8rem', color: 'var(--color-ink-faint)' }}>
          Categorias: {Object.entries(CATEGORY_LABELS).map(([k, v]) => v).join(' · ')}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card-surface" style={{ padding: '16px 24px', minWidth: 140 }}>
      <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary-dark)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{label}</div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th style={{ padding: '12px 16px', fontFamily: 'var(--font-heading)', fontSize: '0.8rem' }}>{children}</th>
  );
}

function Td({ children }: { children?: React.ReactNode }) {
  return <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{children}</td>;
}
