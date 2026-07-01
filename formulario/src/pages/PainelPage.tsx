import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { GameHeader } from '../components/layout/GameHeader';
import { CardTray } from '../components/dnd/CardTray';
import { useBoardSensors } from '../components/dnd/sensors';
import { useSubmission } from '../submission/SubmissionContext';
import { PAINEL_CARDS, getPainelCard, type CardDef } from '../data/cards';
import { PAINEL_BOARD, PAINEL_SLOTS } from '../data/boardLayout';

const PAINEL_ZONE = 'painel-zone';

function PainelDropZone({
  getPlacedCardId,
  onRemove,
}: {
  getPlacedCardId: (board: string, slot: string) => string | null;
  onRemove: (slot: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: PAINEL_ZONE });
  const filled = PAINEL_SLOTS.map((s) => ({
    key: s.key,
    card: getPainelCard(getPlacedCardId(PAINEL_BOARD, s.key)),
  })).filter((x): x is { key: string; card: CardDef } => Boolean(x.card));

  return (
    <div ref={setNodeRef} className={`precisa-zone${isOver ? ' over' : ''}`}>
      {filled.length > 0 && (
        <span className="precisa-counter">
          {filled.length}/{PAINEL_SLOTS.length}
        </span>
      )}
      {filled.length === 0 ? (
        <span className="slot-placeholder">Arraste as cartas aqui</span>
      ) : (
        filled.map((f) => (
          <div key={f.key} className="precisa-item">
            <img src={f.card.image} alt={f.card.label} />
            <span className="precisa-item-label">{f.card.label}</span>
            <button
              type="button"
              className="precisa-item-remove"
              onClick={() => onRemove(f.key)}
              aria-label="Remover carta"
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export function PainelPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, setCard, loading } = useSubmission();
  const sensors = useBoardSensors();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showRequired, setShowRequired] = useState(false);

  const usedCardIds = useMemo(
    () =>
      new Set(
        (submission?.placements ?? []).filter((p) => p.board === PAINEL_BOARD).map((p) => p.card_id)
      ),
    [submission]
  );
  const availableCards = PAINEL_CARDS.filter((c) => !usedCardIds.has(c.id));

  const stepHasCard = PAINEL_SLOTS.some((s) => getPlacedCardId(PAINEL_BOARD, s.key));

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId((event.active.data.current as { cardId?: string } | undefined)?.cardId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = (active.data.current as { cardId?: string } | undefined)?.cardId;
    if (!cardId) return;
    const overId = String(over.id);
    if (overId === PAINEL_ZONE) {
      const empty = PAINEL_SLOTS.find((s) => !getPlacedCardId(PAINEL_BOARD, s.key));
      if (empty) setCard(PAINEL_BOARD, empty.key, cardId);
      return;
    }
    setCard(PAINEL_BOARD, overId, cardId);
  }

  function removeCard(slotKey: string) {
    setCard(PAINEL_BOARD, slotKey, null);
  }

  function handleSubmit() {
    if (!stepHasCard) {
      setShowRequired(true);
      return;
    }
    navigate('/resumo');
  }

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const draggedCard = activeCardId ? getPainelCard(activeCardId) : undefined;

  return (
    <div className="tabuleiro-page painel-page">
      <GameHeader stepLabel="Etapa 2 de 2 · Painel Nosso Bairro" />

      <div className="tabuleiro-content" style={{ padding: '20px 24px 16px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="board-columns">
            <div className="board-left-col">
              <div className="board-card">
                <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>
                  Arraste as cartas mostrando o que o seu bairro precisa
                </h3>
              </div>
              <div className="tabuleiro-board board-drop">
                <div className="board-drop-inner">
                  <PainelDropZone getPlacedCardId={getPlacedCardId} onRemove={removeCard} />
                </div>
              </div>
            </div>

            <div className="board-cards board-card">
              <CardTray cards={availableCards} />
            </div>
          </div>

          <DragOverlay>
            {draggedCard ? (
              <div className="draggable-card drag-preview">
                <img src={draggedCard.image} alt={draggedCard.label} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/jogo/tabuleiro')}>
            Voltar ao tabuleiro
          </button>
          <button
            className={`btn${stepHasCard ? '' : ' btn-locked'}`}
            type="button"
            aria-disabled={!stepHasCard}
            onClick={handleSubmit}
          >
            Revisar e enviar
          </button>
        </div>
      </div>

      {showRequired && (
        <div className="modal-overlay" onClick={() => setShowRequired(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <p className="modal-text">Selecione ao menos uma carta para continuar</p>
            <button className="btn" type="button" onClick={() => setShowRequired(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
