const API = '/api';

export async function parseOrder(rawText) {
  const res = await fetch(`${API}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
