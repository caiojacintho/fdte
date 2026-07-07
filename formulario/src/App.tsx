import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SubmissionProvider } from './submission/SubmissionContext';
import { RequireSubmission } from './components/layout/RequireSubmission';
import { IdentificacaoPage } from './pages/IdentificacaoPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TabuleiroPage } from './pages/TabuleiroPage';
import { ResumoPage } from './pages/ResumoPage';
import { ObrigadoPage } from './pages/ObrigadoPage';

// Ao trocar de rota, leva a próxima página para o topo.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <SubmissionProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<IdentificacaoPage />} />
          <Route
            path="/onboarding"
            element={
              <RequireSubmission>
                <OnboardingPage />
              </RequireSubmission>
            }
          />
          <Route
            path="/jogo/tabuleiro"
            element={
              <RequireSubmission>
                <TabuleiroPage />
              </RequireSubmission>
            }
          />
          <Route path="/jogo/painel" element={<Navigate to="/jogo/tabuleiro" replace />} />
          <Route
            path="/resumo"
            element={
              <RequireSubmission>
                <ResumoPage />
              </RequireSubmission>
            }
          />
          <Route
            path="/obrigado"
            element={
              <RequireSubmission>
                <ObrigadoPage />
              </RequireSubmission>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SubmissionProvider>
  );
}
