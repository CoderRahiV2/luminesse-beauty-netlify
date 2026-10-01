const MESSENGER_URL = "https://m.me/61590839113495";

const esc = v =>
  String(v ?? "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );

const money = v =>
  "৳" + Number(v || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 0
  });

const imageUrl = p =>
  p.image_url || "/assets/images/logo.png";


/* =========================
   ORDER MESSAGE
========================= */

function orderMessage(p) {
  return `🛍️ LUMINESSE BEAUTY ORDER

Product: ${p.name || "N/A"}
Price: ${money(p.price)}
Product ID: ${p.slug || p.id || "N/A"}

আমি এই পণ্যটি অর্ডার করতে চাই।
Please confirm my order.`;
}


/* =========================
   COPY ORDER INFORMATION
========================= */

async function copyOrderMessage(message) {

  // Modern clipboard
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(message);
      return true;
    } catch (e) {
      console.warn("Clipboard API failed:", e);
    }
  }

  // Fallback for older browsers
  try {
    const textarea = document.createElement("textarea");

    textarea.value = message;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");

    textarea.remove();

    return success;

  } catch (e) {
    console.warn("Fallback copy failed:", e);
    return false;
  }
}


/* =========================
   ORDER PRODUCT
========================= */

async function orderProduct(p) {

  if (!p) {
    alert("Product information পাওয়া যায়নি।");
    return;
  }

  const message = orderMessage(p);

  /*
   * IMPORTANT:
   * Messenger is opened immediately inside the click event.
   * This prevents popup blocking on PC browsers.
   */

  const messengerWindow = window.open(
    MESSENGER_URL,
    "_blank"
  );

  // Copy order information
  const copied = await copyOrderMessage(message);

  if (copied) {

    if (messengerWindow) {

      alert(
        "✅ Product information copied!\n\n" +
        "Messenger খুলে গেছে।\n" +
        "Messenger-এ গিয়ে Ctrl + V চাপুন এবং Send করুন।"
      );

    } else {

      alert(
        "✅ Product information copied!\n\n" +
        "Messenger খুলতে browser popup block করেছে।\n\n" +
        "এই message-টি Messenger-এ Paste করুন:\n\n" +
        message
      );

    }

  } else {

    alert(
      "Messenger খুলুন এবং নিচের message-টি copy করে Send করুন:\n\n" +
      message
    );

  }
}


/* =========================
   HEADER
========================= */

function header() {

  const el = document.getElementById("site-header");

  if (!el) return;

  el.innerHTML = `
    <header class="site-header">

      <div class="container nav-wrap">

        <a class="brand" href="/">
          <img
            src="/assets/images/logo.png"
            alt="Luminesse Beauty"
          >

          <span>
            <strong>Luminesse</strong>
            <small>BEAUTY</small>
          </span>
        </a>

        <nav class="nav">

          <a href="/">হোম</a>

          <a href="/shop.html">
            শপ
          </a>

          <a href="/shop.html?category=skincare">
            স্কিনকেয়ার
          </a>

          <a href="/shop.html?category=lipsticks">
            লিপস্টিক
          </a>

          <a
            class="nav-cta"
            href="${MESSENGER_URL}"
            target="_blank"
            rel="noopener"
          >
            মেসেঞ্জারে অর্ডার
          </a>

        </nav>

        <button
          class="menu-toggle"
          aria-label="মেনু খুলুন"
          type="button"
        >
          ☰
        </button>

      </div>

    </header>
  `;

  document
    .querySelector(".menu-toggle")
    ?.addEventListener("click", () => {

      document
        .querySelector(".nav")
        ?.classList.toggle("open");

    });
}


/* =========================
   FOOTER
========================= */

function footer() {

  const el = document.getElementById("site-footer");

  if (!el) return;

  el.innerHTML = `
    <footer class="footer">

      <div class="container footer-grid">

        <div>

          <div class="brand">

            <img
              src="/assets/images/logo.png"
              alt="Luminesse Beauty"
            >

            <span>
              <strong>Luminesse</strong>
              <small>BEAUTY</small>
            </span>

          </div>

          <p class="muted">
            সাশ্রয়ী cosmetics, skincare ও beauty essentials—
            আপনার নিজের সৌন্দর্য, আপনার নিজের স্টাইলে।
          </p>

        </div>


        <div>

          <h3>ক্যাটাগরি</h3>

          <a href="/shop.html">
            সব পণ্য
          </a>

          <a href="/shop.html?category=skincare">
            স্কিনকেয়ার
          </a>

          <a href="/shop.html?category=lipsticks">
            লিপস্টিক
          </a>

        </div>


        <div>

          <h3>যোগাযোগ</h3>

          <a
            href="https://www.facebook.com/people/Luminesse-Beauty/61590839113495/"
            target="_blank"
            rel="noopener"
          >
            Facebook
          </a>

          <a
            href="${MESSENGER_URL}"
            target="_blank"
            rel="noopener"
          >
            Messenger
          </a>

          <a href="/admin/">
            Admin
          </a>

        </div>

      </div>


      <div class="container footer-bottom">

        <span>
          © ${new Date().getFullYear()} Luminesse Beauty
        </span>

        <span>
          Making Beauty personal • সৌন্দর্য হোক আপনার মতো
        </span>

      </div>

    </footer>
  `;
}


/* =========================
   PRODUCT CARD
========================= */

function card(p) {

  return `
    <article class="product-card">

      <a
        class="product-image"
        href="/product.html?slug=${encodeURIComponent(p.slug)}"
      >

        <img
          loading="lazy"
          decoding="async"
          src="${esc(imageUrl(p))}"
          alt="${esc(p.name)}"
          width="600"
          height="600"
        >

        ${
          p.is_featured
            ? '<span class="pill">Featured</span>'
            : ""
        }

      </a>


      <div class="product-info">

        <small>
          ${esc(p.category)}
        </small>


        <h3>

          <a
            href="/product.html?slug=${encodeURIComponent(p.slug)}"
          >
            ${esc(p.name)}
          </a>

        </h3>


        <div class="price-row">

          <strong>
            ${money(p.price)}
          </strong>


          <button
            class="mini-order"
            type="button"
            data-order-product="${esc(p.slug || p.id || "")}"
          >
            অর্ডার →
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================
   PRODUCTS
========================= */

async function getProducts() {

  const r = await fetch(
    "/api/products",
    {
      cache: "no-store"
    }
  );

  if (!r.ok) {
    throw new Error("Unable to load products");
  }

  return r.json();
}


/* =========================
   FEATURED PRODUCTS
========================= */

async function featured() {

  const el =
    document.getElementById("featured-products");

  if (!el) return;

  try {

    const data = await getProducts();

    el.innerHTML =
      data
        .slice(0, 8)
        .map(card)
        .join("")
      ||
      `
        <div class="empty">
          এখনও কোনো পণ্য প্রকাশিত হয়নি।
        </div>
      `;

    attachOrderButtons(el, data);

  } catch (e) {

    console.error(e);

    el.innerHTML = `
      <div class="empty">
        পণ্যগুলো এই মুহূর্তে লোড করা যাচ্ছে না।
      </div>
    `;
  }
}


/* =========================
   SHOP
========================= */

async function shop() {

  const el =
    document.getElementById("shop-products");

  if (!el) return;

  const u =
    new URLSearchParams(location.search);

  const cat =
    u.get("category") || "";

  const q =
    (u.get("q") || "").toLowerCase();


  const title =
    document.getElementById("shop-title");

  if (title) {

    title.textContent =
      cat
        ? (
            cat === "lipsticks"
              ? "লিপস্টিক"
              : cat === "skincare"
                ? "স্কিনকেয়ার"
                : "Beauty Essentials"
          )
        : "সব সৌন্দর্য পণ্য";

  }


  const searchInput =
    document.getElementById("search-input");

  if (searchInput) {
    searchInput.value = q;
  }


  try {

    let data = await getProducts();


    if (cat) {
      data =
        data.filter(
          p => p.category === cat
        );
    }


    if (q) {

      data =
        data.filter(
          p =>
            (
              (p.name || "") +
              " " +
              (p.description || "")
            )
              .toLowerCase()
              .includes(q)
        );

    }


    el.innerHTML =
      data.map(card).join("")
      ||
      `
        <div class="empty">
          আপনার খোঁজের সঙ্গে মিলছে এমন
          পণ্য পাওয়া যায়নি।
        </div>
      `;


    attachOrderButtons(el, data);


  } catch (e) {

    console.error(e);

    el.innerHTML = `
      <div class="empty">
        পণ্য লোড করা যাচ্ছে না।
        একটু পরে আবার চেষ্টা করুন।
      </div>
    `;

  }


  document
    .getElementById("search-form")
    ?.addEventListener("submit", e => {

      e.preventDefault();

      const v =
        document
          .getElementById("search-input")
          .value
          .trim();

      const params =
        new URLSearchParams();

      if (cat) {
        params.set("category", cat);
      }

      if (v) {
        params.set("q", v);
      }

      location.href =
        "/shop.html?" +
        params.toString();

    });

}


/* =========================
   ATTACH ORDER BUTTONS
========================= */

function attachOrderButtons(container, products) {

  const buttons =
    container.querySelectorAll(
      "[data-order-product]"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const key =
          button.dataset.orderProduct;

        const product =
          products.find(
            p =>
              String(p.slug || p.id) ===
              String(key)
          );


        if (!product) {

          alert(
            "Product information পাওয়া যায়নি।"
          );

          return;
        }


        orderProduct(product);

      }
    );

  });

}


/* =========================
   PRODUCT DETAILS
========================= */

async function product() {

  const el =
    document.getElementById(
      "product-detail"
    );

  if (!el) return;


  const slug =
    new URLSearchParams(
      location.search
    ).get("slug");


  try {

    const data =
      await getProducts();


    const p =
      data.find(
        x => x.slug === slug
      );


    if (!p) {
      throw new Error("Product not found");
    }


    document.title =
      `${p.name} | Luminesse Beauty`;


    document
      .querySelector(
        'meta[name="description"]'
      )
      ?.setAttribute(
        "content",
        `${p.name} — Luminesse Beauty-এর সাশ্রয়ী beauty product. দাম ${money(p.price)}।`
      );


    el.innerHTML = `

      <div class="product-detail-grid">

        <div class="detail-image">

          <img
            src="${esc(imageUrl(p))}"
            alt="${esc(p.name)}"
            width="900"
            height="900"
          >

        </div>


        <div class="detail-copy">

          <p class="eyebrow">
            ${esc(p.category)}
          </p>


          <h1>
            ${esc(p.name)}
          </h1>


          <div class="detail-price">
            ${money(p.price)}
          </div>


          <p class="detail-desc">
            ${esc(
              p.description ||
              "Luminesse Beauty-এর একটি নির্বাচিত পছন্দ—দৈনন্দিন সৌন্দর্যের জন্য।"
            )}
          </p>


          <div class="stock">

            ${
              p.stock > 0
                ? "✓ স্টকে আছে"
                : "বর্তমানে স্টকে নেই"
            }

          </div>


          ${
            p.stock > 0
              ? `
                <button
                  class="btn btn-dark btn-wide"
                  type="button"
                  id="product-order-button"
                >
                  Messenger-এ অর্ডার করুন →
                </button>
              `
              : ""
          }


          <p class="microcopy">
            পণ্য, availability ও delivery সম্পর্কে
            জানতে Messenger-এ আমাদের মেসেজ করুন।
          </p>

        </div>

      </div>

    `;


    /* Product detail order button */

    const orderButton =
      document.getElementById(
        "product-order-button"
      );


    if (orderButton) {

      orderButton.addEventListener(
        "click",
        () => orderProduct(p)
      );

    }


  } catch (e) {

    console.error(e);

    el.innerHTML = `
      <div class="empty">

        <h2>
          পণ্যটি পাওয়া যায়নি
        </h2>

        <a
          class="btn btn-dark"
          href="/shop.html"
        >
          শপে ফিরে যান
        </a>

      </div>
    `;
  }
}


/* =========================
   START WEBSITE
========================= */

header();
footer();
featured();
shop();
product();
