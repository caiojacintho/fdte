import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GlobalTooltip } from './components/GlobalTooltip';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage';
import { AccountPage } from './pages/AccountPage';
import { SuportePage } from './pages/SuportePage';
import { TransmissionPage } from './pages/TransmissionPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissoes/:id"
            element={
              <ProtectedRoute>
                <SubmissionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conta"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suporte"
            element={
              <ProtectedRoute>
                <SuportePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transmissoes/:id"
            element={
              <ProtectedRoute>
                <TransmissionPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalTooltip />
      </BrowserRouter>
    </AuthProvider>
  );
}
