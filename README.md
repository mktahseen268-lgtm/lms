# Dalilee Logico Logistics

Arabic-first (RTL) SaaS logistics & courier management platform — powered by Dalilee.

Manages shipment lifecycle, courier operations, financial accounts, distribution networks, branches, clients, pricing, and an online store for shipping supplies.

## Stack

- **Frontend** — React 18 + TypeScript + Vite + Tailwind CSS, RTL, dark mode, Recharts, axios, React Router.
- **Backend** — Node.js + Express + TypeScript + Prisma ORM + SQLite (swap to Postgres in `schema.prisma`).
- **Auth** — JWT, role-based.

## Quick start

```bash
# 1) Install everything (workspaces)
npm install

# 2) Create the database, generate the client, and seed sample data
npm --workspace backend run db:push
npm run seed

# 3) Run both apps in parallel
npm run dev
# Backend → http://localhost:4000
# Frontend → http://localhost:5173 (proxies /api to backend)
```

Login: **admin@dalilee.com** / **admin123**

## Project layout

```
lms/
├── frontend/            # React app (RTL, Tailwind)
│   └── src/
│       ├── components/   # layout + UI primitives
│       ├── context/      # auth + theme
│       ├── lib/          # api, formatters, status enums
│       └── pages/        # all routes from the spec
└── backend/
    ├── prisma/           # schema + dev.db
    └── src/
        ├── routes/       # auth, shipments, couriers, accounts, ...
        ├── middleware/   # auth (JWT)
        └── server.ts     # entrypoint
```

## Routes

All 30+ routes from the spec are wired up under `frontend/src/App.tsx` — Shipments, Couriers, Accounts, Network, Branches, Reports, Marketplace, Admin, and more.

## API

Base URL `/api`. Highlights:

- `POST /auth/login`, `GET /auth/me`
- `GET /dashboard` — KPIs
- `GET /shipments`, `POST /shipments`, `POST /shipments/check`
- `GET /couriers`, `POST /couriers`
- `GET /clients`, `POST /clients`
- `GET /branches`, `POST /branches`
- `GET /pricing/provinces`, `PUT /pricing/bulk-update`
- `GET /accounts/company-wallet | sellers | couriers | network`
- `GET /users`, `GET /roles`
- `GET /reports`, `GET /reports/download-pdf`, `GET /reports/download-excel`
- `GET /ai/analysis?period=day|week|30days`
- `GET /marketplace/products`, `POST /marketplace/orders`

## Switching to PostgreSQL

1. Set `DATABASE_URL` in `backend/.env` to your Postgres URL.
2. Change `provider = "sqlite"` to `provider = "postgresql"` in `backend/prisma/schema.prisma`.
3. Run `npm --workspace backend run db:push` (or set up migrations with `prisma migrate dev`).

## Branding

- Primary purple **#6B21A8**, secondary **#7C3AED** (Tailwind `brand-*` scale).
- Fonts: Cairo (heading) + Tajawal (fallback).
- Logo: `D` mark in the gradient (see `frontend/src/components/layout/Logo.tsx`).

## License

UNLICENSED — internal/proprietary scaffold.
