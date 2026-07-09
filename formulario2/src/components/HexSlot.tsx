import { useDroppable } from '@dnd-kit/core';
import type { CardDef } from '../data/cards';

// Proporção largura/altura de um hexágono flat-top (2 : √3).
const HEX_ASPECT = 1.1547;
const HEX_CLIP = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';

export function HexSlot({
  slotKey,
  cx,
  cy,
  w,
  card,
  locked,
  onRemove,
}: {
  slotKey: string;
  cx: number;
  cy: number;
  w: number;
  card?: CardDef;
  locked?: boolean;
  onRemove?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotKey, data: { slotKey }, disabled: locked });

  return (
    <div
      ref={setNodeRef}
      className={`hex-slot${isOver ? ' over' : ''}${card ? ' filled' : ''}${locked ? ' locked' : ''}`}
      style={{
        left: `${cx * 100}%`,
        top: `${cy * 100}%`,
        width: `${w * 100}%`,
        aspectRatio: String(HEX_ASPECT),
      }}
    >
      {isOver && !card && <div className="hex-highlight" style={{ clipPath: HEX_CLIP }} />}
      {card && (
        <div
          className="hex-card"
          onClick={locked ? undefined : onRemove}
          title={locked ? card.label : 'Clique para remover'}
        >
          <img src={card.image} alt={card.label} draggable={false} />
          {!locked && (
            <button
              type="button"
              className="hex-remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              aria-label="Remover carta"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
