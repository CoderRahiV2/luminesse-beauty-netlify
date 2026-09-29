import { json } from "./_shared.mjs";
export default async () => json({ ok: true, service: "Luminesse Beauty Netlify backend" });
export const config = { path: ["/api/health", "/.netlify/functions/health"] };
