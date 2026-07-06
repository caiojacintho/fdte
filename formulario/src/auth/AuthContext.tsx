import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type UserDTO } from '../api/client';

interface AuthContextValue {
  user: UserDTO | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; entity: string; city: string; cpf: string }) => Promise<void>;
  updateProfile: (payload: { name: string; entity: string; city: string; cpf: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fdte_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('fdte_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('fdte_token', token);
    setUser(user);
  }

  async function register(payload: { name: string; email: string; password: string; entity: string; city: string; cpf: string }) {
    const { token, user } = await api.register(payload);
    localStorage.setItem('fdte_token', token);
    setUser(user);
  }

  async function updateProfile(payload: { name: string; entity: string; city: string; cpf: string }) {
    const { user } = await api.updateProfile(payload);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('fdte_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return ctx;
}
