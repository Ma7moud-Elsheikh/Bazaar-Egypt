# Bazaar Egypt: API Contract (draft v1)

Source of truth: `lib/schemas/catalog.ts` and `lib/schemas/order.ts` (zod schemas).
A full sample of every object is in `data/crafts.json`, `data/artisans.json`, `data/products.json`.

## General

- JSON over HTTPS, UTF-8. Base URL is set in the frontend as `API_URL`.
- Every localized text is `{ "ar": "...", "en": "..." }`. Return both languages in one response.
- Prices are numbers in EGP (no piasters). `currency` is always `"EGP"`.
- Dates are ISO 8601 strings. `slug` is lowercase kebab-case English and unique.
- Images: `{ src, alt: {ar,en}, width, height }`. `src` can be an absolute CDN URL.
- Missing resource: `404`. Invalid input: `422` with `{ "error": { "code", "message", "fields"? } }`.

## Endpoints

| Method | Path                              | Returns              |
| ------ | --------------------------------- | -------------------- |
| GET    | `/crafts`                         | `Craft[]`            |
| GET    | `/crafts/:slug`                   | `Craft`              |
| GET    | `/artisans?craft=<craftSlug>`     | `Artisan[]`          |
| GET    | `/artisans/:slug`                 | `Artisan`            |
| GET    | `/products`                       | `Paginated<Product>` |
| GET    | `/products/:slug`                 | `Product`            |
| GET    | `/products/:slug/related?limit=4` | `Product[]`          |
| POST   | `/orders`                         | `OrderResult`        |

### `GET /products` query

`craft` (slug), `artisan` (slug), `governorate` (slug), `q` (search in names, summaries, craft names; Arabic should ignore diacritics and hamza/ya/ta-marbuta variants), `minPrice`, `maxPrice`, `sort` (`newest` | `popular` | `price-asc` | `price-desc`, default `newest`), `page` (default 1), `pageSize` (default 12, max 48).

### `Paginated<T>`

`{ items: T[], total, page, pageSize, totalPages }`

### `POST /orders`

Request: `{ items: [{ productId, quantity, customization?: { [key]: value } }], customer: { fullName, phone, email?, governorate, city, address, notes?, paymentMethod: "cod" | "card" }, locale: "ar" | "en" }`
Response: `{ orderId, status: "pending" | "confirmed", total, currency: "EGP" }`

- Compute the total on the server. Never trust prices sent by the client.
- Check stock for products where `madeToOrder` is false.

## Semantics

- `madeToOrder: true`: ignore `stock`, use `leadTimeDays` as production time.
- `customizationOptions[].key` is the key used in `customization` of an order item.

## Questions for the backend dev

1. REST (as above) or GraphQL? Swagger/OpenAPI docs?
2. Auth: httpOnly cookies or tokens? Accounts in scope for v1?
3. Payments: Cash on delivery only, or a gateway (Paymob/Fawry)? Redirect or iframe?
4. Where are images stored, and in which sizes?
5. Is the admin dashboard (products, orders) in scope?
6. CORS allowed origins and rate limits?

## Search (v2)

### GET /search

Query: `q` (required, max 80), `craft` (slug), `governorate` (slug), `minPrice`, `maxPrice`, `sort` (`relevance` default | `newest` | `popular` | `price-asc` | `price-desc`), `page`, `pageSize` (default 12, max 48).
Response: `Paginated<Product>` plus:

- `query`: the query as received.
- `correctedQuery?`: set when results were found only after spelling correction.
- `suggestions`: alternative queries (simplified or similar) when there are no results.
- `relatedCrafts`: crafts present in the matches. When there are no matches, all crafts ordered by closeness to the query.
- `recommended`: up to 8 products not already in the matches (same crafts first, then popular).
  Arabic must be normalized (diacritics, hamza, ى/ي, ة/ه, leading «ال») and tolerant to small typos and synonyms (e.g. قلة = فخار).

### GET /search/suggest

Query: `q`, `limit` (default 8), `locale` (`ar` | `en`).
Response: `{ queries: string[], products: Product[] (max 4), crafts: Craft[] (max 2) }`. Returns empty arrays when `q` is shorter than 2 characters.

### GET /products/recommended

Query: `craft` (comma separated slugs), `exclude` (comma separated product ids), `limit` (default 8, max 24).
Response: `Product[]`.

## Product reviews (v2)

### GET /products/:slug/reviews

Query: `limit` (default 5, max 20).
Response: `{ summary: { average, count }, total, items: Review[] }`.

- `summary` is the product's overall rating (all reviews). `items` is the latest reviews.
- Review: `{ id, productId, rating (1-5), title?, body, authorName, governorate?: {ar,en}, createdAt (ISO), verifiedPurchase, photos?: Image[], reply?: { body, createdAt } }`.

### Product (new optional fields)

`sku`, `careInstructions: {ar,en}`, `returnDays`, `giftWrap: { available, price }`, `images[].kind` (`main` | `detail` | `scale` | `lifestyle`).

## Shipping config (v2)

### GET /shipping/config

Response: `{ freeShippingThreshold, returnDays, giftWrapPrice, zones: [{ id, fee, etaDays: { min, max } }], governorates: [{ slug, name: {ar,en}, zoneId }] }`

- All 27 Egyptian governorates must be listed, each linked to an existing zone.
- Delivery estimate = preparation days (1 for ready items, `leadTimeDays` for made-to-order) + `etaDays` of the zone.
- Shipping is free when the order subtotal is at or above `freeShippingThreshold`.
- Order items accept `gift: { wrap: boolean, message: string (max 200) }` (to be added to `POST /orders` in the checkout phase).

## Orders (v2)

### POST /orders

Request: `{ items: [{ productId, quantity, customization?: {key: value}, gift?: { wrap, message (max 200) } }], customer: { fullName, phone (01XXXXXXXXX), email?, governorate (slug), city, address, landmark?, notes?, paymentMethod }, locale }`
Response: `{ orderId, status: "pending" | "confirmed", total, currency, subtotal?, shippingFee?, giftTotal?, redirectUrl? }`

- The server computes every amount from its own catalog and shipping config. Prices sent by the client are never used (the frontend does not send prices).
- Errors: `409` not enough stock, `422` invalid data (missing required customization, unknown governorate, disabled payment method). Body: `{ "error": { "code", "message", "productId"? } }`.
- Guest checkout: no account is required, so please rate-limit this endpoint.
- If `redirectUrl` is present (online payment) the frontend redirects the customer to it right after the order is created.

### GET /payment-methods

Response: `[{ id: cod | card | fawry | wallet | instapay, label: {ar,en}, description?: {ar,en}, enabled }]`

## Home page data (v2)

The home page uses a single call: `GET /products?sort=popular&pageSize=48`, then derives bestsellers (badge `bestseller` first), newest (by `createdAt`), gifts (badge `giftable`) and governorate counts.
Recommended additions on the backend: a `badge` query parameter on `GET /products` (`new` | `bestseller` | `limited` | `giftable`) and a `sort=popular` that ranks by sales, so these shelves do not need to load the whole catalog.
