export interface SlotDef {
  key: string;
  shape: 'rect' | 'circle' | 'hex';
  label?: string;
}

export const TABULEIRO_BOARD = 'tabuleiro';
export const PAINEL_BOARD = 'painel';

export const COMO_E_HOJE_SLOT: SlotDef = { key: 'como_e_hoje', shape: 'rect', label: 'Como é hoje' };
export const COMO_MUDAR_SLOT: SlotDef = { key: 'como_mudar', shape: 'circle', label: 'Como mudar' };

export const PRECISA_SLOTS: SlotDef[] = Array.from({ length: 12 }, (_, i) => ({
  key: `precisa_${i + 1}`,
  shape: 'rect',
}));

// Posições do favo hexagonal: 1 central + 12 ao redor, em 3 colunas (esquerda/centro/direita) x várias linhas,
// reproduzindo o arranjo do painel "Nosso Bairro".
export const PAINEL_SLOTS: SlotDef[] = Array.from({ length: 13 }, (_, i) => ({
  key: `hex_${i + 1}`,
  shape: 'hex',
}));
