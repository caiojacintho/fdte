import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { api } from '../api/client';
import type { PlacementDTO, SubmissionDetail } from '@fdte/shared-types';
import { getCard, type CardDef } from '../data/cards';
import { getCardImage } from '../data/cardImages';
import { buildBoardUrl } from '../lib/board';

export function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardUrl, setBoardUrl] = useState<string | null>(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getSubmission(Number(id))
      .then(({ submission }) => setSubmission(submission))
      .finally(() => setLoading(false));
  }, [id]);

  const placements: PlacementDTO[] = submission?.placements ?? [];
  const findTabuleiro = (slotKey: string) =>
    placements.find((p) => p.board === 'tabuleiro' && p.slot_key === slotKey)?.card_id;

  const comoEHoje = getCard(findTabuleiro('como_e_hoje'));
  const comoMudar = getCard(findTabuleiro('como_mudar'));

  const casaPlacements = placements
    .filter((p) => p.board === 'tabuleiro' && p.slot_key.startsWith('precisa_'))
    .sort((a, b) => a.slot_key.localeCompare(b.slot_key, undefined, { numeric: true }));

  const casaCards = casaPlacements.map((p) => getCard(p.card_id)).filter((c): c is CardDef => Boolean(c));

  // Gera a imagem do tabuleiro com as cartas do participante, na mesma ordem.
  async function handleViewBoard() {
    if (!submission) return;
    setBoardError(null);
    setBoardLoading(true);
    try {
      const url = await buildBoardUrl({
        name: submission.name,
        city: submission.city,
        entity: submission.entity,
        comoEHoje: getCardImage(findTabuleiro('como_e_hoje')),
        comoMudar: getCardImage(findTabuleiro('como_mudar')),
        precisa: casaPlacements.map((p) => getCardImage(p.card_id)).filter((img): img is string => Boolean(img)),
      });
      setBoardUrl(url);
    } catch {
      setBoardError('Não foi possível gerar o tabuleiro. Tente novamente.');
    } finally {
      setBoardLoading(false);
    }
  }

  function closeBoard() {
    if (boardUrl) URL.revokeObjectURL(boardUrl);
    setBoardUrl(null);
  }

  return (
    <div className="mural-bg">
      <Header />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div
          className="detail-top-actions"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <Link to="/" className="btn btn-secondary icon-btn" aria-label="Voltar" title="Voltar">
            <ArrowLeft size={16} />
          </Link>
          {submission && (
            <button className="btn btn-secondary" type="button" onClick={handleViewBoard} disabled={boardLoading}>
              {boardLoading ? 'Gerando tabuleiro…' : 'Ver tabuleiro'}
            </button>
          )}
        </div>
        {boardError && (
          <p className="error-text" style={{ marginTop: 8 }}>
            {boardError}
          </p>
        )}

        {loading ? (
          <p style={{ marginTop: 24, color: 'var(--text-soft)' }}>Carregando…</p>
        ) : !submission ? (
          <p style={{ marginTop: 24, color: 'var(--text-soft)' }}>Resposta não encontrada.</p>
        ) : (
          <>
            <div className="review-card" style={{ padding: 22, margin: '18px 0 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: '1.3rem' }}>{submission.name}</h1>
                  <p style={{ color: 'var(--text-soft)', marginTop: 6, fontSize: '0.9rem' }}>
                    {submission.entity} · {submission.city}
                  </p>
                </div>
                <span
                  className={`badge ${submission.status === 'completed' ? 'badge-success' : 'badge-warning'}`}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {submission.status === 'completed' ? 'Enviada' : 'Em andamento'}
                </span>
              </div>
            </div>

            {/* Etapas — mesma UI dos cards da revisão do formulário */}
            <ReviewFieldCard label="Como é hoje" card={comoEHoje} />
            <ReviewFieldCard label="Como mudar" card={comoMudar} />
            <ReviewSectionCard label="O que minha casa precisa" cards={casaCards} />
          </>
        )}
      </main>

      {/* Visualização do tabuleiro preenchido pelo participante (mesma imagem
          gerada no formulário ao concluir o envio). */}
      {boardUrl && (
        <div className="modal-overlay" onClick={closeBoard}>
          <img
            src={boardUrl}
            alt="Tabuleiro preenchido"
            className="board-preview-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="btn" type="button" onClick={closeBoard} style={{ position: 'fixed', top: 16, right: 16 }}>
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}

// Card de etapa única (1 e 2): imagem da carta + rótulo pequeno + nome.
function ReviewFieldCard({ label, card }: { label: string; card?: CardDef }) {
  const img = card ? getCardImage(card.id) : null;
  return (
    <div className="review-card review-field">
      {img ? (
        <img src={img} alt={card!.label} className="review-field-img" />
      ) : (
        <div className="review-field-img review-empty" />
      )}
      <div className="review-field-text">
        <span className="review-label">{label}</span>
        <strong className="review-name">{card?.label ?? '—'}</strong>
      </div>
    </div>
  );
}

// Card da etapa 3: rótulo + grade com as imagens das cartas.
function ReviewSectionCard({ label, cards }: { label: string; cards: CardDef[] }) {
  return (
    <div className="review-card review-section">
      <span className="review-label">{label}</span>
      {cards.length > 0 ? (
        <div className="card-grid">
          {cards.map((c, i) => {
            const img = getCardImage(c.id);
            return img ? (
              <img key={`${c.id}-${i}`} src={img} alt={c.label} title={c.label} className="mini-card" />
            ) : (
              <span key={`${c.id}-${i}`} className="review-name" style={{ fontSize: '0.85rem' }}>
                {c.label}
              </span>
            );
          })}
        </div>
      ) : (
        <span className="review-empty-hint">Nenhuma carta escolhida.</span>
      )}
    </div>
  );
}
