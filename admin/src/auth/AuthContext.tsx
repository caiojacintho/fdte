import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type UserDTO } from '../api/client';

interface AuthContextValue {
  user: UserDTO | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fdte_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => {
        if (user.role !== 'admin') {
          localStorage.removeItem('fdte_admin_token');
          setUser(null);
        } else {
          setUser(user);
        }
      })
      .catch(() => localStorage.removeItem('fdte_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await api.login({ email, password });
    if (user.role !== 'admin') {
      throw new Error('Esta conta não tem acesso ao painel administrativo.');
    }
    localStorage.setItem('fdte_admin_token', token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('fdte_admin_token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
