// Thin fetch wrapper over the backend API.

async function request(method, path, body) {
  const opts = { method };
  if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const resp = await fetch(path, opts);
  if (!resp.ok) {
    let message = `${method} ${path} failed (${resp.status})`;
    try {
      const b = await resp.json();
      if (b && b.error) message = b.error;
    } catch (_) {}
    throw new Error(message);
  }
  return resp.json();
}

export function getBoard() {
  return request("GET", "/api/board");
}

export function postTask(title, columnId) {
  return request("POST", "/api/tasks", { title, columnId });
}
