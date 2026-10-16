# Bazaar Egypt (بازار مصر)

A bilingual (Arabic/English, RTL/LTR) e-commerce storefront for authentic Egyptian handmade crafts. Built as a frontend-first project: all data flows through a typed API layer with a mock implementation today and a real backend tomorrow.

> **Demo project.** Product photos are AI-generated, reviews are sample data, and prices, shipping fees and policy values are placeholders. See [Demo data and placeholders](#demo-data-and-placeholders).

## Highlights

- **Store flow:** home, shop with filters and sorting, search with live suggestions and a recovery page for no results, product pages (gallery with zoom, personalization with live preview, gift option, delivery estimate by governorate), cart drawer and cart page, one-page guest checkout (cash on delivery), order confirmation.
- **Content:** crafts and artisans pages, about, FAQ, shipping, returns, privacy, terms, contact.
- **Extras:** wishlist, recently viewed, free-shipping progress bar, loading and error states.
- **Design:** a hybrid light/dark layout with glass surfaces, copper and terracotta palette, and authentic Arabic typography (Reem Kufi, Aref Ruqaa, IBM Plex Sans Arabic).
- **Quality:** server-first rendering, per-page metadata, canonical and hreflang, JSON-LD (Organization, WebSite, Product, BreadcrumbList, ItemList), sitemap and robots, keyboard and screen-reader support, reduced-motion support, lightweight CSS-only animation.

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · next-intl · zod · sharp (image pipeline).

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

Quality checks:

```bash
npx tsc --noEmit
npm run build
```

## Environment variables

| Variable | Purpose |
|---|---|
| `USE_MOCK_API` | `true` uses the JSON files in `data/`. `false` uses the real API. |
| `API_URL` | Backend base URL (no trailing slash). Required when `USE_MOCK_API=false`. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for canonical URLs, Open Graph and JSON-LD. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | International format without `+`, for example `201000000000`. |
| `NEXT_PUBLIC_CONTACT_PHONE` | Shown on the contact page. Empty hides it. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown on the contact page. Empty hides it. |

Indexing is enabled only when `VERCEL_ENV=production` (set automatically by Vercel). Every other environment is `noindex`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Standard Next.js scripts. |
| `npm run images:check` | Lists images referenced by the data files that are missing in `public/`. |
| `npm run images:build` | Converts originals from `raw-images/` to WebP in `public/images/`. |
| `npm run images:extra-brief` / `images:extra-apply` | Generates prompts for extra product photos and adds them to the data. |

## Project structure

```
app/[locale]/        pages (shop, product, crafts, artisans, search, cart, checkout, order, wishlist, static pages)
app/api/             small route handlers used by client components (suggestions, products by ids, shipping config)
components/          ui, layout, home, shop, product, cart, checkout, search, static, wishlist, seo, brand
lib/schemas/         zod schemas = the API contract (types come from here)
lib/api/             mock and http implementations behind one interface
lib/search/          Arabic-aware search engine used by the mock API
lib/cart, shipping/  cart store, totals and delivery estimates
data/                demo catalog (crafts, artisans, products, reviews, shipping)
messages/{ar,en}/    translations, one file per namespace
i18n/                routing, request config, registered namespaces
docs/api-contract.md the contract for the backend team
```

## Data and API

All data goes through `import { api } from "@/lib/api"`. In mock mode it reads `data/*.json` and validates it with zod (a friendly error names the exact bad field). To use a real backend set `USE_MOCK_API=false` and `API_URL`. Responses are validated against the same schemas, so a mismatch fails loudly instead of rendering wrong data. The full contract (endpoints, shapes, error codes) is in [`docs/api-contract.md`](docs/api-contract.md).

Prices are never trusted from the browser: the order is priced on the server (`placeOrder`) from the catalog and the shipping configuration.

## Internationalization

Routes are `/ar/...` (default) and `/en/...`. Direction and fonts switch per locale. Translations live in `messages/<locale>/<Namespace>.json`; register a new namespace in `i18n/namespaces.ts`. Use logical CSS utilities only (`ms-*`, `pe-*`, `start-*`) so layouts work in both directions.

## Images

Put originals in `raw-images/{products,crafts,artisans}/<slug>.png`, run `npm run images:build`, and the optimized WebP lands in `public/images/`. In development, missing images fall back to a placeholder and a warning lists what is missing.

## SEO, accessibility and performance

- Targets (mobile Lighthouse): Performance 90+, Accessibility 95+, SEO 95+, LCP under 2.5 s, CLS under 0.1.
- Animations use `opacity` and `transform` only, respect `prefers-reduced-motion`, and never hide content in the server HTML.
- Glass blur is limited to a few small surfaces and has solid fallbacks (`prefers-reduced-transparency`, no `backdrop-filter`).
- Private pages (cart, checkout, order, wishlist, search) are `noindex` and excluded from the sitemap.

## Demo data and placeholders

- **Images:** AI-generated (Gemini) and not real products.
- **Reviews:** sample data in `data/reviews.json`.
- **Business values:** shipping fees, free-shipping threshold, return window and gift-wrap price in `data/shipping.json` are placeholders to be confirmed by the shop owner.
- **Legal pages:** privacy, terms and returns are general drafts. They must be reviewed by the owner or a lawyer before launch.
- **Payments:** cash on delivery only. Other methods plug in through `GET /payment-methods` and `redirectUrl` in the order response.

## Deployment (Vercel)

1. Import the repository in Vercel.
2. Set the environment variables above for Production (use the real domain in `NEXT_PUBLIC_SITE_URL`).
3. Deploy, then check `/sitemap.xml`, `/robots.txt`, and a product page's metadata.

## Handoff to the backend team

1. Read `docs/api-contract.md` and the zod schemas in `lib/schemas/`.
2. Implement the endpoints, then switch `USE_MOCK_API=false` and set `API_URL`.
3. If a response shape differs, adapt it in `lib/api/http.ts` or `lib/api/extras.ts` (the UI does not change).
4. Rate-limit `POST /orders` (guest checkout) and compute all totals on the server.

## Before launch checklist

- [ ] Replace the placeholder contact email and confirm phone and WhatsApp.
- [ ] Confirm shipping fees, free-shipping threshold, return window and gift-wrap price.
- [ ] Have privacy, terms and returns reviewed.
- [ ] Replace demo images and reviews with real ones (or label them clearly).
- [ ] Remove the temporary `app/[locale]/design-lab` pages.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain and verify indexing only in production.
- [ ] Run Lighthouse on mobile for home, shop, product and checkout.
