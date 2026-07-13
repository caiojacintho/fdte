// Layout e imagens do painel "Nosso Bairro" (Etapa 2), para reproduzir no admin
// o tabuleiro preenchido de cada grupo — espelho de formulario2/src/data
// (boardLayout.ts + boards.ts + cards.ts). Mantido como cópia local porque são
// assets/dados por-app (não mecânica compartilhada em @fdte/board-kit).
import painel1 from '../assets/board/painel-1.jpg';
import painel2 from '../assets/board/painel-2.jpg';
import painel3 from '../assets/board/painel-3.jpg';
import painel4 from '../assets/board/painel-4.jpg';
import painel5 from '../assets/board/painel-5.jpg';
import painel6 from '../assets/board/painel-6.jpg';

import acessibilidade from '../assets/cards/acessibilidade.png';
import agua from '../assets/cards/agua.png';
import arvores from '../assets/cards/arvores.png';
import asfalto from '../assets/cards/asfalto.png';
import calcada from '../assets/cards/calcada.png';
import centroCultural from '../assets/cards/centro-cultural.png';
import ciclovia from '../assets/cards/ciclovia.png';
import coletaLixo from '../assets/cards/coleta-lixo.png';
import contencaoEncostas from '../assets/cards/contencao-encostas.png';
import creche from '../assets/cards/creche.png';
import escola from '../assets/cards/escola.png';
import esgoto from '../assets/cards/esgoto.png';
import iluminacao from '../assets/cards/iluminacao.png';
import internet from '../assets/cards/internet.png';
import praca from '../assets/cards/praca.png';
import prevencaoEnchentes from '../assets/cards/prevencao-enchentes.png';
import quadra from '../assets/cards/quadra.png';
import saude from '../assets/cards/saude.png';
import seguranca from '../assets/cards/seguranca.png';
import transportePublico from '../assets/cards/transporte-publico.png';

// Proporção natural da arte do painel (2380×1684).
export const BAIRRO_BOARD_RATIO = 2380 / 1684;

// Largura de cada hexágono como fração da largura do tabuleiro.
export const HEX_W = 0.166;

export interface HexSlotDef {
  key: string;
  cx: number; // centro X (fração da largura)
  cy: number; // centro Y (fração da altura)
}

export const PAINEL_SLOTS: HexSlotDef[] = [
  { key: 'h1', cx: 0.191, cy: 0.307 },
  { key: 'h2', cx: 0.191, cy: 0.564 },
  { key: 'h3', cx: 0.191, cy: 0.818 },
  { key: 'h4', cx: 0.345, cy: 0.434 },
  { key: 'h5', cx: 0.345, cy: 0.689 },
  { key: 'h6', cx: 0.499, cy: 0.564 },
  { key: 'h7', cx: 0.499, cy: 0.819 },
  { key: 'h8', cx: 0.652, cy: 0.434 },
  { key: 'h9', cx: 0.652, cy: 0.689 },
  { key: 'h10', cx: 0.806, cy: 0.307 },
  { key: 'h11', cx: 0.806, cy: 0.564 },
  { key: 'h12', cx: 0.806, cy: 0.818 },
];

// Os 6 tabuleiros (uma cor por grupo). `board` na submissão é 1..6.
const BOARDS: string[] = [painel1, painel2, painel3, painel4, painel5, painel6];

export function bairroBoardImage(board: number | undefined): string {
  const idx = board && board >= 1 && board <= BOARDS.length ? board : 1;
  return BOARDS[idx - 1];
}

const BAIRRO_CARD_IMAGES: Record<string, string> = {
  arvores,
  'centro-cultural': centroCultural,
  creche,
  escola,
  praca,
  quadra,
  saude,
  agua,
  'coleta-lixo': coletaLixo,
  esgoto,
  iluminacao,
  internet,
  acessibilidade,
  asfalto,
  calcada,
  ciclovia,
  'transporte-publico': transportePublico,
  'contencao-encostas': contencaoEncostas,
  'prevencao-enchentes': prevencaoEnchentes,
  seguranca,
};

export function getBairroCardImage(id: string | null | undefined): string | null {
  if (!id) return null;
  return BAIRRO_CARD_IMAGES[id] ?? null;
}
