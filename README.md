# 🌱 Harvest Co. — Full-Stack Organic Grocery

Farm-to-table grocery store with a **Subscription Box Builder**, delivery slots, coupons, reviews and an admin console.
Built by **[Nahid Husain Doi](https://portfolio-coral-nu-78.vercel.app)**.

**Stack:** React 19, Vite, Framer Motion · Node.js, Express 5, Mongoose · MongoDB Atlas
**Hosting (free):** Vercel (site + API as one serverless function) · MongoDB Atlas M0

---

## ✨ Features

**Shopping**
- Shop with category filters, search and sorting (the catalog loads once; filtering never refetches).
- Product pages with farm, origin, season, live stock and a pincode delivery check.
- **Stock-aware cart:** "Only 3 left" and "Out of stock" badges; the bag never exceeds what is in stock.
- **Wishlist** saved to your account (the heart on every product).
- **Reviews and ratings:** one review per customer, marked *Verified buyer* when they have ordered the product. Ratings come only from real reviews.

**Checkout**
- **Pincode check + delivery slots:** next 4 days, morning or evening window.
- **Coupons** (FRESH10, HARVEST100, FIRSTBASKET) with minimum order, maximum discount, expiry and usage limits.
- Pay on delivery (cash or UPI).
- **Server-side pricing:** the browser only sends product ids and quantities. Prices, discount, delivery and GST are always computed from the database.
- Stock is reserved atomically, so two shoppers can never buy the last item twice. Cancelling puts it back.

**Subscriptions**
- Box Builder: 4 sizes (up to 15% off), weekly / bi-weekly / monthly, choose your delivery day.
- Manage from *My Orders*: **skip the next box, pause, resume or cancel**, with the next delivery date always shown.

**Admin console**
- Stats, low-stock alerts, orders (status updates; cancelling returns stock), subscriptions, inline stock editing, and coupon management.
- **Try Admin Demo** on the login page: a read-only account for visitors. It sees real activity with customer names shortened and phone, email and address masked; every change is blocked on the server.

**Performance**
- A small shared cache in the browser: pages that need the same data share one request, and nothing is fetched twice.
- Pages are lazy-loaded and vendor code is split into separate chunks.

---

## 🚀 Run locally

```bash
npm install                 # API dependencies (repo root)
npm --prefix frontend install
cp .env.example .env        # set MONGO_URI and JWT_SECRET
npm run dev:api             # http://localhost:5005 (seeds products, recipes, coupons and the demo admin)
npm run dev:web             # http://localhost:5178 (proxies /api to the API)
```

`npm run seed` resets the catalog to the sample products and recipes.

## 🌐 Deploy (Vercel + MongoDB Atlas, free)

1. **Vercel → Add New → Project**, import this repo. Keep the Root Directory as the repo root. `vercel.json` sets the build and routes `/api/*` to the Express app.
2. Add environment variables:
   | Key | Notes |
   |-----|-------|
   | `MONGO_URI` | Atlas connection string. Data always goes to its own `harvest` database (override with `MONGO_DB`), so a URI shared with another project is safe. |
   | `JWT_SECRET` | Long random string |
   | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created on first start |
3. Deploy. Open `/api/health` and it should show `"db":"connected"`. Atlas Network Access must allow `0.0.0.0/0`.

## 🔌 API

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register`, `/api/auth/login` · GET `/api/auth/me` | — / user |
| GET | `/api/products`, `/api/products/:slug` (product, related, reviews) | — |
| POST · DELETE | `/api/products/:id/reviews` | user |
| POST | `/api/wishlist/:productId` (toggle) · GET `/api/wishlist` | user |
| GET | `/api/delivery/check?pincode=` | — |
| GET | `/api/coupons/active` | — |
| POST | `/api/orders/quote` (price preview, validates coupons) | — |
| POST | `/api/orders` · GET `/api/orders/my` · POST `/api/orders/:id/cancel` | guest or user |
| POST | `/api/subscriptions` · GET `/api/subscriptions/my` · POST `/api/subscriptions/:id/(pause\|resume\|skip\|cancel)` | user |
| GET | `/api/orders`, `/api/subscriptions`, `/api/stats`, `/api/coupons` | admin or demo (read-only) |
| PUT/POST | order and subscription status, products, coupons, recipes | admin |

## 📦 Structure

```
api/index.js     Vercel serverless entry (wraps the Express app)
backend/         Express app: models, routes, lib (pricing, delivery, privacy, seed), server.js for local dev
frontend/        React app: pages, components, context (auth, cart), api (axios + shared cache)
vercel.json      Build, output and /api rewrite
```

© 2026 Nahid Husain Doi
