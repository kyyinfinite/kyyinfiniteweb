# KyyInfinite

Personal portfolio, resource CDN, and automated marketplace platform for kyyinfinite.my.id.

## Structure

- `server/` Express API. MongoDB via Mongoose, Firebase Admin SDK for auth and storage, Midtrans for QRIS payments, Pterodactyl Application API for automated provisioning.
- `client/` React + Vite frontend. Tailwind with the Soft Teal and Charcoal theme, dark mode via `class` strategy and `localStorage`, inline SVG icons only.

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in MongoDB, Firebase Admin, Midtrans, and Pterodactyl credentials. Set `ADMIN_ALLOWED_EMAIL` to the single authorized admin address.
2. Copy `client/.env.example` to `client/.env` and fill in the Firebase client SDK config.
3. Run `npm run install:all` from the project root.
4. Run `npm run dev:server` and `npm run dev:client` in separate terminals for local development.
5. Deploy to Vercel; `vercel.json` routes `/api/*` to the Express serverless function and serves the Vite build for all other paths.

## Notes

- Public routes (assets, products, changelog, order status) require no authentication.
- Only `/api/assets/upload-url`, asset create/update/delete, `/api/admin/*`, and `/api/products` create/update require a valid Firebase ID token matching `ADMIN_ALLOWED_EMAIL`.
- The Midtrans webhook at `/api/payments/webhook` must be configured in the Midtrans dashboard and validates payloads with a SHA512 signature check before triggering Pterodactyl provisioning.
