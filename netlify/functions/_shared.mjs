import { getStore } from "@netlify/blobs";

export const productsStore = () => getStore({ name: "luminesse-products", consistency: "strong" });
export const imagesStore = () => getStore({ name: "luminesse-images", consistency: "strong" });
export const sessionsStore = () => getStore({ name: "luminesse-sessions", consistency: "strong" });

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra }
  });
}

export function slugify(s) {
  return String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function cookie(name, value, maxAge = 604800) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function getCookie(req, name) {
  const h = req.headers.get("cookie") || "";
  const parts = h.split(";").map(v => v.trim());
  const item = parts.find(v => v.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

export async function requireAdmin(req) {
  const token = getCookie(req, "lb_admin");
  if (!token) return false;
  const value = await sessionsStore().get(token, { type: "json", consistency: "strong" });
  return !!value?.admin;
}

export async function readProducts() {
  const store = productsStore();
  const { blobs } = await store.list();
  const out = [];
  for (const b of blobs) {
    const p = await store.get(b.key, { type: "json", consistency: "strong" });
    if (p) out.push(p);
  }
  return out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function imageUrl(key) {
  return key ? `/product-image/${encodeURIComponent(key)}` : "";
}
