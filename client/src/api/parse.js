import { API, safeJson } from './client';

export async function parseOrder(rawText) {
  const res = await fetch(`${API}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return safeJson(res);
}
