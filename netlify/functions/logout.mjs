import { sessionsStore, json, cookie, getCookie } from "./_shared.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const token = getCookie(req, "lb_admin");
  if (token) {
    try { await sessionsStore().delete(token); } catch (error) { console.error(error); }
  }
  return json({ ok: true }, 200, { "Set-Cookie": cookie("lb_admin", "", 0) });
};

export const config = { path: ["/api/logout", "/.netlify/functions/logout"] };
