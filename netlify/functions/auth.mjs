import { sessionsStore, json, cookie } from "./_shared.mjs";

export default async (req) => {
  try {
    if (req.method === "GET") {
      const { getCookie, requireAdmin } = await import("./_shared.mjs");
      return json({ authenticated: await requireAdmin(req) });
    }
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = await req.json().catch(() => ({}));
    const configured = process.env.ADMIN_PASSWORD;
    if (!configured) return json({ error: "ADMIN_PASSWORD is not configured in Netlify." }, 500);
    if (body.password !== configured) return json({ error: "Invalid password" }, 401);

    const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    await sessionsStore().setJSON(token, { admin: true, created_at: new Date().toISOString() });
    return json({ ok: true }, 200, { "Set-Cookie": cookie("lb_admin", token) });
  } catch (error) {
    console.error(error);
    return json({ error: "Authentication service error" }, 500);
  }
};

export const config = { path: ["/api/auth", "/.netlify/functions/auth"] };
