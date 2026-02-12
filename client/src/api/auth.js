import { API, safeJson } from './client';

const TOKEN_KEY = 'order_desk_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAuthStatus() {
  const res = await fetch(`${API}/auth/status`);
  return safeJson(res);
}

export async function login(password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
    credentials: 'include',
  });
  const data = await safeJson(res);
  if (data.token) setStoredToken(data.token);
  return data;
}

export async function logout() {
  setStoredToken(null);
  try {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch {}
}
