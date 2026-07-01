import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, useDroppable, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { GameHeader } from '../components/layout/GameHeader';
import { CardTray } from '../components/dnd/CardTray';
import { Slot } from '../components/dnd/Slot';
import { useBoardSensors } from '../components/dnd/sensors';
import { useSubmission } from '../submission/SubmissionContext';
import {
  CARDS,
  PAINEL_CARDS,
  getCard,
  getPainelCard,
  type CardCategory,
  type CardDef,
} from '../data/cards';
import {
  TABULEIRO_BOARD,
  PAINEL_BOARD,
  COMO_E_HOJE_SLOT,
  COMO_MUDAR_SLOT,
  PRECISA_SLOTS,
  PAINEL_SLOTS,
} from '../data/boardLayout';

const LIST_ZONE = 'list-zone';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

type StepDef = {
  key: string;
  instructions: string;
  board: string;
  kind: 'rect' | 'circle' | 'list';
  slot?: string;
  slots?: readonly { key: string }[];
};

const STEPS: StepDef[] = [
  {
    key: 'como_e_hoje',
    instructions: 'Escolha 1 carta que melhor representa como é a sua moradia hoje',
    board: TABULEIRO_BOARD,
    kind: 'rect',
    slot: COMO_E_HOJE_SLOT.key,
  },
  {
    key: 'como_mudar',
    instructions: 'Escolha 1 carta com a mudança mais importante para a sua casa',
    board: TABULEIRO_BOARD,
    kind: 'circle',
    slot: COMO_MUDAR_SLOT.key,
  },
  {
    key: 'precisa',
    instructions: 'Escolha até 12 cartas com o que a sua casa mais precisa',
    board: TABULEIRO_BOARD,
    kind: 'list',
    slots: PRECISA_SLOTS,
  },
  {
    key: 'painel',
    instructions: 'Arraste as cartas mostrando o que o seu bairro precisa',
    board: PAINEL_BOARD,
    kind: 'list',
    slots: PAINEL_SLOTS,
  },
];

const STEP_CATEGORY: Record<string, CardCategory> = {
  como_e_hoje: 'tipologia',
  como_mudar: 'mudanca',
};

function ListDropZone({
  slots,
  board,
  lookupCard,
  getPlacedCardId,
  onRemove,
  onSwap,
  placeholder,
}: {
  slots: readonly { key: string }[];
  board: string;
  lookupCard: (id: string | null | undefined) => CardDef | undefined;
  getPlacedCardId: (board: string, slot: string) => string | null;
  onRemove: (slot: string) => void;
  onSwap: (slotA: string, slotB: string) => void;
  placeholder: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: LIST_ZONE });
  const filled = slots
    .map((s) => ({ key: s.key, card: lookupCard(getPlacedCardId(board, s.key)) }))
    .filter((x): x is { key: string; card: CardDef } => Boolean(x.card));

  return (
    <div ref={setNodeRef} className={`precisa-zone${isOver ? ' over' : ''}`}>
      {filled.length > 0 && (
        <span className="precisa-counter">
          {filled.length}/{slots.length}
        </span>
      )}
      {filled.length === 0 ? (
        <span className="slot-placeholder">{placeholder}</span>
      ) : (
        filled.map((f, i) => (
          <div key={f.key} className="precisa-item">
            <span className="precisa-item-order">{i + 1}</span>
            <div className="precisa-item-arrows">
              <button
                type="button"
                className="precisa-arrow"
                onClick={() => i > 0 && onSwap(f.key, filled[i - 1].key)}
                disabled={i === 0}
                aria-label="Mover para cima"
              >
                <svg className="precisa-arrow-icon" viewBox="0 0 14 12" aria-hidden="true">
                  <path d="M7 2.5 L12 9.5 L2 9.5 Z" />
                </svg>
              </button>
              <button
                type="button"
                className="precisa-arrow"
                onClick={() => i < filled.length - 1 && onSwap(f.key, filled[i + 1].key)}
                disabled={i === filled.length - 1}
                aria-label="Mover para baixo"
              >
                <svg className="precisa-arrow-icon" viewBox="0 0 14 12" aria-hidden="true">
                  <path d="M7 9.5 L12 2.5 L2 2.5 Z" />
                </svg>
              </button>
            </div>
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

export function TabuleiroPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, setCard, loading } = useSubmission();
  const sensors = useBoardSensors();
  const isMobile = useIsMobile();
  const [stepIndex, setStepIndex] = useState(0);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showRequired, setShowRequired] = useState(false);

  const step = STEPS[stepIndex];
  const isPainel = step.key === 'painel';
  const cardPool = isPainel ? PAINEL_CARDS : CARDS;
  const lookupCard = isPainel ? getPainelCard : getCard;

  const usedCardIds = useMemo(
    () =>
      new Set(
        (submission?.placements ?? []).filter((p) => p.board === step.board).map((p) => p.card_id)
      ),
    [submission, step.board]
  );

  const availableCards = cardPool.filter((c) => {
    if (usedCardIds.has(c.id)) return false;
    if (isPainel) return true;
    const cat = STEP_CATEGORY[step.key];
    if (cat) return c.category === cat;
    return c.category !== 'tipologia' && c.category !== 'mudanca';
  });

  // O passo só é concluído com pelo menos 1 carta (na etapa de lista, 1 já basta — não precisa preencher tudo).
  const stepHasCard =
    step.kind === 'list'
      ? (step.slots ?? []).some((s) => getPlacedCardId(step.board, s.key))
      : Boolean(getPlacedCardId(step.board, step.slot!));

  function handleNext() {
    if (!stepHasCard) {
      setShowRequired(true);
      return;
    }
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    else navigate('/resumo');
  }

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
    if (overId === LIST_ZONE) {
      // Coloca a carta no primeiro espaço livre da lista (precisa / painel).
      const empty = (step.slots ?? []).find((s) => !getPlacedCardId(step.board, s.key));
      if (empty) setCard(step.board, empty.key, cardId);
      return;
    }
    setCard(step.board, overId, cardId);
  }

  function removeCard(slotKey: string) {
    setCard(step.board, slotKey, null);
  }

  async function swapSlots(slotA: string, slotB: string) {
    const cardA = getPlacedCardId(step.board, slotA);
    const cardB = getPlacedCardId(step.board, slotB);
    if (!cardA || !cardB) return;
    await setCard(step.board, slotA, cardB);
    await setCard(step.board, slotB, cardA);
  }

  // No mobile o drag é inviável: clicar numa carta a coloca no próximo espaço livre (ou no slot único).
  function selectCard(cardId: string) {
    if (step.kind === 'list') {
      const empty = (step.slots ?? []).find((s) => !getPlacedCardId(step.board, s.key));
      if (empty) setCard(step.board, empty.key, cardId);
    } else {
      setCard(step.board, step.slot!, cardId);
    }
  }

  const dropPlaceholder = isMobile ? 'Clique em uma carta para selecionar' : 'Arraste a carta aqui';
  const listPlaceholder = isMobile ? 'Clique em uma carta para selecionar' : 'Arraste as cartas aqui';

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const draggedCard = activeCardId ? lookupCard(activeCardId) : undefined;
  const placedSingle =
    step.kind !== 'list' ? lookupCard(getPlacedCardId(step.board, step.slot!)) ?? undefined : undefined;

  return (
    <div className={`tabuleiro-page${isPainel ? ' painel-page' : ''}`}>
      <GameHeader stepLabel={`Passo ${stepIndex + 1} de ${STEPS.length}`} />

      <div className="tabuleiro-content" style={{ padding: '20px 24px 16px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="board-columns">
            <div className="board-left-col">
              <div className="board-card">
                <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>{step.instructions}</h3>
              </div>
              <div className="tabuleiro-board board-drop">
                <div className="board-drop-inner">
                  {step.kind === 'rect' && (
                    <div className="board-drop-slot">
                      <Slot
                        id={step.slot!}
                        shape="rect"
                        card={placedSingle}
                        onRemove={() => removeCard(step.slot!)}
                        placeholder={dropPlaceholder}
                      />
                    </div>
                  )}

                  {step.kind === 'circle' && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Slot
                        id={step.slot!}
                        shape="circle"
                        card={placedSingle}
                        onRemove={() => removeCard(step.slot!)}
                        placeholder={dropPlaceholder}
                      />
                    </div>
                  )}

                  {step.kind === 'list' && (
                    <ListDropZone
                      slots={step.slots ?? []}
                      board={step.board}
                      lookupCard={lookupCard}
                      getPlacedCardId={getPlacedCardId}
                      onRemove={removeCard}
                      onSwap={swapSlots}
                      placeholder={listPlaceholder}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="board-cards board-card">
              <CardTray cards={availableCards} onSelect={isMobile ? selectCard : undefined} />
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
          <button
            className="btn btn-ghost"
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Voltar
          </button>
          <button
            className={`btn${stepHasCard ? '' : ' btn-locked'}`}
            type="button"
            aria-disabled={!stepHasCard}
            onClick={handleNext}
          >
            {stepIndex < STEPS.length - 1 ? 'Próximo passo' : 'Revisar e enviar'}
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
