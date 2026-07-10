import casaAdaptacao from '../assets/img/cards/itens-casa/adaptacaoparaidososoupcd.png';
import casaAgua from '../assets/img/cards/itens-casa/agua.png';
import casaAluguel from '../assets/img/cards/itens-casa/aluguelmaisbaixo.png';
import casaBanheiro1 from '../assets/img/cards/itens-casa/banheiro1.png';
import casaBanheiro2 from '../assets/img/cards/itens-casa/banheiro2.png';
import casaCozinha from '../assets/img/cards/itens-casa/cozinhaseparada.png';
import casaDocumento from '../assets/img/cards/itens-casa/documentodacasa.png';
import casaEndereco from '../assets/img/cards/itens-casa/enderecoecep.png';
import casaEsgoto from '../assets/img/cards/itens-casa/esgoto.png';
import casaGaragem from '../assets/img/cards/itens-casa/garagemouestacionamento.png';
import casaLavanderia from '../assets/img/cards/itens-casa/lavanderia.png';
import casaLuz from '../assets/img/cards/itens-casa/luz.png';
import casaSemFila from '../assets/img/cards/itens-casa/moradiasemfiladeespera.png';
import casaParede from '../assets/img/cards/itens-casa/parededetijolo.png';
import casaPisos from '../assets/img/cards/itens-casa/pisos.png';
import casaQuarto1 from '../assets/img/cards/itens-casa/quarto1.png';
import casaQuarto2 from '../assets/img/cards/itens-casa/quarto2.png';
import casaQuarto3 from '../assets/img/cards/itens-casa/quarto3.png';
import casaQuintal from '../assets/img/cards/itens-casa/quintalouhorta.png';
import casaReboco from '../assets/img/cards/itens-casa/rebocooupintura.png';
import casaTelhado from '../assets/img/cards/itens-casa/telhado.png';
import tipologia01 from '../assets/img/cards/pergunta1/tipologia-01.png';
import tipologia02 from '../assets/img/cards/pergunta1/tipologia-02.png';
import tipologia03 from '../assets/img/cards/pergunta1/tipologia-03.png';
import tipologia04 from '../assets/img/cards/pergunta1/tipologia-04.png';
import tipologia05 from '../assets/img/cards/pergunta1/tipologia-05.png';
import tipologia06 from '../assets/img/cards/pergunta1/tipologia-06.png';
import tipologia07 from '../assets/img/cards/pergunta1/tipologia-07.png';
import tipologia08 from '../assets/img/cards/pergunta1/tipologia-08.png';
import tipologia09 from '../assets/img/cards/pergunta1/tipologia-09.png';
import tipologia10 from '../assets/img/cards/pergunta1/tipologia-10.png';
import tipologia11 from '../assets/img/cards/pergunta1/tipologia-11.png';
import tipologia12 from '../assets/img/cards/pergunta1/tipologia-12.png';
import tipologia13 from '../assets/img/cards/pergunta1/tipologia-13.png';
import tipologia14 from '../assets/img/cards/pergunta1/tipologia-14.png';
import tipologia15 from '../assets/img/cards/pergunta1/tipologia-15.png';
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
  'casa' | 'equipamentos' | 'infraestrutura' | 'mobilidade' | 'riscos' | 'seguranca' | 'tipologia' | 'mudanca';

export interface CardDef {
  id: string;
  label: string;
  category: CardCategory;
  image: string;
  // Quando true, a carta não mostra o texto do nome (a arte já traz o nome).
  hideLabel?: boolean;
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

export const CARDS: CardDef[] = [
  {
    id: 'casa-adaptacao',
    label: 'Adaptação para idosos ou PCD',
    category: 'casa',
    image: casaAdaptacao,
    hideLabel: true,
  },
  { id: 'casa-agua', label: 'Água', category: 'casa', image: casaAgua, hideLabel: true },
  { id: 'casa-aluguel', label: 'Aluguel mais baixo', category: 'casa', image: casaAluguel, hideLabel: true },
  { id: 'casa-banheiro-1', label: 'Banheiro', category: 'casa', image: casaBanheiro1, hideLabel: true },
  { id: 'casa-banheiro-2', label: 'Banheiro', category: 'casa', image: casaBanheiro2, hideLabel: true },
  { id: 'casa-cozinha', label: 'Cozinha separada', category: 'casa', image: casaCozinha, hideLabel: true },
  { id: 'casa-documento', label: 'Documento da casa', category: 'casa', image: casaDocumento, hideLabel: true },
  { id: 'casa-endereco', label: 'Endereço e CEP', category: 'casa', image: casaEndereco, hideLabel: true },
  { id: 'casa-esgoto', label: 'Esgoto', category: 'casa', image: casaEsgoto, hideLabel: true },
  { id: 'casa-garagem', label: 'Garagem ou estacionamento', category: 'casa', image: casaGaragem, hideLabel: true },
  { id: 'casa-lavanderia', label: 'Lavanderia', category: 'casa', image: casaLavanderia, hideLabel: true },
  { id: 'casa-luz', label: 'Luz', category: 'casa', image: casaLuz, hideLabel: true },
  { id: 'casa-sem-fila', label: 'Moradia sem fila de espera', category: 'casa', image: casaSemFila, hideLabel: true },
  { id: 'casa-parede', label: 'Parede de tijolo', category: 'casa', image: casaParede, hideLabel: true },
  { id: 'casa-pisos', label: 'Pisos', category: 'casa', image: casaPisos, hideLabel: true },
  { id: 'casa-quarto-1', label: 'Quarto', category: 'casa', image: casaQuarto1, hideLabel: true },
  { id: 'casa-quarto-2', label: 'Quarto', category: 'casa', image: casaQuarto2, hideLabel: true },
  { id: 'casa-quarto-3', label: 'Quarto', category: 'casa', image: casaQuarto3, hideLabel: true },
  { id: 'casa-quintal', label: 'Quintal ou horta', category: 'casa', image: casaQuintal, hideLabel: true },
  { id: 'casa-reboco', label: 'Reboco ou pintura', category: 'casa', image: casaReboco, hideLabel: true },
  { id: 'casa-telhado', label: 'Telhado', category: 'casa', image: casaTelhado, hideLabel: true },
  {
    id: 'tipologia-01',
    label: 'Habitação Multifamiliar de Conjuntos Habitacionais',
    category: 'tipologia',
    image: tipologia01,
  },
  {
    id: 'tipologia-02',
    label: 'Comunidades de Fundo e Fecho de Pasto (PCTs)',
    category: 'tipologia',
    image: tipologia02,
  },
  { id: 'tipologia-03', label: 'Comunidades Quilombolas (PCTs)', category: 'tipologia', image: tipologia03 },
  {
    id: 'tipologia-04',
    label: 'Habitação Multifamiliar em Edifício Adaptado com Retrofit',
    category: 'tipologia',
    image: tipologia04,
  },
  {
    id: 'tipologia-05',
    label: 'Habitação Unifamiliar de Conjuntos Habitacionais',
    category: 'tipologia',
    image: tipologia05,
  },
  {
    id: 'tipologia-06',
    label: 'Habitação Unifamiliar de Fachada na calçada coroada com platibanda',
    category: 'tipologia',
    image: tipologia06,
  },
  { id: 'tipologia-07', label: 'Terras Indígenas (PCTs)', category: 'tipologia', image: tipologia07 },
  {
    id: 'tipologia-08',
    label: 'Habitação Unifamiliar com produção em área costeira',
    category: 'tipologia',
    image: tipologia08,
  },
  {
    id: 'tipologia-09',
    label: 'Habitação Unifamiliar com produção em zona rural',
    category: 'tipologia',
    image: tipologia09,
  },
  {
    id: 'tipologia-10',
    label: 'Habitação Unifamiliar em Bairro Residencial Formal',
    category: 'tipologia',
    image: tipologia10,
  },
  {
    id: 'tipologia-11',
    label: 'Autoconstrução em Favelas e Comunidades Urbanas',
    category: 'tipologia',
    image: tipologia11,
  },
  {
    id: 'tipologia-12',
    label: 'Ocupação com Domicílios Rústicos sem paredes estruturais',
    category: 'tipologia',
    image: tipologia12,
  },
  { id: 'tipologia-13', label: 'Comunidade de Pescadores Artesanais', category: 'tipologia', image: tipologia13 },
  { id: 'tipologia-14', label: 'Habitação Multifamiliar em Área Central', category: 'tipologia', image: tipologia14 },
  {
    id: 'tipologia-15',
    label: 'Habitação Unifamiliar em Unidade Produtiva Coletiva Rural',
    category: 'tipologia',
    image: tipologia15,
  },
  { id: 'mudanca-casa-nova', label: 'Casa Nova', category: 'mudanca', image: mudancaCasaNova },
  { id: 'mudanca-reforma', label: 'Reforma', category: 'mudanca', image: mudancaReforma },
];

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
