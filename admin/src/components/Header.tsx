import type { ReactNode } from 'react';
import { BrandLogos } from './BrandLogos';
import { TransmissionButton } from './TransmissionButton';
import { UserMenu } from './UserMenu';

export function Header({ tools }: { tools?: ReactNode }) {
  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <BrandLogos />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {tools}
        <TransmissionButton />
        <UserMenu />
      </div>
    </header>
  );
}
