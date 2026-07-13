import { bairroBoardImage, getBairroCardImage, PAINEL_SLOTS, HEX_W } from '../data/bairroBoard';
import { bairroCardLabel } from '../data/bairroCards';

// Reproduz o tabuleiro "Nosso Bairro" preenchido de um grupo (Etapa 2): a arte do
// painel do grupo com cada carta posicionada sobre o seu hexágono — espelho do
// visualizador de formulario2, aqui em modo somente-leitura.
export function BairroBoardPreview({
  board,
  placements,
}: {
  board: number;
  placements: Record<string, string>;
}) {
  return (
    <div className="bairro-preview">
      <img
        className="bairro-preview-img"
        src={bairroBoardImage(board)}
        alt="Painel Nosso Bairro preenchido"
        draggable={false}
      />
      {PAINEL_SLOTS.map((s) => {
        const cardId = placements[s.key];
        const img = getBairroCardImage(cardId);
        if (!img) return null;
        return (
          <div
            key={s.key}
            className="bairro-preview-hex"
            style={{ left: `${s.cx * 100}%`, top: `${s.cy * 100}%`, width: `${HEX_W * 100}%` }}
          >
            <img src={img} alt={bairroCardLabel(cardId)} draggable={false} />
          </div>
        );
      })}
    </div>
  );
}
