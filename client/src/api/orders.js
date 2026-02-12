import { API, apiFetch, safeJson } from './client';

export async function getOrdersSummary() {
  const res = await apiFetch(`${API}/orders/summary`);
  return safeJson(res);
}

export async function getOrders(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await apiFetch(`${API}/orders${q ? `?${q}` : ''}`);
  return safeJson(res);
}

export async function getOrder(id) {
  const res = await apiFetch(`${API}/orders/${id}`);
  return safeJson(res);
}

export async function createOrder(order) {
  const res = await apiFetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return safeJson(res);
}

export async function updateOrder(id, order) {
  const res = await apiFetch(`${API}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return safeJson(res);
}
