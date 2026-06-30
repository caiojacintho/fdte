import type { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className="card-surface" style={{ maxWidth: 440, width: '100%', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              letterSpacing: '0.12em',
              color: 'var(--color-secondary-dark)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            PLANEHAB · Bahia
          </div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)' }}>{title}</h1>
          {subtitle && (
            <p style={{ marginTop: 8, color: 'var(--color-ink-soft)' }}>{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
