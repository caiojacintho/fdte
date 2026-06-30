import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { GameHeader } from '../components/layout/GameHeader';
import { CardTray } from '../components/dnd/CardTray';
import { Slot } from '../components/dnd/Slot';
import { useBoardSensors } from '../components/dnd/sensors';
import { useSubmission } from '../submission/SubmissionContext';
import { CARDS, getCard } from '../data/cards';
import { TABULEIRO_BOARD, COMO_E_HOJE_SLOT, COMO_MUDAR_SLOT, PRECISA_SLOTS } from '../data/boardLayout';

const STEPS = [
  {
    key: 'como_e_hoje',
    title: 'Como é hoje?',
    instructions: 'Escolha 1 carta que melhor representa como é a sua moradia hoje.',
  },
  {
    key: 'como_mudar',
    title: 'Como mudar?',
    instructions: 'Escolha 1 carta com a mudança mais importante para a sua casa.',
  },
  {
    key: 'precisa',
    title: 'O que a minha casa precisa?',
    instructions: 'Escolha até 12 cartas com o que a sua casa mais precisa.',
  },
] as const;

export function TabuleiroPage() {
  const navigate = useNavigate();
  const { submission, getCard: getPlacedCardId, setCard, loading } = useSubmission();
  const sensors = useBoardSensors();
  const [stepIndex, setStepIndex] = useState(0);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const usedCardIds = useMemo(
    () =>
      new Set(
        (submission?.placements ?? [])
          .filter((p) => p.board === TABULEIRO_BOARD)
          .map((p) => p.card_id)
      ),
    [submission]
  );

  const availableCards = CARDS.filter((c) => !usedCardIds.has(c.id));
  const step = STEPS[stepIndex];

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId((event.active.data.current as { cardId?: string } | undefined)?.cardId ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = event;
    if (!over) return;
    const cardId = (active.data.current as { cardId?: string } | undefined)?.cardId;
    const slotKey = String(over.id);
    if (!cardId) return;
    setCard(TABULEIRO_BOARD, slotKey, cardId);
  }

  function removeCard(slotKey: string) {
    setCard(TABULEIRO_BOARD, slotKey, null);
  }

  if (loading) return <p style={{ padding: 24 }}>Carregando...</p>;

  const draggedCard = activeCardId ? getCard(activeCardId) : undefined;

  return (
    <div>
      <GameHeader stepLabel={`Etapa 1 de 2 · Tabuleiro da minha casa · Passo ${stepIndex + 1} de 3`} />

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`btn ${i === stepIndex ? '' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              onClick={() => setStepIndex(i)}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>

        <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: 6 }}>{step.title}</h2>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: 20 }}>{step.instructions}</p>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="tabuleiro-board">
            {step.key === 'como_e_hoje' && (
              <div style={{ maxWidth: 220, margin: '0 auto' }}>
                <Slot
                  id={COMO_E_HOJE_SLOT.key}
                  shape="rect"
                  card={getCard(getPlacedCardId(TABULEIRO_BOARD, COMO_E_HOJE_SLOT.key)) ?? undefined}
                  onRemove={() => removeCard(COMO_E_HOJE_SLOT.key)}
                  placeholder="Arraste a carta aqui"
                />
              </div>
            )}

            {step.key === 'como_mudar' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Slot
                  id={COMO_MUDAR_SLOT.key}
                  shape="circle"
                  card={getCard(getPlacedCardId(TABULEIRO_BOARD, COMO_MUDAR_SLOT.key)) ?? undefined}
                  onRemove={() => removeCard(COMO_MUDAR_SLOT.key)}
                  placeholder="Arraste aqui"
                />
              </div>
            )}

            {step.key === 'precisa' && (
              <div className="precisa-grid">
                {PRECISA_SLOTS.map((slot) => (
                  <Slot
                    key={slot.key}
                    id={slot.key}
                    shape="rect"
                    card={getCard(getPlacedCardId(TABULEIRO_BOARD, slot.key)) ?? undefined}
                    onRemove={() => removeCard(slot.key)}
                    placeholder="Vazio"
                  />
                ))}
              </div>
            )}
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
          <button
            className="btn btn-ghost"
            type="button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Voltar
          </button>
          {stepIndex < STEPS.length - 1 ? (
            <button className="btn" type="button" onClick={() => setStepIndex((i) => i + 1)}>
              Próximo passo
            </button>
          ) : (
            <button className="btn" type="button" onClick={() => navigate('/jogo/painel')}>
              Ir para o painel do bairro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
