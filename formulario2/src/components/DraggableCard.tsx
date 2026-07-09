import { useDraggable } from '@dnd-kit/core';
import type { CardDef } from '../data/cards';

export function DraggableCard({ card, disabled }: { card: CardDef; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${card.id}`,
    data: { cardId: card.id, source: 'tray' },
    disabled,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`tray-card${isDragging ? ' dragging' : ''}${disabled ? ' used' : ''}`}
      title={card.label}
    >
      <img src={card.image} alt={card.label} draggable={false} />
    </div>
  );
}
