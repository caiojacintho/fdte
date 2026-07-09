import { CARDS, CATEGORY_LABELS, type CardCategory } from '../data/cards';
import { DraggableCard } from './DraggableCard';

const ORDER: CardCategory[] = ['equipamentos', 'infraestrutura', 'mobilidade', 'riscos', 'seguranca'];

export function CardTray({ usedIds }: { usedIds: Set<string> }) {
  return (
    <div className="tray">
      {ORDER.map((cat) => {
        const cards = CARDS.filter((c) => c.category === cat);
        if (cards.length === 0) return null;
        return (
          <div className="tray-group" key={cat}>
            <h4 className="tray-group-title">{CATEGORY_LABELS[cat]}</h4>
            <div className="tray-group-cards">
              {cards.map((card) => (
                <DraggableCard key={card.id} card={card} disabled={usedIds.has(card.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
