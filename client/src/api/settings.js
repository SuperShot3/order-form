import { API, apiFetch, safeJson } from './client';

export async function getSettings() {
  const res = await apiFetch(`${API}/settings`);
  return safeJson(res);
}

export async function updateSettings(settings) {
  const res = await apiFetch(`${API}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return safeJson(res);
}
