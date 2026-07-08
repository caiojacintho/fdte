import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { Header } from '../components/Header';
import { TransmissionSidebar } from '../components/TransmissionSidebar';
import { CitySelect } from '../components/CitySelect';
import { ExportMenu } from '../components/ExportMenu';
import { api, type SubmissionListItem } from '../api/client';

function distinct(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .listSubmissions()
      .then(({ submissions }) => {
        if (active) setRows(submissions);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Erro ao carregar dados.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(() => distinct(rows.map((r) => r.city)), [rows]);

  const filtered = useMemo(() => rows.filter((r) => !city || r.city === city), [rows, city]);

  const stats = useMemo(
    () => ({
      opened: filtered.length,
      sent: filtered.filter((r) => r.status === 'completed').length,
      inProgress: filtered.filter((r) => r.status === 'in_progress').length,
      cities: distinct(filtered.map((r) => r.city)).length,
    }),
    [filtered]
  );

  const hasFilters = Boolean(city);

  return (
    <div>
      <Header
        tools={<CitySelect value={city} cities={cities} onChange={setCity} />}
      />

      <div className="app-body">
        <TransmissionSidebar />
        <main className="app-main" style={{ padding: '28px 24px 80px' }}>
        {/* Título da página + exportar todos os dados */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <h1 className="session-title">Todas as sessões</h1>
          <ExportMenu rows={rows} iconOnly />
        </div>

        {/* Cards de estatísticas */}
        <div className="session-row">
          <div className="session-stats">
            <StatCard value={stats.opened} label="Páginas abertas" />
            <StatCard value={stats.sent} label="Respostas enviadas" />
            <StatCard value={stats.inProgress} label="Em andamento" />
            <StatCard value={stats.cities} label="Cidades" />
          </div>
        </div>

        {/* Tabela */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Entidade</th>
                <th>Cidade</th>
                <th>Status</th>
                <th>Enviado em</th>
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyRow message="Carregando…" />
              ) : error ? (
                <EmptyRow message={error} />
              ) : filtered.length === 0 ? (
                <EmptyRow
                  icon={<Users size={28} />}
                  message={
                    rows.length === 0
                      ? 'Nenhuma resposta recebida ainda.'
                      : 'Nenhuma resposta corresponde aos filtros.'
                  }
                />
              ) : (
                filtered.map((s) => (
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
                    <td>
                      {s.status === 'completed' ? (
                        <span className="badge badge-success">Enviada</span>
                      ) : (
                        <span className="badge badge-warning">Em andamento</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-soft)' }}>
                      {s.completed_at ? new Date(s.completed_at).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td>
                      <Link
                        to={`/submissoes/${s.id}`}
                        aria-label={`Ver detalhes de ${s.name}`}
                        style={{ display: 'inline-flex', color: 'var(--text-faint)' }}
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && filtered.length > 0 && (
          <p style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-faint)' }}>
            {filtered.length} {filtered.length === 1 ? 'resposta' : 'respostas'}
            {hasFilters ? ` (de ${rows.length})` : ''}
          </p>
        )}
        </main>
      </div>
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
      <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-faint)' }}>
        {icon && <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{icon}</div>}
        {message}
      </td>
    </tr>
  );
}
