import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from '../components/layout/GameHeader';
import { useSubmission } from '../submission/SubmissionContext';
import { buildImageFile, shareFile } from '../lib/share';
import { getCard } from '../data/cards';
import {
  TABULEIRO_BOARD,
  COMO_E_HOJE_SLOT,
  COMO_MUDAR_SLOT,
  PRECISA_SLOTS,
} from '../data/boardLayout';

function formatDate(raw: string | null | undefined): string {
  const d = raw ? new Date(raw.replace(' ', 'T') + 'Z') : new Date();
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
}

function MiniCard({ cardId }: { cardId: string | null }) {
  const card = getCard(cardId);
  if (!card) {
    return <div className="resumo-mini-card resumo-mini-empty" />;
  }
  return <img className="resumo-mini-card" src={card.image} alt={card.label} title={card.label} />;
}

export function ResumoPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, complete, loading } = useSubmission();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const isCompleted = submission?.status === 'completed';

  // Todas as 3 etapas precisam ter ao menos 1 carta (na etapa 3, basta 1 das 12).
  const allStepsFilled =
    Boolean(getPlacedCardId(TABULEIRO_BOARD, COMO_E_HOJE_SLOT.key)) &&
    Boolean(getPlacedCardId(TABULEIRO_BOARD, COMO_MUDAR_SLOT.key)) &&
    PRECISA_SLOTS.some((s) => getPlacedCardId(TABULEIRO_BOARD, s.key));

  async function handleSubmit() {
    setError(null);
    if (!allStepsFilled) {
      setShowIncomplete(true);
      return;
    }
    setSending(true);
    try {
      await complete();
      setShowSuccess(true);
    } catch {
      setError('Não foi possível enviar agora. Tente novamente.');
    } finally {
      setSending(false);
    }
  }

  async function handleShare() {
    setShareNote(null);
    setSharing(true);
    try {
      const file = await buildImageFile({
        name: submission?.name ?? '',
        city: submission?.city ?? '',
        entity: submission?.entity ?? '',
        dateLabel: formatDate(submission?.completed_at),
      });
      await shareFile(
        file,
        'Consulta Popular da Habitação',
        'Participei da Consulta Popular da Habitação do PLANEHAB!'
      );
    } catch {
      setShareNote('Não foi possível gerar a imagem. Tente novamente.');
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      <GameHeader stepLabel="Revisão final" />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 80px' }}>
        {isCompleted && (
          <div
            className="card-surface"
            style={{ padding: 20, marginBottom: 14, background: 'var(--color-secondary-soft)', textAlign: 'center' }}
          >
            <strong>Respostas enviadas com sucesso! Obrigado por participar. 🎉</strong>
          </div>
        )}

        {!isCompleted && (
          <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 16 }}>Revise suas respostas</h2>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
          {[
            { label: 'Como é hoje', cardId: getPlacedCardId(TABULEIRO_BOARD, COMO_E_HOJE_SLOT.key), step: 0 },
            { label: 'Como mudar', cardId: getPlacedCardId(TABULEIRO_BOARD, COMO_MUDAR_SLOT.key), step: 1 },
          ].map(({ label, cardId, step }) => {
            const card = getCard(cardId);
            return (
              <div
                key={label}
                className="card-surface resumo-field-card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}
              >
                {card ? (
                  <img
                    src={card.image}
                    alt={card.label}
                    style={{ height: 76, width: 'auto', maxWidth: 72, objectFit: 'contain' }}
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
                  <button
                    className="btn btn-ghost resumo-field-edit"
                    type="button"
                    style={{ padding: '8px 16px' }}
                    onClick={() => navigate('/jogo/tabuleiro', { state: { stepIndex: step } })}
                  >
                    Editar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="card-surface resumo-section-card" style={{ padding: 16, marginBottom: 32 }}>
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
          <div className="resumo-card-grid">
            {PRECISA_SLOTS.map((s) => getPlacedCardId(TABULEIRO_BOARD, s.key))
              .filter((id): id is string => Boolean(id))
              .map((cardId, i) => (
                <MiniCard key={i} cardId={cardId} />
              ))}
          </div>
          {!isCompleted && (
            <button
              className="btn btn-ghost resumo-section-edit"
              type="button"
              onClick={() => navigate('/jogo/tabuleiro', { state: { stepIndex: 2 } })}
            >
              Editar
            </button>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        {!isCompleted ? (
          <div className="resumo-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button className="btn btn-ghost" type="button" onClick={() => navigate('/jogo/tabuleiro')}>
              Voltar e editar
            </button>
            <button className="btn" type="button" disabled={sending} onClick={handleSubmit}>
              {sending ? 'Enviando...' : 'Enviar respostas'}
            </button>
          </div>
        ) : (
          <>
            <button
              className="btn btn-block"
              type="button"
              disabled={sharing}
              onClick={handleShare}
            >
              {sharing ? 'Gerando...' : 'Compartilhar'}
            </button>
            {shareNote && (
              <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', textAlign: 'center', marginTop: 12 }}>
                {shareNote}
              </p>
            )}
          </>
        )}
      </div>

      {showIncomplete && (
        <div className="modal-overlay" onClick={() => setShowIncomplete(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-text">
              Preencha todas as 3 etapas antes de enviar. Cada etapa precisa de pelo menos uma carta.
            </p>
            <button className="btn" type="button" onClick={() => setShowIncomplete(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Pop-up de sucesso após enviar. Compartilhar gera direto uma imagem JPG. */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: '2.8rem', lineHeight: 1 }} aria-hidden="true">
              🎉
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <p className="modal-text" style={{ whiteSpace: 'normal' }}>
                Formulário enviado com sucesso!
              </p>
              <p style={{ color: 'var(--color-ink-soft)', margin: 0 }}>
                Obrigado por participar da Consulta Popular da Habitação.
              </p>
            </div>
            <button
              className="btn"
              type="button"
              style={{ marginTop: 12 }}
              disabled={sharing}
              onClick={handleShare}
            >
              {sharing ? 'Gerando...' : 'Compartilhar'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              style={{ marginTop: -12 }}
              disabled={sharing}
              onClick={() => setShowSuccess(false)}
            >
              Concluir
            </button>
            {shareNote && (
              <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', margin: 0 }}>{shareNote}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
