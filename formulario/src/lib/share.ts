import sedurLogo from '../assets/logos/sedur.svg';
import planehabLogo from '../assets/logos/planehab.svg';
import fdteLogo from '../assets/logos/fdte.png';

export interface ComprovanteData {
  name: string;
  city: string;
  entity: string;
  dateLabel: string;
}

// Paleta (espelha as variáveis do theme.css).
const C = {
  paper: '#faf1e0',
  ink: '#3b2a20',
  inkSoft: '#6b4f3a',
  inkFaint: '#9a8268',
  primaryDark: '#934c22',
  success: '#3f9142',
  divider: '#ecd2a4',
};

const FONT = '"DM Sans", system-ui, sans-serif';
const WIDTH = 520;
const PAD_X = 44;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Desenha o comprovante num canvas (renderização manual — confiável e sem
// dependência de captura de DOM). Retorna o canvas e suas dimensões em px CSS.
async function renderComprovante(
  data: ComprovanteData
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  const [sedur, planehab, fdte] = await Promise.all([
    loadImage(sedurLogo),
    loadImage(planehabLogo),
    loadImage(fdteLogo),
  ]);

  const contentW = WIDTH - PAD_X * 2;
  const measure = document.createElement('canvas').getContext('2d')!;

  const setFont = (ctx: CanvasRenderingContext2D, weight: number, size: number) => {
    ctx.font = `${weight} ${size}px ${FONT}`;
  };

  // Pré-calcula as quebras de linha para dimensionar a altura do canvas.
  setFont(measure, 700, 24);
  const titleLines = wrapText(measure, 'Consulta Popular da Habitação', contentW);
  setFont(measure, 800, 22);
  const nameLines = wrapText(measure, data.name || '—', contentW);
  setFont(measure, 400, 16);
  const metaLines = wrapText(measure, [data.entity, data.city].filter(Boolean).join('  ·  '), contentW);

  const logoH = 40;
  let y = 44; // padding topo
  y += logoH + 22; // linha de logos
  y += 64 + 16; // círculo de check
  y += titleLines.length * 30 + 6; // título
  y += 18 + 22; // subtítulo
  y += 22 + 4; // "Registramos a participação de"
  y += nameLines.length * 28 + 4; // nome
  y += metaLines.length * 22 + 18; // entidade · cidade
  y += 18 + 22; // data
  y += 16 + 18; // divisória + rodapé
  const height = y + 30; // padding inferior

  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const cx = WIDTH / 2;

  // Fundo + borda arredondada.
  const r = 28;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(WIDTH, 0, WIDTH, height, r);
  ctx.arcTo(WIDTH, height, 0, height, r);
  ctx.arcTo(0, height, 0, 0, r);
  ctx.arcTo(0, 0, WIDTH, 0, r);
  ctx.closePath();
  ctx.fillStyle = C.paper;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.inkSoft;
  ctx.stroke();

  // Logos centralizados.
  const dims = [sedur, planehab, fdte].map((img) => ({ img, w: (logoH * img.naturalWidth) / img.naturalHeight }));
  const gap = 22;
  const totalW = dims.reduce((s, d) => s + d.w, 0) + gap * (dims.length - 1);
  let lx = cx - totalW / 2;
  const logoY = 44;
  for (const d of dims) {
    ctx.drawImage(d.img, lx, logoY, d.w, logoH);
    lx += d.w + gap;
  }
  y = logoY + logoH + 22;

  // Círculo de check.
  const circleR = 32;
  const circleCy = y + circleR;
  ctx.beginPath();
  ctx.arc(cx, circleCy, circleR, 0, Math.PI * 2);
  ctx.fillStyle = C.success;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  setFont(ctx, 700, 34);
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', cx, circleCy + 2);
  ctx.textBaseline = 'alphabetic';
  y = circleCy + circleR + 16;

  // Título.
  setFont(ctx, 700, 24);
  ctx.fillStyle = C.primaryDark;
  for (const line of titleLines) {
    y += 24;
    ctx.fillText(line, cx, y);
    y += 6;
  }
  y += 6;

  // Subtítulo.
  setFont(ctx, 700, 12.5);
  ctx.fillStyle = C.inkFaint;
  ctx.letterSpacing = '1px';
  y += 12;
  ctx.fillText('COMPROVANTE DE PARTICIPAÇÃO', cx, y);
  ctx.letterSpacing = '0px';
  y += 30;

  // Linha de introdução.
  setFont(ctx, 400, 16);
  ctx.fillStyle = C.inkSoft;
  y += 16;
  ctx.fillText('Registramos a participação de', cx, y);
  y += 10;

  // Nome.
  setFont(ctx, 800, 22);
  ctx.fillStyle = C.ink;
  for (const line of nameLines) {
    y += 24;
    ctx.fillText(line, cx, y);
    y += 4;
  }

  // Entidade · cidade.
  setFont(ctx, 400, 16);
  ctx.fillStyle = C.inkSoft;
  for (const line of metaLines) {
    y += 18;
    ctx.fillText(line, cx, y);
    y += 4;
  }
  y += 16;

  // Data.
  setFont(ctx, 400, 14);
  ctx.fillStyle = C.inkFaint;
  y += 14;
  ctx.fillText(`Enviado em ${data.dateLabel}`, cx, y);
  y += 24;

  // Divisória + rodapé.
  ctx.strokeStyle = C.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD_X, y);
  ctx.lineTo(WIDTH - PAD_X, y);
  ctx.stroke();
  y += 20;
  setFont(ctx, 700, 12.8);
  ctx.fillStyle = C.inkFaint;
  ctx.fillText('PLANEHAB · Governo do Estado da Bahia', cx, y);

  return { canvas, width: WIDTH, height };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem.'))), type, quality);
  });
}

export async function buildImageFile(data: ComprovanteData): Promise<File> {
  const { canvas } = await renderComprovante(data);
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
  return new File([blob], 'comprovante-planehab.jpg', { type: 'image/jpeg' });
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
