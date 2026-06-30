import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { api, type SubmissionDetail } from '../api/client';
import { CATEGORY_COLORS, getCard } from '../data/cards';

const TABULEIRO_SLOTS: { key: string; label: string }[] = [
  { key: 'como_e_hoje', label: 'Como é hoje' },
  { key: 'como_mudar', label: 'Como mudar' },
  ...Array.from({ length: 12 }, (_, i) => ({ key: `precisa_${i + 1}`, label: `Precisa #${i + 1}` })),
];

const PAINEL_SLOTS = Array.from({ length: 13 }, (_, i) => `hex_${i + 1}`);

function CardChip({ cardId }: { cardId?: string }) {
  const card = cardId ? getCard(cardId) : undefined;
  if (!card) {
    return (
      <span style={{ color: 'var(--color-ink-faint)', fontSize: '0.85rem' }}>— vazio —</span>
    );
  }
  return (
    <span
      className="badge"
      style={{ background: CATEGORY_COLORS[card.category] + '33', color: CATEGORY_COLORS[card.category] }}
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

  function placement(board: string, slotKey: string) {
    return submission?.placements.find((p) => p.board === board && p.slot_key === slotKey)?.card_id;
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px 80px' }}>
        <Link to="/" style={{ color: 'var(--color-secondary-dark)', fontWeight: 700 }}>
          ← Voltar
        </Link>

        {loading ? (
          <p style={{ marginTop: 20 }}>Carregando...</p>
        ) : !submission ? (
          <p style={{ marginTop: 20 }}>Submissão não encontrada.</p>
        ) : (
          <>
            <div className="card-surface" style={{ padding: 20, margin: '20px 0' }}>
              <h2 style={{ color: 'var(--color-primary-dark)' }}>{submission.name}</h2>
              <p style={{ color: 'var(--color-ink-soft)', marginTop: 6 }}>
                {submission.entity} · {submission.city} · {submission.email}
              </p>
              <p style={{ marginTop: 10 }}>
                <span
                  className="badge"
                  style={
                    submission.status === 'completed'
                      ? { background: '#d9efda', color: 'var(--color-success)' }
                      : undefined
                  }
                >
                  {submission.status === 'completed' ? 'Concluída' : 'Em andamento'}
                </span>
              </p>
            </div>

            <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: 12 }}>Tabuleiro da casa</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
                marginBottom: 28,
              }}
            >
              {TABULEIRO_SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  className="card-surface"
                  style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)' }}>{slot.label}</span>
                  <CardChip cardId={placement('tabuleiro', slot.key)} />
                </div>
              ))}
            </div>

            <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: 12 }}>Painel Nosso Bairro</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              {PAINEL_SLOTS.map((key, i) => (
                <div
                  key={key}
                  className="card-surface"
                  style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-faint)' }}>Espaço #{i + 1}</span>
                  <CardChip cardId={placement('painel', key)} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
