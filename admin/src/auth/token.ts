// Token do painel admin. "Lembrar-me" define onde guardar:
// - localStorage: persiste entre sessões do navegador.
// - sessionStorage: some ao fechar a aba.
const KEY = 'fdte_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
}

export function setToken(token: string, remember: boolean) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
