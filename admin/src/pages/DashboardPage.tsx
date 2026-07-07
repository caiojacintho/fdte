import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, MapPin, Send, Users, X } from 'lucide-react';
import { Header } from '../components/Header';
import { ExportMenu } from '../components/ExportMenu';
import { api, type SubmissionListItem } from '../api/client';

function distinct(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );
}

export function DashboardPage() {
  const [rows, setRows] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [entity, setEntity] = useState('');

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
  const entities = useMemo(() => distinct(rows.map((r) => r.entity)), [rows]);

  const filtered = useMemo(
    () => rows.filter((r) => (!city || r.city === city) && (!entity || r.entity === entity)),
    [rows, city, entity]
  );

  const stats = useMemo(
    () => ({
      sent: filtered.filter((r) => r.status === 'completed').length,
      cities: distinct(filtered.map((r) => r.city)).length,
      entities: distinct(filtered.map((r) => r.entity)).length,
    }),
    [filtered]
  );

  const hasFilters = Boolean(city || entity);

  return (
    <div>
      <Header actions={<ExportMenu rows={rows} cities={cities} />} />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 24px 80px' }}>
        {/* Cards de estatísticas */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard
            icon={<Send size={20} />}
            tint="var(--primary)"
            tintSoft="var(--primary-soft)"
            value={stats.sent}
            label="Respostas enviadas"
          />
          <StatCard
            icon={<MapPin size={20} />}
            tint="var(--accent)"
            tintSoft="var(--accent-soft)"
            value={stats.cities}
            label="Cidades"
          />
          <StatCard
            icon={<Building2 size={20} />}
            tint="var(--warning)"
            tintSoft="var(--warning-soft)"
            value={stats.entities}
            label="Entidades"
          />
        </div>

        {/* Filtros */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            marginBottom: 16,
          }}
        >
          <div className="field" style={{ minWidth: 200 }}>
            <label htmlFor="filter-city">Cidade</label>
            <select id="filter-city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Todas as cidades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 200 }}>
            <label htmlFor="filter-entity">Entidade</label>
            <select
              id="filter-entity"
              className="input"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
            >
              <option value="">Todas as entidades</option>
              {entities.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setCity('');
                setEntity('');
              }}
            >
              <X size={16} />
              Limpar filtros
            </button>
          )}
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
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{s.email}</div>
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
  );
}

function StatCard({
  icon,
  tint,
  tintSoft,
  value,
  label,
}: {
  icon: React.ReactNode;
  tint: string;
  tintSoft: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: tintSoft, color: tint }}>
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
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
