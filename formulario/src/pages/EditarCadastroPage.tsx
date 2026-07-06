import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '../components/layout/GameHeader';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { CIDADES_BAHIA } from '../data/citiesBahia';

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function EditarCadastroPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    cpf: formatCpf(user?.cpf ?? ''),
    city: user?.city ?? '',
    entity: user?.entity ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: 'name' | 'city' | 'entity') {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.city.trim() || !form.entity.trim() || !form.cpf.trim()) {
      setError('Preencha nome, CPF, cidade e entidade.');
      return;
    }
    if (form.cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF inválido. Informe os 11 dígitos.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name: form.name,
        entity: form.entity,
        city: form.city,
        cpf: form.cpf,
      });
      navigate(-1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <GameHeader />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>Editar informações</h2>
        <form
          onSubmit={handleSubmit}
          className="card-surface"
          style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}
        >
          <div className="field">
            <label htmlFor="name">Nome completo</label>
            <input id="name" value={form.name} onChange={update('name')} placeholder="Seu nome" />
          </div>
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              inputMode="numeric"
              value={form.cpf}
              onChange={updateCpf}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select id="city" value={form.city} onChange={update('city')}>
              <option value="" disabled>
                Selecione sua cidade
              </option>
              {CIDADES_BAHIA.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="entity">Entidade</label>
            <input
              id="entity"
              value={form.entity}
              onChange={update('entity')}
              placeholder="Associação, movimento, órgão..."
            />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail (não pode ser alterado)</label>
            <input id="email" type="email" value={user?.email ?? ''} disabled readOnly />
          </div>

          {error && <span className="error-text">{error}</span>}

          <div className="editar-actions" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              className="btn btn-ghost"
              type="button"
              style={{ flex: 1 }}
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
            <button className="btn" type="submit" disabled={loading} style={{ flex: 1 }}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
