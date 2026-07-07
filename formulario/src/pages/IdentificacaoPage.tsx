import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubmission } from '../submission/SubmissionContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { BrandHeader } from '../components/layout/BrandHeader';
import { ApiError } from '../api/client';
import { CIDADES_BAHIA } from '../data/citiesBahia';

export function IdentificacaoPage() {
  const { start } = useSubmission();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', city: '', entity: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.city || !form.entity.trim()) {
      setError('Preencha nome, cidade e entidade.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await start(form);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível continuar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Consulta Popular da Habitação" header={<BrandHeader />}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label htmlFor="name">Nome completo</label>
          <input id="name" required value={form.name} onChange={update('name')} placeholder="Seu nome" />
        </div>
        <div className="field">
          <label htmlFor="city">Cidade</label>
          <select id="city" required value={form.city} onChange={update('city')}>
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
            required
            value={form.entity}
            onChange={update('entity')}
            placeholder="Associação, movimento, órgão..."
          />
        </div>
        {error && <span className="error-text">{error}</span>}
        <button className="btn btn-block" type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Carregando...' : 'Continuar'}
        </button>
      </form>
    </AuthLayout>
  );
}
