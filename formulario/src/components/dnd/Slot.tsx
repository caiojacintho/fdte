import { useDroppable } from '@dnd-kit/core';
import type { CardDef } from '../../data/cards';

interface SlotProps {
  id: string;
  shape: 'rect' | 'circle';
  card?: CardDef;
  placeholder?: string;
  onRemove?: () => void;
}

export function Slot({ id, shape, card, placeholder, onRemove }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { slotId: id } });

  const className = [
    shape === 'circle' ? 'slot-circle' : 'slot-rect',
    isOver ? 'over' : '',
    card ? 'filled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={setNodeRef} className={className}>
      {card ? (
        <div className="slot-card" onClick={onRemove} title="Toque para remover">
          <img src={card.image} alt={card.label} />
          <span className="card-label">{card.label}</span>
          {onRemove && (
            <button
              type="button"
              className="remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remover carta"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <span className="slot-placeholder">{placeholder ?? 'Arraste aqui'}</span>
      )}
    </div>
  );
}
