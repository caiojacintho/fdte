export type CardCategory = 'equipamentos' | 'infraestrutura' | 'mobilidade' | 'riscos' | 'seguranca';

export interface CardDef {
  id: string;
  label: string;
  category: CardCategory;
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  equipamentos: 'Equipamentos',
  infraestrutura: 'Infraestrutura',
  mobilidade: 'Mobilidade',
  riscos: 'Riscos',
  seguranca: 'Segurança',
};

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  equipamentos: '#2fa9b8',
  infraestrutura: '#3f9142',
  mobilidade: '#f2a93b',
  riscos: '#c53d3d',
  seguranca: '#6b4f3a',
};

// Mantido em paridade com formulario/src/data/cards.ts (sem as imagens, que só existem no app do formulário).
export const CARDS: CardDef[] = [
  { id: 'arvores', label: 'Árvores', category: 'equipamentos' },
  { id: 'centro-cultural', label: 'Centro Cultural', category: 'equipamentos' },
  { id: 'creche', label: 'Creche', category: 'equipamentos' },
  { id: 'escola', label: 'Escola', category: 'equipamentos' },
  { id: 'praca', label: 'Praça', category: 'equipamentos' },
  { id: 'quadra', label: 'Quadra', category: 'equipamentos' },
  { id: 'saude', label: 'Saúde', category: 'equipamentos' },
  { id: 'esgoto', label: 'Esgoto', category: 'infraestrutura' },
  { id: 'iluminacao', label: 'Iluminação', category: 'infraestrutura' },
  { id: 'internet', label: 'Internet', category: 'infraestrutura' },
  { id: 'lixo', label: 'Coleta de Lixo', category: 'infraestrutura' },
  { id: 'agua', label: 'Água', category: 'infraestrutura' },
  { id: 'acessibilidade', label: 'Acessibilidade', category: 'mobilidade' },
  { id: 'asfalto-calcada', label: 'Asfalto e Calçada', category: 'mobilidade' },
  { id: 'calcada', label: 'Calçada', category: 'mobilidade' },
  { id: 'ciclovia', label: 'Ciclovia', category: 'mobilidade' },
  { id: 'transporte', label: 'Transporte', category: 'mobilidade' },
  { id: 'contencao', label: 'Contenção de Encostas', category: 'riscos' },
  { id: 'enchente', label: 'Enchente', category: 'riscos' },
  { id: 'seguranca', label: 'Segurança', category: 'seguranca' },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}
