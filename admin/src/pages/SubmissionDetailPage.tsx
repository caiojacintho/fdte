import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { api, type PlacementDTO, type SubmissionDetail } from '../api/client';
import { CATEGORY_COLORS, getCard, getPainelCard, type CardDef } from '../data/cards';

function CardChip({ card }: { card?: CardDef }) {
  if (!card) {
    return <span style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>— vazio —</span>;
  }
  const color = CATEGORY_COLORS[card.category];
  return (
    <span
      className="badge"
      style={{ background: color + '18', color, borderColor: 'transparent', fontSize: '0.8rem' }}
    >
      {card.label}
    </span>
  );
}

export function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  const casaCards = placements
    .filter((p) => p.board === 'tabuleiro' && p.slot_key.startsWith('precisa_'))
    .map((p) => getCard(p.card_id))
    .filter((c): c is CardDef => Boolean(c));

  const bairroCards = placements
    .filter((p) => p.board === 'painel')
    .map((p) => getPainelCard(p.card_id))
    .filter((c): c is CardDef => Boolean(c));

  return (
    <div>
      <Header />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 80px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-soft)',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        {loading ? (
          <p style={{ marginTop: 24, color: 'var(--text-soft)' }}>Carregando…</p>
        ) : !submission ? (
          <p style={{ marginTop: 24, color: 'var(--text-soft)' }}>Resposta não encontrada.</p>
        ) : (
          <>
            <div className="card" style={{ padding: 22, margin: '18px 0 24px' }}>
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

            {/* Etapa 1 — Como é hoje */}
            <FieldCard label="1. Como é hoje">
              <CardChip card={comoEHoje} />
            </FieldCard>

            {/* Etapa 2 — Como mudar */}
            <FieldCard label="2. Como mudar">
              <CardChip card={comoMudar} />
            </FieldCard>

            {/* Etapa 3 — O que minha casa precisa */}
            <SectionCard label="3. O que minha casa precisa" count={casaCards.length}>
              {casaCards.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {casaCards.map((c, i) => (
                    <CardChip key={`${c.id}-${i}`} card={c} />
                  ))}
                </div>
              ) : (
                <EmptyHint />
              )}
            </SectionCard>

            {/* Etapa 4 — O que o meu bairro precisa */}
            <SectionCard label="4. O que o meu bairro precisa" count={bairroCards.length}>
              {bairroCards.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {bairroCards.map((c, i) => (
                    <CardChip key={`${c.id}-${i}`} card={c} />
                  ))}
                </div>
              ) : (
                <EmptyHint />
              )}
            </SectionCard>
          </>
        )}
      </main>
    </div>
  );
}

function FieldCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 14 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)', fontWeight: 700, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SectionCard({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: '14px 18px', marginBottom: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.78rem',
          color: 'var(--text-faint)',
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {label}
        <span className="badge" style={{ fontSize: '0.7rem' }}>
          {count} {count === 1 ? 'carta' : 'cartas'}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyHint() {
  return <span style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Nenhuma carta escolhida.</span>;
}
