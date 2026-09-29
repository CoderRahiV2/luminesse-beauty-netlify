# Luminesse Beauty — 100% Netlify Edition

This package is designed for **Netlify + Netlify Functions + Netlify Blobs only**. It does not use PHP, MySQL or Supabase.

## Fixed in this edition
- Correct Netlify Functions directory configuration (`netlify/functions`)
- Functions are outside the published `public` folder
- Admin session reads use strong consistency so login/logout changes are immediately visible
- `/api/auth`, `/api/logout`, `/api/products`, `/api/health` routes are available
- Admin login has clear backend errors instead of silently returning to login
- Product image upload uses Netlify Blobs
- Product records use Netlify Blobs
- 4MB image limit to stay safely below Netlify buffered function request limits
- Responsive storefront
- Bengali + English modern marketing copy
- SEO title, description, robots and structured data
- Lazy-loaded product images and dimensions to reduce layout shift
- No external Google Font request, reducing render-blocking/network work
- Messenger ordering

## Required Netlify variable
Add one environment variable:

`ADMIN_PASSWORD` = your private admin password

Do not put the password in HTML or JavaScript.

## Deploy
Use a GitHub-connected Netlify site.

Repository root should contain:

- `public/`
- `netlify/functions/`
- `netlify.toml`
- `package.json`

Netlify build settings should use the committed `netlify.toml`:

- Publish directory: `public`
- Functions directory: `netlify/functions`

After adding `ADMIN_PASSWORD`, trigger a fresh production deploy.

## Test backend before login
Open:

`https://YOUR-SITE.netlify.app/api/health`

Expected response:

`{"ok":true,"service":"Luminesse Beauty Netlify backend"}`

If this endpoint is 404, the GitHub repository is not being deployed with the Functions directory/configuration.

## Admin
Open `/admin/` and use the value of `ADMIN_PASSWORD`.

## Product upload
Admin → Add product → name/category/price/stock/description → choose image → Upload product.

Product data is stored in the site-wide `luminesse-products` Netlify Blobs store and images in `luminesse-images`.

## Messenger
Orders open:
https://m.me/61590839113495

## SEO
Before launch, replace the relative canonical URLs with your final custom domain if you add one. Product detail pages generate their title and description from product data after loading.
