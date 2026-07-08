import boardImg from '../assets/board/tabuleiro.jpg';

// Reproduz o tabuleiro preenchido do participante — a mesma arte gerada no
// formulário ao concluir o envio. As coordenadas dos slots são frações (0-1)
// da imagem de fundo, idênticas às usadas no app do formulário.

export interface BoardData {
  name: string;
  city: string;
  entity: string;
  comoEHoje: string | null; // URL da carta escolhida na etapa 1
  comoMudar: string | null; // URL da carta escolhida na etapa 2
  precisa: string[]; // URLs das cartas da etapa 3, em ordem
}

const COLS = [0.369, 0.531, 0.693, 0.855];
const ROWS = [0.368, 0.583, 0.798];
const CELL = 0.149;
const CARD_RATIO = 0.755;
const SLOT1 = { cx: 0.162, cy: 0.449, h: 0.432 };
const CIRCLE = { cx: 0.156, cy: 0.812, d: 0.162 };
const FIELDS = {
  y: 0.132,
  nome: { x: 0.335, maxW: 0.185 },
  entidade: { x: 0.615, maxW: 0.105 },
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

  if (data.comoEHoje) {
    const bh = SLOT1.h * H;
    await drawContain(ctx, data.comoEHoje, SLOT1.cx * W, SLOT1.cy * H, bh * CARD_RATIO, bh, 1);
  }

  if (data.comoMudar) {
    const d = CIRCLE.d * W;
    await drawContain(ctx, data.comoMudar, CIRCLE.cx * W, CIRCLE.cy * H, d, d, 1);
  }

  const side = CELL * W;
  const cells: { fx: number; fy: number }[] = [];
  for (const fy of ROWS) for (const fx of COLS) cells.push({ fx, fy });
  for (let i = 0; i < data.precisa.length && i < cells.length; i++) {
    await drawContain(ctx, data.precisa[i], cells[i].fx * W, cells[i].fy * H, side, side, 1);
  }

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

// Gera o tabuleiro e devolve uma URL de objeto pronta para exibir em <img>.
export async function buildBoardUrl(data: BoardData): Promise<string> {
  const canvas = await renderBoard(data);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.94);
  return URL.createObjectURL(blob);
}
