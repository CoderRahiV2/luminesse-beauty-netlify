import { imagesStore } from "./_shared.mjs";

export default async (req, context) => {
  try {
    const key = decodeURIComponent(context.params.key || "");

    if (!key) {
      return new Response("Image key missing", {
        status: 400
      });
    }

    const value = await imagesStore().getWithMetadata(key, {
      consistency: "strong",
      type: "arrayBuffer"
    });

    if (!value || !value.data) {
      return new Response("Image not found", {
        status: 404
      });
    }

    return new Response(value.data, {
      status: 200,
      headers: {
        "Content-Type":
          value.metadata?.contentType || "image/jpeg",

        "Cache-Control":
          "public, max-age=31536000, immutable"
      }
    });

  } catch (error) {
    console.error("Product image error:", error);

    return new Response("Unable to load image", {
      status: 500
    });
  }
};

export const config = {
  path: "/product-image/:key"
};
