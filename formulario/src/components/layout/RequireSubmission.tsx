import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubmission } from '../../submission/SubmissionContext';

// Bloqueia as telas do jogo enquanto não houver uma submissão iniciada
// (ou seja, enquanto o participante não preencher a tela de identificação).
export function RequireSubmission({ children }: { children: ReactNode }) {
  const { submission, loading } = useSubmission();

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;
  if (!submission) return <Navigate to="/" replace />;

  return <>{children}</>;
}
