const API = '/api';

export async function getOrders(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/orders${q ? `?${q}` : ''}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrder(id) {
  const res = await fetch(`${API}/orders/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createOrder(order) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateOrder(id, order) {
  const res = await fetch(`${API}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
