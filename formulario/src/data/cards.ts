import arvores from '../assets/img/cards/com fundo/AA-Arvores-01.png';
import centroCultural from '../assets/img/cards/com fundo/AA-Centro-Cultural-01.png';
import creche from '../assets/img/cards/com fundo/AA-Creche-01.png';
import escola from '../assets/img/cards/com fundo/AA-Escola-01.png';
import praca from '../assets/img/cards/com fundo/AA-Praça-01.png';
import quadra from '../assets/img/cards/com fundo/AA-Quadra-01.png';
import saude from '../assets/img/cards/com fundo/AA-Saúde-01.png';
import esgoto from '../assets/img/cards/com fundo/BB-Esgoto-01.png';
import iluminacao from '../assets/img/cards/com fundo/BB-Iluminação-01.jpg.jpeg';
import internet from '../assets/img/cards/com fundo/BB-Internet-01.png';
import lixo from '../assets/img/cards/com fundo/BB-Lixo-01.png';
import agua from '../assets/img/cards/com fundo/BB-Água-01.png';
import acessibilidade from '../assets/img/cards/com fundo/CC-Acessibilidade-01.png';
import asfaltoCalcada from '../assets/img/cards/com fundo/CC-Asfalto-Calçada-01.png';
import calcada from '../assets/img/cards/com fundo/CC-Calçada-01.png';
import ciclovia from '../assets/img/cards/com fundo/CC-Ciclovia-01.png';
import transporte from '../assets/img/cards/com fundo/CC-Transporte-01.png';
import contencao from '../assets/img/cards/com fundo/DD-Contenção-01.png';
import enchente from '../assets/img/cards/com fundo/DD-Enchente-01.png';
import seguranca from '../assets/img/cards/com fundo/EE-Segurança-01.png';

export type CardCategory = 'equipamentos' | 'infraestrutura' | 'mobilidade' | 'riscos' | 'seguranca';

export interface CardDef {
  id: string;
  label: string;
  category: CardCategory;
  image: string;
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  equipamentos: 'Equipamentos',
  infraestrutura: 'Infraestrutura',
  mobilidade: 'Mobilidade',
  riscos: 'Riscos',
  seguranca: 'Segurança',
};

export const CARDS: CardDef[] = [
  { id: 'arvores', label: 'Árvores', category: 'equipamentos', image: arvores },
  { id: 'centro-cultural', label: 'Centro Cultural', category: 'equipamentos', image: centroCultural },
  { id: 'creche', label: 'Creche', category: 'equipamentos', image: creche },
  { id: 'escola', label: 'Escola', category: 'equipamentos', image: escola },
  { id: 'praca', label: 'Praça', category: 'equipamentos', image: praca },
  { id: 'quadra', label: 'Quadra', category: 'equipamentos', image: quadra },
  { id: 'saude', label: 'Saúde', category: 'equipamentos', image: saude },
  { id: 'esgoto', label: 'Esgoto', category: 'infraestrutura', image: esgoto },
  { id: 'iluminacao', label: 'Iluminação', category: 'infraestrutura', image: iluminacao },
  { id: 'internet', label: 'Internet', category: 'infraestrutura', image: internet },
  { id: 'lixo', label: 'Coleta de Lixo', category: 'infraestrutura', image: lixo },
  { id: 'agua', label: 'Água', category: 'infraestrutura', image: agua },
  { id: 'acessibilidade', label: 'Acessibilidade', category: 'mobilidade', image: acessibilidade },
  { id: 'asfalto-calcada', label: 'Asfalto e Calçada', category: 'mobilidade', image: asfaltoCalcada },
  { id: 'calcada', label: 'Calçada', category: 'mobilidade', image: calcada },
  { id: 'ciclovia', label: 'Ciclovia', category: 'mobilidade', image: ciclovia },
  { id: 'transporte', label: 'Transporte', category: 'mobilidade', image: transporte },
  { id: 'contencao', label: 'Contenção de Encostas', category: 'riscos', image: contencao },
  { id: 'enchente', label: 'Enchente', category: 'riscos', image: enchente },
  { id: 'seguranca', label: 'Segurança', category: 'seguranca', image: seguranca },
];

export function getCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return CARDS.find((c) => c.id === id);
}
