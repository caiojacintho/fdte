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
import tipologiaOcupacao from '../assets/img/cards/pergunta1/1.png';
import tipologiaEncosta from '../assets/img/cards/pergunta1/2.png';
import tipologiaApartamento from '../assets/img/cards/pergunta1/3.png';
import tipologiaRural from '../assets/img/cards/pergunta1/4.png';
import tipologiaCasaPropria from '../assets/img/cards/pergunta1/5.png';
import mudancaCasaNova from '../assets/img/cards/pergunta2/A.png';
import mudancaReforma from '../assets/img/cards/pergunta2/B.png';
import p4Equip1 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (1).png';
import p4Equip2 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (2).png';
import p4Equip3 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (3).png';
import p4Equip4 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (4).png';
import p4Equip5 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (5).png';
import p4Equip6 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (6).png';
import p4Equip7 from '../assets/img/cards/pergunta4/01-ITEM-EQUIPAMENTOS (7).png';
import p4Infra1 from '../assets/img/cards/pergunta4/02-ITEM-INFRA (1).png';
import p4Infra2 from '../assets/img/cards/pergunta4/02-ITEM-INFRA (2).png';
import p4Infra3 from '../assets/img/cards/pergunta4/02-ITEM-INFRA (3).png';
import p4Infra4 from '../assets/img/cards/pergunta4/02-ITEM-INFRA (4).png';
import p4Infra5 from '../assets/img/cards/pergunta4/02-ITEM-INFRA (5).png';
import p4Mob1 from '../assets/img/cards/pergunta4/03-ITEM-MOBILIDADE (1).png';
import p4Mob2 from '../assets/img/cards/pergunta4/03-ITEM-MOBILIDADE (2).png';
import p4Mob3 from '../assets/img/cards/pergunta4/03-ITEM-MOBILIDADE (3).png';
import p4Mob4 from '../assets/img/cards/pergunta4/03-ITEM-MOBILIDADE (4).png';
import p4Mob5 from '../assets/img/cards/pergunta4/03-ITEM-MOBILIDADE (5).png';
import p4Seguranca from '../assets/img/cards/pergunta4/04-ITEM-SEGURANÇA.png';
import p4Risco1 from '../assets/img/cards/pergunta4/05-ITEM-RISCOS (1).png';
import p4Risco2 from '../assets/img/cards/pergunta4/05-ITEM-RISCOS (2).png';

export type CardCategory =
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
  image: string;
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  equipamentos: 'Equipamentos',
  infraestrutura: 'Infraestrutura',
  mobilidade: 'Mobilidade',
  riscos: 'Riscos',
  seguranca: 'Segurança',
  tipologia: 'Tipologia da moradia',
  mudanca: 'Como mudar',
};

// TEMP: placeholder cinza-claro para as cartas comuns (serão substituídas por outras imagens).
const placeholderGray =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='265'%3E%3Crect width='200' height='265' rx='10' fill='%23e6e4df'/%3E%3C/svg%3E";

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
  { id: 'tipologia-ocupacao', label: 'Ocupação / Acampamento', category: 'tipologia', image: tipologiaOcupacao },
  { id: 'tipologia-encosta', label: 'Autoconstrução em encosta', category: 'tipologia', image: tipologiaEncosta },
  { id: 'tipologia-apartamento', label: 'Apartamento (conjunto habitacional)', category: 'tipologia', image: tipologiaApartamento },
  { id: 'tipologia-rural', label: 'Casa rural / sítio', category: 'tipologia', image: tipologiaRural },
  { id: 'tipologia-casa-propria', label: 'Casa própria consolidada', category: 'tipologia', image: tipologiaCasaPropria },
  { id: 'mudanca-casa-nova', label: 'Casa Nova', category: 'mudanca', image: mudancaCasaNova },
  { id: 'mudanca-reforma', label: 'Reforma', category: 'mudanca', image: mudancaReforma },
];

// TEMP: as cartas comuns (equipamentos/infra/mobilidade/riscos/segurança) ficam como
// retângulos cinza até virem as imagens definitivas. Tipologia e "como mudar" mantêm as artes.
for (const card of CARDS) {
  if (card.category !== 'tipologia' && card.category !== 'mudanca') {
    card.image = placeholderGray;
  }
}

export function getCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return CARDS.find((c) => c.id === id);
}

// Cartas da Etapa 2 (Painel Nosso Bairro) — usam as artes da pasta pergunta4.
export const PAINEL_CARDS: CardDef[] = [
  { id: 'arvores', label: 'Árvores', category: 'equipamentos', image: p4Equip1 },
  { id: 'centro-cultural', label: 'Centro Cultural', category: 'equipamentos', image: p4Equip2 },
  { id: 'creche', label: 'Creche', category: 'equipamentos', image: p4Equip3 },
  { id: 'escola', label: 'Escola', category: 'equipamentos', image: p4Equip4 },
  { id: 'praca', label: 'Praça', category: 'equipamentos', image: p4Equip5 },
  { id: 'quadra', label: 'Quadra', category: 'equipamentos', image: p4Equip6 },
  { id: 'saude', label: 'Saúde', category: 'equipamentos', image: p4Equip7 },
  { id: 'esgoto', label: 'Esgoto', category: 'infraestrutura', image: p4Infra1 },
  { id: 'iluminacao', label: 'Iluminação', category: 'infraestrutura', image: p4Infra2 },
  { id: 'internet', label: 'Internet', category: 'infraestrutura', image: p4Infra3 },
  { id: 'lixo', label: 'Coleta de Lixo', category: 'infraestrutura', image: p4Infra4 },
  { id: 'agua', label: 'Água', category: 'infraestrutura', image: p4Infra5 },
  { id: 'acessibilidade', label: 'Acessibilidade', category: 'mobilidade', image: p4Mob1 },
  { id: 'asfalto-calcada', label: 'Asfalto e Calçada', category: 'mobilidade', image: p4Mob2 },
  { id: 'calcada', label: 'Calçada', category: 'mobilidade', image: p4Mob3 },
  { id: 'ciclovia', label: 'Ciclovia', category: 'mobilidade', image: p4Mob4 },
  { id: 'transporte', label: 'Transporte', category: 'mobilidade', image: p4Mob5 },
  { id: 'seguranca', label: 'Segurança', category: 'seguranca', image: p4Seguranca },
  { id: 'contencao', label: 'Contenção de Encostas', category: 'riscos', image: p4Risco1 },
  { id: 'enchente', label: 'Enchente', category: 'riscos', image: p4Risco2 },
];

export function getPainelCard(id: string | null | undefined): CardDef | undefined {
  if (!id) return undefined;
  return PAINEL_CARDS.find((c) => c.id === id);
}
