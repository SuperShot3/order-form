const API = '/api';

const BACKEND_UNAVAILABLE = 'Backend is not available. Run the app locally with `npm run dev` for full functionality.';

let getAuthHeader = () => ({});
let onUnauthorized = () => {};

export function setAuthHeaderGetter(fn) {
  getAuthHeader = fn;
}

export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

export async function apiFetch(url, options = {}) {
  const headers = { ...getAuthHeader(), ...options.headers };
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  if (res.status === 401) {
    onUnauthorized();
    throw new Error('Authentication required');
  }
  return res;
}

function safeParseJson(text) {
  if (!text || (typeof text === 'string' && text.trim().startsWith('<'))) {
    throw new Error(BACKEND_UNAVAILABLE);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || BACKEND_UNAVAILABLE);
  }
}

async function safeJson(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return safeParseJson(text);
}

export { API, BACKEND_UNAVAILABLE, safeJson };
