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

export type CardCategory =
  | 'equipamentos'
  | 'infraestrutura'
  | 'mobilidade'
  | 'riscos'
  | 'seguranca';

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

// As 20 cartas do "Jogo do Bairro" (Painel Nosso Bairro). O nome já vem embutido
// na arte de cada carta, por isso não repetimos o rótulo por cima.
export const CARDS: CardDef[] = [
  { id: 'arvores', label: 'Árvores', category: 'equipamentos', image: arvores },
  { id: 'centro-cultural', label: 'Centro Cultural', category: 'equipamentos', image: centroCultural },
  { id: 'creche', label: 'Creche', category: 'equipamentos', image: creche },
  { id: 'escola', label: 'Escola', category: 'equipamentos', image: escola },
  { id: 'praca', label: 'Praça', category: 'equipamentos', image: praca },
  { id: 'quadra', label: 'Quadra', category: 'equipamentos', image: quadra },
  { id: 'saude', label: 'Saúde', category: 'equipamentos', image: saude },
  { id: 'agua', label: 'Água', category: 'infraestrutura', image: agua },
  { id: 'coleta-lixo', label: 'Coleta de Lixo', category: 'infraestrutura', image: coletaLixo },
  { id: 'esgoto', label: 'Esgoto', category: 'infraestrutura', image: esgoto },
  { id: 'iluminacao', label: 'Iluminação', category: 'infraestrutura', image: iluminacao },
  { id: 'internet', label: 'Internet', category: 'infraestrutura', image: internet },
  { id: 'acessibilidade', label: 'Acessibilidade (idosos e PCD)', category: 'mobilidade', image: acessibilidade },
  { id: 'asfalto', label: 'Asfalto', category: 'mobilidade', image: asfalto },
  { id: 'calcada', label: 'Calçada', category: 'mobilidade', image: calcada },
  { id: 'ciclovia', label: 'Ciclovia', category: 'mobilidade', image: ciclovia },
  { id: 'transporte-publico', label: 'Transporte Público', category: 'mobilidade', image: transportePublico },
  { id: 'contencao-encostas', label: 'Contenção de Encostas', category: 'riscos', image: contencaoEncostas },
  { id: 'prevencao-enchentes', label: 'Prevenção de Enchentes', category: 'riscos', image: prevencaoEnchentes },
  { id: 'seguranca', label: 'Segurança', category: 'seguranca', image: seguranca },
];

export function getCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return CARDS.find((c) => c.id === id);
}
