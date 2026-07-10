// Minimal structural shape shared by both apps' concrete `CardDef` types
// (formulario/src/data/cards.ts and formulario2/src/data/cards.ts). Those
// per-app data files stay where they are — board-kit only needs the fields
// its components actually render, and TypeScript's structural typing means
// both apps' real `CardDef` satisfy this automatically.
export interface BoardCard {
  id: string;
  label: string;
  image: string;
  /** When true, the card renders without its text label under/over the image. */
  hideLabel?: boolean;
}
