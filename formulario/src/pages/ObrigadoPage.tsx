import { Navigate, useLocation } from 'react-router-dom';
import { GameHeader } from '../components/layout/GameHeader';

export function ObrigadoPage() {
  const location = useLocation();
  const justCompleted = (location.state as { justCompleted?: boolean } | null)?.justCompleted;

  // Só chega aqui logo após enviar as respostas; num acesso direto/refresh volta para o resumo.
  if (!justCompleted) return <Navigate to="/resumo" replace />;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GameHeader />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: 16 }} aria-hidden="true">
            🎉
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary-dark)',
              fontSize: '1.8rem',
              margin: '0 0 16px',
            }}
          >
            Respostas enviadas com sucesso!
          </h1>
          <p
            style={{
              color: 'var(--color-ink-soft)',
              fontSize: '1.1rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Muito obrigado por participar da consulta popular do PLANEHAB. A sua participação é essencial: cada resposta
            ajuda a entender as reais necessidades da sua casa e do seu bairro e a priorizar o que mais importa para
            quem vive aqui. Você acaba de contribuir para a construção de uma política de habitação mais justa para
            todos.
          </p>
        </div>
      </div>
    </div>
  );
}
