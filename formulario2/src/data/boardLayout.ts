// Painel "Nosso Bairro" (Jogo do Bairro / Etapa 2).
//
// O tabuleiro é a arte `assets/board/painel-bairro.jpg`, que já traz 12 hexágonos
// rosados como espaços vazios. Cada slot abaixo é uma zona de soltar posicionada
// exatamente sobre um desses hexágonos — as coordenadas são frações (0..1) do
// tamanho natural da imagem (obtidas detectando os hexágonos na própria arte),
// então a sobreposição acompanha qualquer escala.

export const BOARD_NATURAL = { width: 2380, height: 1684 };
export const BOARD_RATIO = BOARD_NATURAL.width / BOARD_NATURAL.height;

export interface HexSlotDef {
  key: string;
  cx: number; // centro X (fração da largura)
  cy: number; // centro Y (fração da altura)
}

// Largura de cada hexágono como fração da largura do tabuleiro.
export const HEX_W = 0.166;

export const PAINEL_SLOTS: HexSlotDef[] = [
  // coluna far-left (3)
  { key: 'h1', cx: 0.191, cy: 0.307 },
  { key: 'h2', cx: 0.191, cy: 0.564 },
  { key: 'h3', cx: 0.191, cy: 0.818 },
  // coluna centro-esquerda (2)
  { key: 'h4', cx: 0.345, cy: 0.434 },
  { key: 'h5', cx: 0.345, cy: 0.689 },
  // coluna central (hexágono magenta + inferior)
  { key: 'h6', cx: 0.499, cy: 0.564 },
  { key: 'h7', cx: 0.499, cy: 0.819 },
  // coluna centro-direita (2)
  { key: 'h8', cx: 0.652, cy: 0.434 },
  { key: 'h9', cx: 0.652, cy: 0.689 },
  // coluna far-right (3)
  { key: 'h10', cx: 0.806, cy: 0.307 },
  { key: 'h11', cx: 0.806, cy: 0.564 },
  { key: 'h12', cx: 0.806, cy: 0.818 },
];
