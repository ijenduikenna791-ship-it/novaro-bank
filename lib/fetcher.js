'use client';

/** Small client helper for our API routes. Throws Error(message) on failure. */
export async function api(path, { method = 'POST', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await res.json();
  } catch {}
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data ?? json;
}
