export type CardCategory =
  | 'casa'
  | 'equipamentos'
  | 'infraestrutura'
  | 'mobilidade'
  | 'riscos'
  | 'seguranca'
  | 'tipologia'
  | 'mudanca';

export interface CardDef {
  id: string;
  label: string;
  category: CardCategory;
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  casa: 'O que a casa precisa',
  equipamentos: 'Equipamentos',
  infraestrutura: 'Infraestrutura',
  mobilidade: 'Mobilidade',
  riscos: 'Riscos',
  seguranca: 'Segurança',
  tipologia: 'Tipologia da moradia',
  mudanca: 'Como mudar',
};

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  casa: '#2563eb',
  equipamentos: '#0d9488',
  infraestrutura: '#16a34a',
  mobilidade: '#d97706',
  riscos: '#dc2626',
  seguranca: '#7c5cbf',
  tipologia: '#0891b2',
  mudanca: '#db2777',
};

// Catálogo do Tabuleiro (Etapa 1) — em paridade com formulario/src/data/cards.ts (sem imagens).
export const CARDS: CardDef[] = [
  { id: 'casa-adaptacao', label: 'Adaptação para idosos ou PCD', category: 'casa' },
  { id: 'casa-agua', label: 'Água', category: 'casa' },
  { id: 'casa-aluguel', label: 'Aluguel mais baixo', category: 'casa' },
  { id: 'casa-banheiro-1', label: 'Banheiro', category: 'casa' },
  { id: 'casa-banheiro-2', label: 'Banheiro', category: 'casa' },
  { id: 'casa-cozinha', label: 'Cozinha separada', category: 'casa' },
  { id: 'casa-documento', label: 'Documento da casa', category: 'casa' },
  { id: 'casa-endereco', label: 'Endereço e CEP', category: 'casa' },
  { id: 'casa-esgoto', label: 'Esgoto', category: 'casa' },
  { id: 'casa-garagem', label: 'Garagem ou estacionamento', category: 'casa' },
  { id: 'casa-lavanderia', label: 'Lavanderia', category: 'casa' },
  { id: 'casa-luz', label: 'Luz', category: 'casa' },
  { id: 'casa-sem-fila', label: 'Moradia sem fila de espera', category: 'casa' },
  { id: 'casa-parede', label: 'Parede de tijolo', category: 'casa' },
  { id: 'casa-pisos', label: 'Pisos', category: 'casa' },
  { id: 'casa-quarto-1', label: 'Quarto', category: 'casa' },
  { id: 'casa-quarto-2', label: 'Quarto', category: 'casa' },
  { id: 'casa-quarto-3', label: 'Quarto', category: 'casa' },
  { id: 'casa-quintal', label: 'Quintal ou horta', category: 'casa' },
  { id: 'casa-reboco', label: 'Reboco ou pintura', category: 'casa' },
  { id: 'casa-telhado', label: 'Telhado', category: 'casa' },
  { id: 'tipologia-ocupacao', label: 'Ocupação / Acampamento', category: 'tipologia' },
  { id: 'tipologia-encosta', label: 'Autoconstrução em encosta', category: 'tipologia' },
  { id: 'tipologia-apartamento', label: 'Apartamento (conjunto habitacional)', category: 'tipologia' },
  { id: 'tipologia-rural', label: 'Casa rural / sítio', category: 'tipologia' },
  { id: 'tipologia-casa-propria', label: 'Casa própria consolidada', category: 'tipologia' },
  { id: 'mudanca-casa-nova', label: 'Casa Nova', category: 'mudanca' },
  { id: 'mudanca-reforma', label: 'Reforma', category: 'mudanca' },
];

export function getCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return CARDS.find((c) => c.id === id);
}

// Catálogo do Painel "Nosso Bairro" (Etapa 2).
export const PAINEL_CARDS: CardDef[] = [
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
  { id: 'seguranca', label: 'Segurança', category: 'seguranca' },
  { id: 'contencao', label: 'Contenção de Encostas', category: 'riscos' },
  { id: 'enchente', label: 'Enchente', category: 'riscos' },
];

export function getPainelCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return PAINEL_CARDS.find((c) => c.id === id);
}
