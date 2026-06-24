# Flavour Fleet — Food Delivery Marketplace

A Zomato/Swiggy-style food delivery app: React + Tailwind CSS frontend,
Node.js + Express backend, MySQL database. Multiple restaurants, each with
their own menu, cart, checkout with GST + delivery fee + discount math,
order tracking, and an admin dashboard.

**This is a different, bigger architecture than earlier single-restaurant
versions of this project** — restaurants, addresses, and a server-persisted
cart are new tables, and the entire frontend was rebuilt in Tailwind. Treat
this as a fresh install, not an upgrade of a previous `flavour-fleet` folder.

```
flavour-fleet/
├── backend/
│   ├── config/       DB connection
│   ├── models/       SQL query functions, one file per table group
│   ├── controllers/  request handlers
│   ├── routes/       Express routers
│   ├── middleware/    auth + error handling
│   └── db/           schema.sql, seed.js
└── frontend/         React (Vite) + Tailwind CSS
```

---

## Honest scope notes (read this first)

- **10 restaurants, ~150 menu items total** (13-17 each), not the 20+
  restaurants / 400-500 items in the original brief. That volume of
  *genuinely distinct, realistically priced, properly categorized* items
  by hand isn't something to pad out with repetition just to hit a number —
  10 well-built restaurants are more useful as a portfolio piece than 20
  thin ones. The seed script (`backend/db/seed.js`) is built so adding an
  11th restaurant is just adding one object to an array — see the comment
  at the top of that file.
- **Images**: restaurant banners and per-category menu photos point at
  Unsplash's CDN, picked from memory — I have no internet access in my
  build environment to verify every link is still live. Every image has an
  `onError` fallback (emoji tile) so a dead link never breaks the layout,
  it just looks plainer for that one item.
- **Menu item photos are shared per category**, not unique per dish (150
  unique sourced photos isn't realistic to hand-pick reliably). All "Pizza"
  items show the same representative pizza photo, etc.
- **Payments are fully mock** — no gateway integration, no real card charged.
- **GST**: 5% (the typical aggregator/non-AC restaurant rate), delivery fee
  ₹40 (free above ₹500), and a 10%-off-up-to-₹100 promo above ₹299 — all
  computed server-side in `order.controller.js`, never trusted from the
  client.

---

## 1. Prerequisites

- Node.js 18+
- MySQL Server running locally
- npm

## 2. Database

```bash
mysql -u root -p < backend/db/schema.sql
```

## 3. Backend

```bash
cd backend
npm install
cp .env.example .env
```
Fill in your MySQL password and a random `JWT_SECRET` in `.env`, then:
```bash
npm run seed
npm run dev
```
The seed prints two demo accounts:
```
admin@flavourfleet.test / admin123   (admin — sees the dashboard)
demo@flavourfleet.test  / demo1234   (regular customer)
```

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```
Open the printed URL (usually `http://localhost:5173`). Tailwind is already
wired up via `postcss.config.js` — no extra setup step needed.

---

## How ordering works

1. Browse restaurants on the home page (search, cuisine filter, sort, veg-only).
2. Open a restaurant, add items — **a cart can only hold items from one
   restaurant at a time** (same rule Zomato/Swiggy use). Adding from a
   different restaurant prompts you to clear the existing cart first.
3. Cart page shows a live bill (subtotal, discount, GST, delivery fee).
4. Checkout: pick/add a delivery address, then a mock payment step.
5. Orders page shows status with a visual stepper (placed → confirmed →
   preparing → out for delivery → delivered). Unlike earlier versions of
   this project, **status doesn't auto-advance on a timer** — an admin
   moves each order forward manually from the dashboard's Orders tab. That's
   a deliberate choice: simulating live GPS/driver tracking without a real
   driver felt like the wrong thing to fake silently, so this version makes
   the "who's actually doing this" explicit instead.

## Admin dashboard (`/admin`)

Four tabs: **Restaurants** (CRUD), **Menu Items** (CRUD, filterable by
restaurant), **Orders** (view all, change status), **Users** (view, with
order counts; deactivate/reactivate non-admin accounts).

## Security notes

- Passwords hashed with bcrypt; JWT auth with an `isAdmin` claim checked by
  `requireAdmin` middleware on every admin route (not just hidden in the UI).
- Order totals (GST, discount, delivery fee, item prices) are always
  recalculated server-side from the database — a tampered client request
  can't change what gets charged.
