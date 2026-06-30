import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { GameHeader } from '../components/layout/GameHeader';
import { CardTray } from '../components/dnd/CardTray';
import { HexSlot } from '../components/dnd/HexSlot';
import { useBoardSensors } from '../components/dnd/sensors';
import { useSubmission } from '../submission/SubmissionContext';
import { CARDS, getCard } from '../data/cards';
import { PAINEL_BOARD, PAINEL_SLOTS } from '../data/boardLayout';

const ROWS = [
  PAINEL_SLOTS.slice(0, 3),
  PAINEL_SLOTS.slice(3, 7),
  PAINEL_SLOTS.slice(7, 10),
  PAINEL_SLOTS.slice(10, 13),
];

export function PainelPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, setCard, loading } = useSubmission();
  const sensors = useBoardSensors();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const usedCardIds = useMemo(
    () =>
      new Set(
        (submission?.placements ?? []).filter((p) => p.board === PAINEL_BOARD).map((p) => p.card_id)
      ),
    [submission]
  );
  const availableCards = CARDS.filter((c) => !usedCardIds.has(c.id));

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId((event.active.data.current as { cardId?: string } | undefined)?.cardId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = (active.data.current as { cardId?: string } | undefined)?.cardId;
    if (!cardId) return;
    setCard(PAINEL_BOARD, String(over.id), cardId);
  }

  function removeCard(slotKey: string) {
    setCard(PAINEL_BOARD, slotKey, null);
  }

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const draggedCard = activeCardId ? getCard(activeCardId) : undefined;

  return (
    <div>
      <GameHeader stepLabel="Etapa 2 de 2 · Painel Nosso Bairro" />

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 6 }}>Nosso Bairro</h2>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>
          Arraste as cartas de equipamentos, infraestrutura, mobilidade, segurança e riscos para os espaços do
          favo, mostrando o que o seu bairro precisa.
        </p>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="painel-board">
            <div className="hex-grid">
              {ROWS.map((row, i) => (
                <div key={i} className={`hex-row${i > 0 ? ' offset' : ''}`}>
                  {row.map((slot) => (
                    <HexSlot
                      key={slot.key}
                      id={slot.key}
                      card={getCard(getPlacedCardId(PAINEL_BOARD, slot.key)) ?? undefined}
                      onRemove={() => removeCard(slot.key)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ margin: '28px 0 12px', color: 'var(--color-ink-soft)' }}>Cartas disponíveis</h3>
          <CardTray cards={availableCards} />

          <DragOverlay>
            {draggedCard ? (
              <div className="draggable-card">
                <img src={draggedCard.image} alt={draggedCard.label} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button className="btn btn-ghost" type="button" onClick={() => navigate('/jogo/tabuleiro')}>
            Voltar ao tabuleiro
          </button>
          <button className="btn" type="button" onClick={() => navigate('/resumo')}>
            Revisar e enviar
          </button>
        </div>
      </div>
    </div>
  );
}
