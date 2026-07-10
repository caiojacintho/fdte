import { useDraggable } from '@dnd-kit/core';
import type { BoardCard } from './types';

export interface DraggableCardProps {
  card: BoardCard;
  /**
   * Root class name for the draggable element. Each app passes its own
   * stylesheet's root class (formulario: "draggable-card", formulario2:
   * "tray-card") so existing CSS keeps matching with zero visual change.
   */
  className: string;
  /**
   * Tap-to-select mode (formulario, mobile): renders without drag
   * listeners/attributes, calls onSelect on click instead of dragging, and
   * appends a "selectable" modifier class. Omit for normal drag behavior.
   */
  onSelect?: (id: string) => void;
  /**
   * Marks the card as already placed/used (formulario2): passed through to
   * dnd-kit's `disabled` and appends a "used" modifier class.
   */
  disabled?: boolean;
  /** Whether to render the card's label under the image. Defaults to true. */
  showLabel?: boolean;
}

export function DraggableCard({ card, className, onSelect, disabled, showLabel = true }: DraggableCardProps) {
  const selectMode = Boolean(onSelect);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tray-${card.id}`,
    data: { cardId: card.id, source: 'tray' },
    disabled,
  });
  const style =
    !selectMode && transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  const modifiers = [isDragging ? 'dragging' : '', selectMode ? 'selectable' : '', disabled ? 'used' : '']
    .filter(Boolean)
    .join(' ');
  const rootClassName = [className, modifiers].filter(Boolean).join(' ');

  return (
    <div
      ref={selectMode ? undefined : setNodeRef}
      style={style}
      {...(selectMode ? {} : listeners)}
      {...(selectMode ? {} : attributes)}
      className={rootClassName}
      title={card.label}
      onClick={selectMode ? () => onSelect!(card.id) : undefined}
    >
      <img src={card.image} alt={card.label} draggable={false} />
      {showLabel && <span className="card-label">{card.label}</span>}
    </div>
  );
}
