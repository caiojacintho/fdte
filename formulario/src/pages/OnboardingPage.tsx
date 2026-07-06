import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  title: string;
  body: string;
  bullets?: string[];
}

const SLIDES: Slide[] = [
  {
    title: 'Seja bem-vindo(a)',
    body:
      'Esta é a Consulta Popular da Habitação do PLANEHAB. Sua opinião vai ajudar o Governo do Estado da Bahia a entender, na prática, como sua moradia e seu bairro são hoje e o que precisam para melhorar. Tudo o que você responder aqui é registrado e analisado pelos gestores responsáveis pelas políticas de habitação.',
  },
  {
    title: 'Um jogo, duas etapas',
    body:
      'Em vez de um formulário tradicional, você vai jogar um jogo de tabuleiro digital: arraste cartas com imagens para os espaços indicados, igual a um tabuleiro de mesa. O jogo tem duas etapas: primeiro o tabuleiro da sua casa, depois o do seu bairro.',
  },
  {
    title: 'Etapa 1 — O tabuleiro da minha casa',
    body: 'Aqui você responde em 3 passos:',
    bullets: [
      'Como é hoje — escolha a carta que melhor representa a situação atual da sua moradia;',
      'Como mudar — escolha a carta que representa a mudança mais importante para você;',
      'O que minha casa precisa — escolha até 12 cartas com os itens que sua casa mais precisa.',
    ],
  },
  {
    title: 'Etapa 2 — O painel Nosso Bairro',
    body:
      'Depois do tabuleiro da casa, você preenche o painel em formato de colmeia do seu bairro, arrastando cartas de equipamentos públicos, infraestrutura, mobilidade, segurança e riscos para os espaços hexagonais — mostrando o que falta e o que é prioridade onde você mora.',
  },
  {
    title: 'Como jogar',
    body:
      'No computador, clique e arraste as cartas até o espaço desejado. No celular ou tablet, toque e segure a carta para arrastá-la. Para remover uma carta de um espaço, toque nela e depois no "×" que aparece. Você pode salvar e continuar depois — suas respostas ficam guardadas automaticamente.',
  },
];

export function OnboardingPage() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
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
        <div style={{ minHeight: 140 }}>
          <p
            style={{
              color: 'var(--color-ink-soft)',
              fontSize: '1.05rem',
              textAlign: 'center',
              marginBottom: slide.bullets ? 12 : 0,
            }}
          >
            {slide.body}
          </p>
          {slide.bullets && (
            <ul
              style={{
                color: 'var(--color-ink-soft)',
                fontSize: '1.05rem',
                textAlign: 'left',
                margin: 0,
                paddingLeft: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {slide.bullets.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>

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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
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
  );
}
