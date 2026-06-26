# Flavour Fleet 🚚🍔

A full-stack food ordering app — Express + MySQL backend, React (Vite) frontend.
Browse a menu by category, build a cart, sign in, place an order, and view order history.

```
flavour-fleet/
├── backend/      Express API + MySQL
└── frontend/     React (Vite) client
```

---

## 1. Prerequisites

- Node.js 18+ (`node -v` to check)
- MySQL Server running locally (or any reachable MySQL instance)
- npm (comes with Node)

---

## 2. Set up the database

Log into MySQL and run the schema file:

```bash
mysql -u root -p < backend/db/schema.sql
```

This creates the `flavour_fleet` database and all tables.

---

## 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your real MySQL password and a random `JWT_SECRET`
(any long random string works — e.g. generate one with `openssl rand -hex 32`).

Seed some sample menu items:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

You should see `Flavour Fleet API running on http://localhost:5000`.
Visit `http://localhost:5000/api/health` in a browser to confirm it's alive.

---

## 4. Set up the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The dev server
proxies `/api` requests to the backend on port 5000, so both must be running
at the same time.

---

## 5. Using the app

1. Browse the menu on the home page, filter by category.
2. Add dishes to your cart (top-right cart link shows item count).
3. Go to checkout — you'll be asked to sign in if you haven't already.
4. Create an account, enter a delivery address, place the order.
5. Check **Orders** in the nav to see your order history.

---

## How it's built

**Backend** (`/backend`)
- `server.js` — Express app, mounts routes, CORS, JSON body parsing
- `db/pool.js` — MySQL connection pool (`mysql2/promise`)
- `db/schema.sql` — table definitions
- `db/seed.js` — sample categories + menu items
- `middleware/auth.js` — JWT verification middleware
- `controllers/` — request handlers for auth, menu, orders
- `routes/` — Express routers wiring URLs to controllers

Order totals are always recalculated server-side from the database price,
never trusted from the request body — so a tampered client request can't
change what gets charged.

**Frontend** (`/frontend`)
- `src/context/AuthContext.jsx` — login/register/logout, JWT stored in `localStorage`
- `src/context/CartContext.jsx` — in-memory cart state
- `src/api/client.js` — Axios instance that attaches the JWT to every request
- `src/pages/` — Home (menu), Login, Register, Checkout (cart), Orders (history)
- `src/styles/index.css` — design tokens + components (the "route line" dashed
  motif is the brand's signature visual element)

---

## Next steps you might want

- Add an admin page to manage menu items (currently seeded via `db/seed.js`)
- Add real order status updates (e.g. an admin marking orders "out for delivery")
- Add product images instead of emoji placeholders
- Deploy: backend to a Node host (Render, Railway, EC2…), MySQL to a managed
  instance (PlanetScale, RDS…), frontend to Vercel/Netlify with `VITE`-style
  env var pointing at your deployed API URL instead of the `/api` proxy

---

## Using this with Claude Code in VS Code

Open the `flavour-fleet` folder in VS Code, open the Claude Code panel, and
you can ask it to extend this codebase directly — e.g. "add an endpoint to
cancel an order" or "add a search bar to the menu page." It already has
full context of this project structure once you open the folder.
