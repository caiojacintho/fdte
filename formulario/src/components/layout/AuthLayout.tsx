import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  header,
  children,
}: {
  title: string;
  subtitle?: string;
  header?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {header}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 24px 64px',
        }}
      >
        <div className="card-surface" style={{ maxWidth: 440, width: '100%', padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)' }}>{title}</h1>
            {subtitle && <p style={{ marginTop: 8, color: 'var(--color-ink-soft)' }}>{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
