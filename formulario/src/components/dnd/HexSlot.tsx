import { useDroppable } from '@dnd-kit/core';
import type { CardDef } from '../../data/cards';

interface HexSlotProps {
  id: string;
  card?: CardDef;
  center?: boolean;
  onRemove?: () => void;
}

export function HexSlot({ id, card, center, onRemove }: HexSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { slotId: id } });

  return (
    <div ref={setNodeRef} className={`hex-slot${center ? ' center' : ''}${isOver ? ' over' : ''}`}>
      <div className="hex-inner" onClick={card ? onRemove : undefined}>
        {card ? (
          <>
            <img src={card.image} alt={card.label} />
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
          </>
        ) : null}
      </div>
    </div>
  );
}
