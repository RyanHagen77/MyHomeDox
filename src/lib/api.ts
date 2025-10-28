// src/lib/api.ts
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,

    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// usage (client component):
// await api('/api/users', { method: 'POST', body: JSON.stringify({ name, email, password }) });