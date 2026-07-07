import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Header } from '../components/Header';

const CONTACTS = [
  { name: 'Caio Jacintho', email: 'caio.rodrigues.jacintho@gmail.com' },
  { name: 'Frederico Zolio', email: 'fredzolio.dev@gmail.com' },
];

export function SuportePage() {
  return (
    <div>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 24px 80px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-soft)',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <h1 style={{ fontSize: '1.4rem', margin: '18px 0 6px' }}>Suporte</h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: 22 }}>
          Em caso de dúvidas ou problemas com o painel, fale com a equipe responsável:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CONTACTS.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}`}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Mail size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{c.email}</div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
