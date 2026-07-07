import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/layout/BrandHeader';

interface Slide {
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    title: 'Seja bem-vindo(a)',
    body:
      'Esta é a Consulta Popular da Habitação do PLANEHAB. Sua opinião vai ajudar o Governo do Estado da Bahia a entender, na prática, como sua moradia é hoje e o que ela precisa para melhorar. Tudo o que você responder aqui é registrado e analisado pelos gestores responsáveis pelas políticas de habitação.',
  },
  {
    title: 'Um jogo em 3 etapas',
    body:
      'Em vez de um formulário tradicional, você vai jogar um jogo de tabuleiro digital: arraste ou clique nas cartas com imagens para levá-las aos espaços indicados, igual a um tabuleiro de mesa. São 3 etapas no total, todas sobre a sua casa.',
  },
  {
    title: 'Sobre a sua casa',
    body:
      'As três etapas são sobre a sua moradia: (1) Como é hoje — escolha 1 carta que representa como é a sua casa atualmente; (2) O que mudar — escolha 1 carta com a mudança mais importante para você; (3) O que a casa precisa — escolha até 12 cartas com o que a sua casa mais precisa.',
  },
  {
    title: 'Como jogar',
    body:
      'No computador, clique e arraste as cartas até o espaço desejado. No celular, basta tocar na carta para selecioná-la e colocá-la no espaço. Para remover uma carta de um espaço, basta clicar no "×".',
  },
];

export function OnboardingPage() {
  const location = useLocation();
  const startAtLast = (location.state as { startAtLast?: boolean } | null)?.startAtLast;
  const [index, setIndex] = useState(startAtLast ? SLIDES.length - 1 : 0);
  const navigate = useNavigate();
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    // Layout: header de marca no topo + card centralizado abaixo.
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <BrandHeader />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 24px 64px',
        }}
      >
        <div className="card-surface" style={{ maxWidth: 560, width: '100%', padding: '40px 36px' }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {SLIDES.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? 28 : 10,
                height: 10,
                borderRadius: 999,
                background: i === index ? 'var(--color-primary)' : 'var(--color-bg-deep)',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', marginBottom: 16, textAlign: 'center' }}>
          {slide.title}
        </h1>
        <p style={{ color: 'var(--color-ink-soft)', fontSize: '1.05rem', textAlign: 'center', minHeight: 140 }}>
          {slide.body}
        </p>

        {index === 0 ? (
          <div style={{ marginTop: 28 }}>
            <button
              className="btn"
              type="button"
              style={{ width: '100%' }}
              onClick={() => setIndex((i) => i + 1)}
            >
              Iniciar
            </button>
          </div>
        ) : (
          <div className="onboarding-nav">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              Voltar
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => (isLast ? navigate('/jogo/tabuleiro') : setIndex((i) => i + 1))}
            >
              {isLast ? 'Começar o jogo' : 'Próximo'}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
