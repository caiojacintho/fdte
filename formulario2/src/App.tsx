import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BoardPage } from './components/BoardPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* Aviso quando a tela é pequena — o Jogo do Bairro é só para desktop. */}
      <div className="desktop-only-guard">
        <div className="desktop-only-card">
          <h2>Abra em um computador 💻</h2>
          <p>
            O Jogo do Bairro foi feito para telas grandes. Acesse este link em um desktop ou notebook para arrastar as
            cartas no painel.
          </p>
        </div>
      </div>

      <div className="app-shell">
        <Routes>
          <Route path="/acesso/:code" element={<BoardPage />} />
          <Route path="/" element={<BoardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
