import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '../components/layout/GameHeader';
import { useSubmission } from '../submission/SubmissionContext';
import { getCard, getPainelCard } from '../data/cards';
import {
  TABULEIRO_BOARD,
  PAINEL_BOARD,
  COMO_E_HOJE_SLOT,
  COMO_MUDAR_SLOT,
  PRECISA_SLOTS,
  PAINEL_SLOTS,
} from '../data/boardLayout';

function MiniCard({ cardId, painel }: { cardId: string | null; painel?: boolean }) {
  const card = painel ? getPainelCard(cardId) : getCard(cardId);
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
      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }}
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

        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>Revise suas respostas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Como é hoje', cardId: getPlacedCardId(TABULEIRO_BOARD, COMO_E_HOJE_SLOT.key), step: 0 },
            { label: 'Como mudar', cardId: getPlacedCardId(TABULEIRO_BOARD, COMO_MUDAR_SLOT.key), step: 1 },
          ].map(({ label, cardId, step }) => {
            const card = getCard(cardId);
            return (
              <div
                key={label}
                className="card-surface"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}
              >
                {card ? (
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{
                      height: 76,
                      width: 'auto',
                      maxWidth: 72,
                      borderRadius: 8,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <MiniCard cardId={null} />
                )}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.8rem',
                      color: 'var(--color-ink-faint)',
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                  <strong style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
                    {card?.label ?? '—'}
                  </strong>
                </div>
                {!isCompleted && (
                  <div style={{ display: 'flex', alignItems: 'center', paddingRight: 16 }}>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      style={{ padding: '8px 16px' }}
                      onClick={() => navigate('/jogo/tabuleiro', { state: { stepIndex: step } })}
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card-surface" style={{ padding: 16, marginBottom: 24, position: 'relative' }}>
          {!isCompleted && (
            <button
              className="btn btn-ghost"
              type="button"
              style={{ position: 'absolute', top: 16, right: 16, padding: '8px 16px' }}
              onClick={() => navigate('/jogo/tabuleiro', { state: { stepIndex: 2 } })}
            >
              Editar
            </button>
          )}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              color: 'var(--color-ink-faint)',
              margin: '0 0 12px',
            }}
          >
            O que minha casa precisa
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PRECISA_SLOTS.map((s) => getPlacedCardId(TABULEIRO_BOARD, s.key))
              .filter((id): id is string => Boolean(id))
              .map((cardId, i) => (
                <MiniCard key={i} cardId={cardId} />
              ))}
          </div>
        </div>

        <div className="card-surface" style={{ padding: 16, marginBottom: 32, position: 'relative' }}>
          {!isCompleted && (
            <button
              className="btn btn-ghost"
              type="button"
              style={{ position: 'absolute', top: 16, right: 16, padding: '8px 16px' }}
              onClick={() => navigate('/jogo/tabuleiro', { state: { stepIndex: 3 } })}
            >
              Editar
            </button>
          )}
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              color: 'var(--color-ink-faint)',
              margin: '0 0 12px',
            }}
          >
            O que o meu bairro precisa
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {PAINEL_SLOTS.map((s) => getPlacedCardId(PAINEL_BOARD, s.key))
              .filter((id): id is string => Boolean(id))
              .map((cardId, i) => (
                <MiniCard key={i} painel cardId={cardId} />
              ))}
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {!isCompleted ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button className="btn btn-ghost" type="button" onClick={() => navigate('/jogo/tabuleiro')}>
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
