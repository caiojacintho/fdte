import type { BoardCard } from './types';
import { DraggableCard } from './DraggableCard';

export interface CardTrayProps {
  cards: BoardCard[];
  onSelect?: (id: string) => void;
}

/**
 * Generic flat tray (formulario's original shape): renders an already
 * filtered/ordered list of cards, or an empty-state message. formulario2's
 * category-grouped tray has its own data dependencies (CARDS/CATEGORY_LABELS
 * from its local data/cards.ts) and stays as a thin app-local wrapper in
 * formulario2/src/components/CardTray.tsx that renders `DraggableCard`
 * directly per group instead of using this component.
 */
export function CardTray({ cards, onSelect }: CardTrayProps) {
  return (
    <div className="tray">
      {cards.length === 0 ? (
        <span className="tray-empty">Todas as cartas desta etapa já foram usadas.</span>
      ) : (
        cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            className="draggable-card"
            onSelect={onSelect}
            showLabel={!card.hideLabel}
          />
        ))
      )}
    </div>
  );
}
