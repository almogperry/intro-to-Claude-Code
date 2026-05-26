const API_BASE = '/api';

export async function fetchState() {
  const r = await fetch(`${API_BASE}/state`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function createTask(payload) {
  const r = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function updateTask(id, payload) {
  const r = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

export async function deleteTask(id) {
  const r = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
}
