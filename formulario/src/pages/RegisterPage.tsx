import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ApiError } from '../api/client';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', entity: '', city: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
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
    <AuthLayout title="Crie sua conta" subtitle="Para participar da consulta popular da habitação">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label htmlFor="name">Nome completo</label>
          <input id="name" required value={form.name} onChange={update('name')} placeholder="Seu nome" />
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
        <div className="field">
          <label htmlFor="city">Cidade</label>
          <input id="city" required value={form.city} onChange={update('city')} placeholder="Sua cidade" />
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
        <button className="btn btn-block" type="submit" disabled={loading}>
          {loading ? 'Criando conta...' : 'Criar conta e continuar'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--color-ink-soft)' }}>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
