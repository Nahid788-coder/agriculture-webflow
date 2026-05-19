# 🌱 Harvest Co. — Premium Farm-to-Table Organic

Editorial farm-to-table e-commerce with **Subscription Box Builder**.

## ✨ Identity

- **Theme:** Editorial sunset · Cream + Sage + Terracotta + Honey
- **Fonts:** Fraunces (serif display) + Inter (body) + JetBrains Mono (accents)
- **Killer feature:** **Subscription Box Builder** — pick produce, set size, frequency, save 12-15%
- **Database:** `harvest` (Atlas)

## 🎯 Pages

- **Home** — Hero with image collage + spinning honey badge, marquee, categories, featured products, image band quote, sage subscription promo, recipes, story, CTA
- **Shop** — 12 organic products with category/sort filters
- **Product Detail** — Image gallery, farm info, certifications, quantity selector
- **Box Builder** ⭐ — Pick size (S/M/L/Family), frequency (weekly/biweekly/monthly), select items with live price + savings calc
- **Recipes** — Grid with category filter
- **Recipe Detail** — Editorial layout with sticky ingredients + numbered method
- **About** — Manifesto, stats grid, sage CTA section
- **Cart Drawer** — Slide-in with smooth animations
- **Checkout** — Full delivery + payment flow
- **Orders** — Past orders + active subscriptions
- **Login / Register** — JWT auth
- **Admin** — Stats, orders, subscriptions, products

## 🌿 Killer: Subscription Box Builder

- 4 box sizes (Small / Medium / Large / Family) with item caps
- 3 frequencies (weekly / bi-weekly / monthly)
- Live price calculation with subscription savings (8-15% off)
- Live item counter ("6 of 10 items")
- Animated add/remove with Framer Motion
- Category filter for products
- Sticky summary panel
- Subscribe creates DB entry with auto-computed next-delivery date

## 🚀 Setup

```bash
cd backend
npm run seed        # 12 products + 4 recipes + admin
npm run dev         # http://localhost:5005

cd frontend
npm run dev         # http://localhost:5178
```

## 🔐 Demo

- **Admin:** admin@harvestco.farm / admin123

© 2026 Nahid Husain.
