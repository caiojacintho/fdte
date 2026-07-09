import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { Header } from './Header';
import { CardTray } from './CardTray';
import { HexSlot } from './HexSlot';
import { useBoardSensors } from './sensors';
import { usePlacements } from '../lib/storage';
import { CARDS, getCard } from '../data/cards';
import { PAINEL_SLOTS, HEX_W } from '../data/boardLayout';
import { boardForCode, boardIndexFromCode } from '../data/boards';
import { api, ApiError, type BairroSubmission } from '../api/client';

type Viewer = null | 'board' | 'cards';

export function BoardPage() {
  const { code = 'demo' } = useParams();
  const sensors = useBoardSensors();
  const { placements, setCard, clearSlot } = usePlacements(code);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<Viewer>(null);

  const [remote, setRemote] = useState<BairroSubmission | null>(null);
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const boardImg = boardForCode(code);
  const boardIndex = boardIndexFromCode(code);
  const group = `Grupo ${boardIndex}`;

  // Ao abrir o link, verifica no servidor se essas respostas já foram enviadas
  // (link encerrado). Se sim, o painel entra em modo somente-leitura.
  useEffect(() => {
    let active = true;
    setChecking(true);
    api
      .getBairro(code)
      .then(({ submission }) => {
        if (active) setRemote(submission);
      })
      .catch(() => {
        /* servidor indisponível — segue no modo local */
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [code]);

  const locked = remote?.status === 'completed';
  const activePlacements = locked ? remote?.placements ?? {} : placements;

  const usedIds = useMemo(() => new Set(Object.values(activePlacements)), [activePlacements]);
  const draggedCard = activeCardId ? getCard(activeCardId) : undefined;
  const placedCount = Object.keys(activePlacements).length;

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId((event.active.data.current as { cardId?: string } | undefined)?.cardId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = (active.data.current as { cardId?: string } | undefined)?.cardId;
    if (!cardId) return;
    setCard(String(over.id), cardId);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { submission } = await api.submitBairro(code, { placements, group, board: boardIndex });
      setRemote(submission);
      setShowConfirm(false);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Não foi possível enviar. Verifique a conexão e tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const submitButton = !locked ? (
    <button
      type="button"
      className={`btn btn-sm${placedCount === 0 ? ' btn-locked' : ''}`}
      aria-disabled={placedCount === 0}
      onClick={() => placedCount > 0 && setShowConfirm(true)}
    >
      Enviar respostas
    </button>
  ) : (
    <span className="sent-tag">Respostas enviadas</span>
  );

  return (
    <div className="bairro-page">
      <Header right={checking ? null : submitButton} />

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="bairro-content">
          <div className="board-col">
            <div className={`board-card board-card-question${locked ? ' is-sent' : ''}`}>
              <div className="question-main">
                <span className="step-badge">{locked ? 'Link encerrado' : 'Jogo do Bairro'}</span>
                <h2>
                  {locked
                    ? `Respostas do ${group} enviadas. Obrigado!`
                    : 'Monte o bairro dos sonhos da sua comunidade'}
                </h2>
              </div>
              <div className="question-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewer('board')}>
                  Ver tabuleiro
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewer('cards')}>
                  Ver cartas
                </button>
              </div>
            </div>

            <div className="board-area">
              <div className="board-wrap">
                <img className="board-img" src={boardImg} alt="Painel Nosso Bairro" draggable={false} />
                {PAINEL_SLOTS.map((s) => (
                  <HexSlot
                    key={s.key}
                    slotKey={s.key}
                    cx={s.cx}
                    cy={s.cy}
                    w={HEX_W}
                    card={getCard(activePlacements[s.key])}
                    locked={locked}
                    onRemove={() => clearSlot(s.key)}
                  />
                ))}
              </div>
            </div>
          </div>

          <aside className="tray-area">
            {locked ? (
              <div className="tray-locked">
                <h3 className="tray-heading">Formulário encerrado</h3>
                <p>
                  As respostas deste grupo já foram enviadas e não podem mais ser editadas. Você pode
                  revê-las no painel ao lado.
                </p>
              </div>
            ) : (
              <>
                <h3 className="tray-heading">Cartas do bairro</h3>
                <CardTray usedIds={usedIds} />
              </>
            )}
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedCard ? (
            <div className="tray-card drag-preview">
              <img src={draggedCard.image} alt={draggedCard.label} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {viewer === 'board' && (
        <div className="viewer-overlay" onClick={() => setViewer(null)}>
          <button type="button" className="viewer-close" onClick={() => setViewer(null)} aria-label="Fechar">
            ×
          </button>
          <div className="viewer-board" onClick={(e) => e.stopPropagation()}>
            <img className="viewer-board-img" src={boardImg} alt="Painel Nosso Bairro" draggable={false} />
            {PAINEL_SLOTS.map((s) => {
              const card = getCard(activePlacements[s.key]);
              if (!card) return null;
              return (
                <div
                  key={s.key}
                  className="viewer-hex"
                  style={{ left: `${s.cx * 100}%`, top: `${s.cy * 100}%`, width: `${HEX_W * 100}%` }}
                >
                  <img src={card.image} alt={card.label} draggable={false} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewer === 'cards' && (
        <div className="viewer-overlay" onClick={() => setViewer(null)}>
          <button type="button" className="viewer-close" onClick={() => setViewer(null)} aria-label="Fechar">
            ×
          </button>
          <div className="viewer-cards" onClick={(e) => e.stopPropagation()}>
            {CARDS.map((card) => (
              <div className="viewer-card" key={card.id}>
                <img src={card.image} alt={card.label} draggable={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => !submitting && setShowConfirm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--color-ink)' }}>Enviar respostas?</h2>
            <p style={{ color: 'var(--color-ink-soft)', whiteSpace: 'normal' }}>
              Depois de enviar, o formulário do <strong>{group}</strong> será encerrado e não poderá mais
              ser editado.
            </p>
            {submitError && <span className="error-text">{submitError}</span>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                disabled={submitting}
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-block" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Enviando…' : 'Confirmar envio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
