import type { CardDef } from '../../data/cards';
import { DraggableCard } from './DraggableCard';

export function CardTray({
  cards,
  onSelect,
}: {
  cards: CardDef[];
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="tray">
      {cards.length === 0 ? (
        <span className="tray-empty">Todas as cartas desta etapa já foram usadas.</span>
      ) : (
        cards.map((card) => <DraggableCard key={card.id} card={card} onSelect={onSelect} />)
      )}
    </div>
  );
}
