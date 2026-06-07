// Thin fetch wrapper over the backend API.

async function request(method, path) {
  const resp = await fetch(path, { method });
  if (!resp.ok) {
    let message = `${method} ${path} failed (${resp.status})`;
    try {
      const body = await resp.json();
      if (body && body.error) message = body.error;
    } catch (_) {}
    throw new Error(message);
  }
  return resp.json();
}

export function getBoard() {
  return request("GET", "/api/board");
}
