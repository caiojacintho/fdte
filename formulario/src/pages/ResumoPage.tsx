import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '../components/layout/GameHeader';
import { useSubmission } from '../submission/SubmissionContext';
import { getCard } from '../data/cards';
import {
  TABULEIRO_BOARD,
  PAINEL_BOARD,
  COMO_E_HOJE_SLOT,
  COMO_MUDAR_SLOT,
  PRECISA_SLOTS,
  PAINEL_SLOTS,
} from '../data/boardLayout';

function MiniCard({ cardId }: { cardId: string | null }) {
  const card = getCard(cardId);
  if (!card) {
    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          border: '2px dashed var(--color-ink-faint)',
        }}
      />
    );
  }
  return (
    <img
      src={card.image}
      alt={card.label}
      title={card.label}
      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--color-ink)' }}
    />
  );
}

export function ResumoPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, complete, loading } = useSubmission();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const isCompleted = submission?.status === 'completed';
  const precisaCount = PRECISA_SLOTS.filter((s) => getPlacedCardId(TABULEIRO_BOARD, s.key)).length;
  const painelCount = PAINEL_SLOTS.filter((s) => getPlacedCardId(PAINEL_BOARD, s.key)).length;

  async function handleSubmit() {
    setError(null);
    setSending(true);
    try {
      await complete();
    } catch {
      setError('Não foi possível enviar agora. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <GameHeader stepLabel="Revisão final" />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 80px' }}>
        {isCompleted && (
          <div
            className="card-surface"
            style={{ padding: 20, marginBottom: 24, background: 'var(--color-secondary-soft)', textAlign: 'center' }}
          >
            <strong>Respostas enviadas com sucesso! Obrigado por participar. 🎉</strong>
          </div>
        )}

        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>Tabuleiro da minha casa</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 8 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', marginBottom: 6 }}>Como é hoje</p>
            <MiniCard cardId={getPlacedCardId(TABULEIRO_BOARD, COMO_E_HOJE_SLOT.key)} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', marginBottom: 6 }}>Como mudar</p>
            <MiniCard cardId={getPlacedCardId(TABULEIRO_BOARD, COMO_MUDAR_SLOT.key)} />
          </div>
        </div>

        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', margin: '16px 0 6px' }}>
          O que minha casa precisa ({precisaCount}/12)
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {PRECISA_SLOTS.map((s) => (
            <MiniCard key={s.key} cardId={getPlacedCardId(TABULEIRO_BOARD, s.key)} />
          ))}
        </div>

        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>
          Painel Nosso Bairro ({painelCount}/13)
        </h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
          {PAINEL_SLOTS.map((s) => (
            <MiniCard key={s.key} cardId={getPlacedCardId(PAINEL_BOARD, s.key)} />
          ))}
        </div>

        {error && <p className="error-text">{error}</p>}

        {!isCompleted ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button className="btn btn-ghost" type="button" onClick={() => navigate('/jogo/painel')}>
              Voltar e editar
            </button>
            <button className="btn" type="button" disabled={sending} onClick={handleSubmit}>
              {sending ? 'Enviando...' : 'Enviar respostas'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--color-ink-soft)', textAlign: 'center' }}>
            Suas respostas já foram registradas e não podem mais ser alteradas.
          </p>
        )}
      </div>
    </div>
  );
}
