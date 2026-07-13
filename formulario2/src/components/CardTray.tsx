import { DraggableCard } from '@fdte/board-kit';
import { CARDS } from '../data/cards';

// Bandeja plana: todas as cartas numa única grade, sem agrupar por categoria.
export function CardTray({ usedIds }: { usedIds: Set<string> }) {
  return (
    <div className="tray">
      <div className="tray-group-cards">
        {CARDS.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            className="tray-card"
            disabled={usedIds.has(card.id)}
            showLabel={false}
          />
        ))}
      </div>
    </div>
  );
}
