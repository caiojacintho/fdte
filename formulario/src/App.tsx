import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { TabuleiroPage } from './pages/TabuleiroPage';
import { ResumoPage } from './pages/ResumoPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jogo/tabuleiro"
            element={
              <ProtectedRoute>
                <TabuleiroPage />
              </ProtectedRoute>
            }
          />
          <Route path="/jogo/painel" element={<Navigate to="/jogo/tabuleiro" replace />} />
          <Route
            path="/resumo"
            element={
              <ProtectedRoute>
                <ResumoPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
