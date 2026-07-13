import boardImg from '../assets/board/tabuleiro.jpg';

export interface BoardData {
  name: string;
  city: string;
  entity: string;
  comoEHoje: string | null; // URL da carta escolhida na etapa 1
  comoMudar: string | null; // URL da carta escolhida na etapa 2
  precisa: string[]; // URLs das cartas da etapa 3, em ordem
}

// Coordenadas dos slots como frações (0-1). As cartas são desenhadas com tamanho
// suficiente para COBRIR o contorno pontilhado (a forma opaca da carta o esconde).
// Centros dos slots medidos diretamente na imagem tabuleiro.jpg (2600×1840):
// cada carta é desenhada centralizada nesses pontos para cair exatamente sobre
// o retângulo pontilhado, escondendo-o por completo.
const COLS = [0.3692, 0.5375, 0.7057, 0.8738];
const ROWS = [0.3501, 0.5818, 0.8212];
const CELL = 0.152; // lado do quadrado da carta (fração da largura) — cobre o contorno pontilhado com folga
const CARD_RATIO = 0.755; // proporção (largura/altura) da carta da etapa 1
const SLOT1 = { cx: 0.162, cy: 0.449, h: 0.432 }; // "Como é hoje" (retângulo)
// "Como mudar" (círculo) — centro medido no disco pontilhado da imagem
// (2600×1840). O bug do tracejado visível era o centro (cy estava 0.812, ~15px
// acima do real 0.8204), não o tamanho: com o centro certo, o diâmetro original
// 0.162 já cobre todo o contorno pontilhado sem ficar grande demais.
const CIRCLE = { cx: 0.159, cy: 0.8204, d: 0.162 };
// Cada valor é escrito à direita do respectivo rótulo (NOME/ENTIDADE/CIDADE),
// alinhado à esquerda e truncado com reticências para não invadir o campo seguinte.
const FIELDS = {
  y: 0.132,
  nome: { x: 0.328, maxW: 0.19 },
  entidade: { x: 0.605, maxW: 0.115 },
  cidade: { x: 0.8, maxW: 0.15 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Desenha uma imagem contida (preservando proporção) e centralizada numa caixa.
async function drawContain(
  ctx: CanvasRenderingContext2D,
  src: string,
  cx: number,
  cy: number,
  boxW: number,
  boxH: number,
  pad = 0.92
) {
  const im = await loadImage(src);
  const bw = boxW * pad;
  const bh = boxH * pad;
  const s = Math.min(bw / im.width, bh / im.height);
  const w = im.width * s;
  const h = im.height * s;
  ctx.drawImage(im, cx - w / 2, cy - h / 2, w, h);
}

function drawFieldText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number
) {
  if (!text) return;
  ctx.font = `600 ${size}px "DM Sans", sans-serif`;
  let t = text;
  if (ctx.measureText(t).width > maxWidth) {
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    t = t.replace(/\s+$/, '') + '…';
  }
  ctx.fillText(t, x, y);
}

// Monta o tabuleiro do jogo preenchido com os dados e as cartas do participante.
async function renderBoard(data: BoardData): Promise<HTMLCanvasElement> {
  await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  const board = await loadImage(boardImg);
  const W = board.naturalWidth || 2400;
  const H = board.naturalHeight || 1698;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(board, 0, 0, W, H);

  // Etapa 1 — Como é hoje (retângulo).
  if (data.comoEHoje) {
    const bh = SLOT1.h * H;
    await drawContain(ctx, data.comoEHoje, SLOT1.cx * W, SLOT1.cy * H, bh * CARD_RATIO, bh, 1);
  }

  // Etapa 2 — Como mudar (círculo).
  if (data.comoMudar) {
    const d = CIRCLE.d * W;
    await drawContain(ctx, data.comoMudar, CIRCLE.cx * W, CIRCLE.cy * H, d, d, 1);
  }

  // Etapa 3 — O que a casa precisa (grade 4×3, ordem: linha por linha).
  const side = CELL * W;
  const cells: { fx: number; fy: number }[] = [];
  for (const fy of ROWS) for (const fx of COLS) cells.push({ fx, fy });
  for (let i = 0; i < data.precisa.length && i < cells.length; i++) {
    await drawContain(ctx, data.precisa[i], cells[i].fx * W, cells[i].fy * H, side, side, 1);
  }

  // Campos de texto: valor à direita de cada rótulo, truncado com reticências.
  ctx.fillStyle = '#3b2a20';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const size = Math.round(W * 0.013);
  const y = FIELDS.y * H;
  drawFieldText(ctx, data.name, FIELDS.nome.x * W, y, FIELDS.nome.maxW * W, size);
  drawFieldText(ctx, data.entity, FIELDS.entidade.x * W, y, FIELDS.entidade.maxW * W, size);
  drawFieldText(ctx, data.city, FIELDS.cidade.x * W, y, FIELDS.cidade.maxW * W, size);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem.'))), type, quality);
  });
}

export async function buildImageFile(data: BoardData): Promise<File> {
  const canvas = await renderBoard(data);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.94);
  return new File([blob], 'tabuleiro-planehab.jpg', { type: 'image/jpeg' });
}

type ShareResult = 'shared' | 'downloaded';

// Abre a folha de compartilhamento do sistema (Web Share API) quando disponível
// — no iOS/Android e em navegadores de desktop compatíveis. Caso contrário,
// baixa o arquivo como alternativa.
export async function shareFile(file: File, title: string, text: string): Promise<ShareResult> {
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data?: ShareData) => Promise<void>;
  };

  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title, text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
