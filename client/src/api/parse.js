import { API, apiFetch, safeJson } from './client';

/** Check if AI parsing is available (OPENAI_API_KEY + use_ai_parsing enabled) */
export async function getParseStatus() {
  const res = await apiFetch(`${API}/parse/status`);
  return safeJson(res);
}

export async function parseOrder(rawText) {
  const res = await apiFetch(`${API}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return safeJson(res);
}

/** Test OpenAI connection - returns { ok, model?, error? } */
export async function testOpenAIConnection() {
  const res = await apiFetch(`${API}/parse/test`);
  return safeJson(res);
}
