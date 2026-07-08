// Mapa id da carta → imagem, usado apenas para renderizar o tabuleiro preenchido
// na tela de detalhes da resposta. As imagens são as mesmas do formulário
// (etapas do tabuleiro: tipologia, mudança e itens da casa).
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

export const CARD_IMAGES: Record<string, string> = {
  'casa-adaptacao': casaAdaptacao,
  'casa-agua': casaAgua,
  'casa-aluguel': casaAluguel,
  'casa-banheiro-1': casaBanheiro1,
  'casa-banheiro-2': casaBanheiro2,
  'casa-cozinha': casaCozinha,
  'casa-documento': casaDocumento,
  'casa-endereco': casaEndereco,
  'casa-esgoto': casaEsgoto,
  'casa-garagem': casaGaragem,
  'casa-lavanderia': casaLavanderia,
  'casa-luz': casaLuz,
  'casa-sem-fila': casaSemFila,
  'casa-parede': casaParede,
  'casa-pisos': casaPisos,
  'casa-quarto-1': casaQuarto1,
  'casa-quarto-2': casaQuarto2,
  'casa-quarto-3': casaQuarto3,
  'casa-quintal': casaQuintal,
  'casa-reboco': casaReboco,
  'casa-telhado': casaTelhado,
  'tipologia-01': tipologia01,
  'tipologia-02': tipologia02,
  'tipologia-03': tipologia03,
  'tipologia-04': tipologia04,
  'tipologia-05': tipologia05,
  'tipologia-06': tipologia06,
  'tipologia-07': tipologia07,
  'tipologia-08': tipologia08,
  'tipologia-09': tipologia09,
  'tipologia-10': tipologia10,
  'tipologia-11': tipologia11,
  'tipologia-12': tipologia12,
  'tipologia-13': tipologia13,
  'tipologia-14': tipologia14,
  'tipologia-15': tipologia15,
  'mudanca-casa-nova': mudancaCasaNova,
  'mudanca-reforma': mudancaReforma,
};

export function getCardImage(id: string | null | undefined): string | null {
  if (!id) return null;
  return CARD_IMAGES[id] ?? null;
}
