import { DraggableCard } from '@fdte/board-kit';
import { CARDS, CATEGORY_LABELS, type CardCategory } from '../data/cards';

const ORDER: CardCategory[] = ['equipamentos', 'infraestrutura', 'mobilidade', 'riscos', 'seguranca'];

// Thin app-local wrapper: the category grouping below depends on formulario2's
// own data/cards.ts (per-app data, not shared mechanics — stays out of
// @fdte/board-kit), so it renders the shared DraggableCard directly per group
// rather than going through board-kit's generic (flat) CardTray, keeping the
// DOM output byte-identical to before the board-kit extraction.
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
      })}
    </div>
  );
}
