// Rótulos das cartas do "Jogo do Bairro" (Etapa 2), para o painel exibir os
// nomes das cartas escolhidas por cada grupo (o servidor guarda só o id/slug).
export const BAIRRO_CARD_LABELS: Record<string, string> = {
  arvores: 'Árvores',
  'centro-cultural': 'Centro Cultural',
  creche: 'Creche',
  escola: 'Escola',
  praca: 'Praça',
  quadra: 'Quadra',
  saude: 'Saúde',
  agua: 'Água',
  'coleta-lixo': 'Coleta de Lixo',
  esgoto: 'Esgoto',
  iluminacao: 'Iluminação',
  internet: 'Internet',
  acessibilidade: 'Acessibilidade (idosos e PCD)',
  asfalto: 'Asfalto',
  calcada: 'Calçada',
  ciclovia: 'Ciclovia',
  'transporte-publico': 'Transporte Público',
  'contencao-encostas': 'Contenção de Encostas',
  'prevencao-enchentes': 'Prevenção de Enchentes',
  seguranca: 'Segurança',
};

export function bairroCardLabel(id: string): string {
  return BAIRRO_CARD_LABELS[id] ?? id;
}

export function codeFromUrl(url: string): string {
  return url.split('/').pop() ?? '';
}
