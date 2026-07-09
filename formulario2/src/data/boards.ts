import painel1 from '../assets/board/painel-1.jpg';
import painel2 from '../assets/board/painel-2.jpg';
import painel3 from '../assets/board/painel-3.jpg';
import painel4 from '../assets/board/painel-4.jpg';
import painel5 from '../assets/board/painel-5.jpg';
import painel6 from '../assets/board/painel-6.jpg';

// Os 6 tabuleiros "Nosso Bairro" — mesmo layout, cores diferentes (um por grupo).
export const BOARDS: string[] = [painel1, painel2, painel3, painel4, painel5, painel6];

// O link de cada grupo vem do admin no formato /acesso/<n>-<codigo>, onde <n> é o
// número do grupo (1..6). Assim cada grupo abre o tabuleiro da sua cor.
// Sem o prefixo (ex.: link de sessão), cai no tabuleiro 1.
export function boardIndexFromCode(code?: string): number {
  const m = code?.match(/^([1-6])-/);
  return m ? Number(m[1]) : 1;
}

export function boardForCode(code?: string): string {
  return BOARDS[boardIndexFromCode(code) - 1] ?? BOARDS[0];
}
