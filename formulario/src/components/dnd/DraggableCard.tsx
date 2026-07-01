import { useDraggable } from '@dnd-kit/core';
import type { CardDef } from '../../data/cards';

export function DraggableCard({
  card,
  onSelect,
}: {
  card: CardDef;
  onSelect?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${card.id}`,
    data: { cardId: card.id, source: 'tray' },
  });

  const selectMode = Boolean(onSelect);
  const style =
    !selectMode && transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;

  return (
    <div
      ref={selectMode ? undefined : setNodeRef}
      style={style}
      {...(selectMode ? {} : listeners)}
      {...(selectMode ? {} : attributes)}
      className={`draggable-card${isDragging ? ' dragging' : ''}${selectMode ? ' selectable' : ''}`}
      title={card.label}
      onClick={selectMode ? () => onSelect!(card.id) : undefined}
    >
      <img src={card.image} alt={card.label} draggable={false} />
      <span className="card-label">{card.label}</span>
    </div>
  );
}
