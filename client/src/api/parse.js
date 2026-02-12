import { API, safeJson } from './client';

export async function parseOrder(rawText) {
  const res = await fetch(`${API}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return safeJson(res);
}

/** Test OpenAI connection - returns { ok, model?, error? } */
export async function testOpenAIConnection() {
  const res = await fetch(`${API}/parse/test`);
  return safeJson(res);
}
