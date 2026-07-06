import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { BrandHeader } from '../components/layout/BrandHeader';
import { ApiError } from '../api/client';
import { CIDADES_BAHIA } from '../data/citiesBahia';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', entity: '', city: '', cpf: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function formatCpf(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function updateCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, cpf: formatCpf(e.target.value) }));
  }

  function goToStep2() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Preencha nome, e-mail e senha.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Crie sua conta" subtitle={`Etapa ${step} de 2`} header={<BrandHeader />}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {step === 1 ? (
          <>
            <div className="field">
              <label htmlFor="name">Nome completo</label>
              <input id="name" required value={form.name} onChange={update('name')} placeholder="Seu nome" />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update('email')}
                placeholder="seu@email.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update('password')}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {error && <span className="error-text">{error}</span>}
            <button className="btn btn-block" type="button" onClick={goToStep2}>
              Continuar
            </button>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                required
                inputMode="numeric"
                value={form.cpf}
                onChange={updateCpf}
                placeholder="000.000.000-00"
              />
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
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-ghost"
                type="button"
                style={{ flex: 1 }}
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                Voltar
              </button>
              <button className="btn" type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </>
        )}
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-ink-soft)' }}>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
