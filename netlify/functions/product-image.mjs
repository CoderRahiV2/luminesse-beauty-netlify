import { imagesStore } from "./_shared.mjs";

export default async (req, context) => {
  const key = decodeURIComponent(context.params.key || "");
  if (!key) return new Response("Not found", { status: 404 });
  const value = await imagesStore().getWithMetadata(key, { consistency: "strong" });
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value.data, {
    headers: {
      "Content-Type": value.metadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};

export const config = { path: "/product-image/:key" };
