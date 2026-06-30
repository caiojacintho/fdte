import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { SubmissionProvider } from '../../submission/SubmissionContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <SubmissionProvider>{children}</SubmissionProvider>;
}
