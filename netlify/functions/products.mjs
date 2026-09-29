import { productsStore, imagesStore, json, requireAdmin, slugify, readProducts, imageUrl } from "./_shared.mjs";

async function uniqueSlug(base, id) {
  const original = slugify(base) || "product";
  const all = await readProducts();
  const taken = new Set(all.filter(p => p.id !== id).map(p => p.slug));
  let slug = original;
  let n = 1;
  while (taken.has(slug)) slug = `${original}-${n++}`;
  return slug;
}

function safeImage(file) {
  return file instanceof File && file.size > 0;
}

async function saveImage(file, key) {
  if (!safeImage(file)) return "";
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Only JPG, PNG, WebP or GIF images are allowed.");
  // Netlify Functions have a buffered request limit; keep the UI limit safely below it.
  if (file.size > 4 * 1024 * 1024) throw new Error("Image must be 4MB or smaller.");
  await imagesStore().set(key, file, { metadata: { contentType: file.type } });
  return key;
}

export default async (req) => {
  try {
    if (req.method === "GET") {
      const all = await readProducts();
      const admin = await requireAdmin(req);
      const visible = admin ? all : all.filter(p => p.is_active);
      return json(visible.map(p => ({ ...p, image_url: imageUrl(p.image_key) })));
    }

    if (!(await requireAdmin(req))) return json({ error: "Unauthorized" }, 401);

    if (req.method === "POST") {
      const form = await req.formData();
      const name = String(form.get("name") || "").trim();
      if (!name) return json({ error: "Product name is required" }, 400);

      const id = crypto.randomUUID();
      const file = form.get("image");
      const imageKey = safeImage(file) ? `${id}-${String(file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "-")}` : "";
      if (imageKey) await saveImage(file, imageKey);

      const product = {
        id,
        name,
        slug: await uniqueSlug(name, id),
        category: String(form.get("category") || "beauty"),
        description: String(form.get("description") || ""),
        price: Math.max(0, Number(form.get("price") || 0)),
        stock: Math.max(0, Number(form.get("stock") || 0)),
        is_active: form.get("is_active") !== "false",
        is_featured: form.get("is_featured") === "true",
        image_key: imageKey,
        created_at: new Date().toISOString()
      };

      await productsStore().setJSON(id, product);
      return json({ ...product, image_url: imageUrl(imageKey) }, 201);
    }

    if (req.method === "PUT") {
      const form = await req.formData();
      const id = String(form.get("id") || "");
      if (!id) return json({ error: "Missing product id" }, 400);

      const store = productsStore();
      const product = await store.get(id, { type: "json", consistency: "strong" });
      if (!product) return json({ error: "Product not found" }, 404);

      product.name = String(form.get("name") || product.name).trim();
      product.slug = await uniqueSlug(product.name, id);
      product.category = String(form.get("category") || product.category);
      product.description = String(form.get("description") ?? product.description);
      product.price = Math.max(0, Number(form.get("price") ?? product.price));
      product.stock = Math.max(0, Number(form.get("stock") ?? product.stock));
      product.is_active = form.get("is_active") !== "false";
      product.is_featured = form.get("is_featured") === "true";

      const file = form.get("image");
      if (safeImage(file)) {
        if (product.image_key) await imagesStore().delete(product.image_key);
        product.image_key = `${id}-${String(file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        await saveImage(file, product.image_key);
      }

      await store.setJSON(id, product);
      return json({ ...product, image_url: imageUrl(product.image_key) });
    }

    if (req.method === "DELETE") {
      const { id } = await req.json().catch(() => ({}));
      const store = productsStore();
      const product = await store.get(String(id), { type: "json", consistency: "strong" });
      if (!product) return json({ error: "Not found" }, 404);
      if (product.image_key) await imagesStore().delete(product.image_key);
      await store.delete(String(id));
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: error?.message || "Server error" }, 500);
  }
};

export const config = { path: ["/api/products", "/.netlify/functions/products"] };
