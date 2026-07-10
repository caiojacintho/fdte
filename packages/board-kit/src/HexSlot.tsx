import { useDroppable } from '@dnd-kit/core';
import type { BoardCard } from './types';

const HEX_ASPECT = 1.1547;
const HEX_CLIP = 'polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%)';

export interface HexSlotProps {
  id: string;
  card?: BoardCard;
  /** formulario: adds a "center" modifier class for the middle hex in its grid layout. */
  center?: boolean;
  /** formulario2: read-only mode once the group's answers have been submitted. */
  locked?: boolean;
  /** formulario2: absolute positioning (fraction of container width/height), used together with cy/w. */
  cx?: number;
  cy?: number;
  w?: number;
  onRemove?: () => void;
}

export function HexSlot({ id, card, center, locked, cx, cy, w, onRemove }: HexSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { slotId: id }, disabled: locked });
  const positioned = cx !== undefined && cy !== undefined && w !== undefined;

  if (positioned) {
    // formulario2 shape: absolutely positioned hex, hover highlight, hex-card
    // wrapper only rendered once filled, optional read-only "locked" mode.
    const style = { left: `${cx * 100}%`, top: `${cy * 100}%`, width: `${w * 100}%`, aspectRatio: String(HEX_ASPECT) };
    return (
      <div
        ref={setNodeRef}
        className={`hex-slot${isOver ? ' over' : ''}${card ? ' filled' : ''}${locked ? ' locked' : ''}`}
        style={style}
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

  // formulario shape: laid out by the parent's own CSS grid, always-present
  // hex-inner wrapper, optional "center" modifier for the middle hex.
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
