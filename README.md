# KyyInfinite

Digital asset marketplace and project sharing platform for kyyinfinite.my.id.
Browse, download, and track every release of WhatsApp bots, code snippets, and
game plugins — with full per-version changelogs and download rollbacks.

## Structure

- `server/` — Express API. MongoDB via Mongoose, Firebase Admin SDK for auth
  and storage, Midtrans for QRIS payments, Pterodactyl Application API for
  automated provisioning.
- `client/` — React + Vite frontend. Tailwind with the Soft Teal and Charcoal
  theme, dark mode via `class` strategy and `localStorage`, inline SVG icons
  only (no emojis).

## Marketplace Blueprint (revamp)

The platform is organized around three product verticals:

| Category       | Description                                            | Browse URL                          |
| -------------- | ------------------------------------------------------ | ----------------------------------- |
| `whatsapp-bot` | Premium WhatsApp automation scripts                    | `/showcase?category=whatsapp-bot`   |
| `snippet`      | Reusable Node.js / React / Express code modules        | `/snippets`                         |
| `plugin`       | Game plugins for TheoTown, Minecraft, and similar      | `/showcase?category=plugin`         |

### Key files added/updated by the revamp

- `server/models/ProjectAsset.js` — Mongoose schema with an embedded
  `changelogs` array (`version`, `releaseDate`, `notes[]`, `fileUrl`).
  Backwards-compatible with the legacy `title`, `version`, `assetType`, and
  `firebaseCdnUrl` fields via a pre-validate sync hook.
- `server/controllers/storageController.js` — `getAssetChangelog`,
  `createAsset`/`updateAsset` updated to accept the new fields, plus
  `pushChangelog` for publishing a new release.
- `server/routes/assetRoutes.js` — `GET /api/assets/:id/changelogs`.
- `client/src/components/Landing.jsx` — Rebuilt as a marketplace hero with a
  3-card category grid (SVG icons, no emojis).
- `client/src/components/ShowcaseHub.jsx` — Reads `?category=` from the URL
  and routes cards to the per-product changelog page.
- `client/src/pages/ChangelogsPage.jsx` — Product hero + Git-style vertical
  timeline mapped from the `changelogs` array, with per-version download
  buttons.
- `client/src/hooks/useNetworkLoading.js` — Network Information API hook
  that scales the loading bar based on `rtt` / `downlink`.
- `client/src/pages/NetworkLoader.jsx` — Cyberpunk-styled glow progress bar
  driven by the hook above.

## Routes

| Path                              | Component       | Description                                       |
| --------------------------------- | --------------- | ------------------------------------------------- |
| `/`                               | Landing         | Marketplace hero + category grid                  |
| `/showcase`                       | ShowcaseHub     | Browse all assets, filter by category             |
| `/showcase/:id`                   | AssetDetail     | Quick asset summary + jump to changelog           |
| `/products/:id/changelogs`        | ChangelogsPage  | Hero + Git-style release timeline                 |
| `/snippets` / `/snippets/:id`     | SnippetsHub     | Code snippet library                              |
| `/marketplace`                    | Marketplace     | Server provisioning via Midtrans QRIS             |
| `/admin/login` / `/admin`         | AdminLogin/Dashboard | Admin management                            |

## Setup

1. Copy `server/.env.example` to `server/.env` and fill in MongoDB, Firebase
   Admin, Midtrans, and Pterodactyl credentials. Set `ADMIN_ALLOWED_EMAIL` to
   the single authorized admin address.
2. Copy `client/.env.example` to `client/.env` and fill in the Firebase client
   SDK config.
3. Run `npm run install:all` from the project root.
4. Run `npm run dev:server` and `npm run dev:client` in separate terminals for
   local development.
5. Deploy to Vercel; `vercel.json` routes `/api/*` to the Express serverless
   function and serves the Vite build for all other paths.

## Publishing a new version

Send an authenticated `PUT /api/assets/:id` with the body:

```json
{
  "pushChangelog": {
    "version": "1.4.0",
    "notes": ["Added multi-device session recovery", "Fixed group invite bug"],
    "fileUrl": "https://storage.googleapis.com/.../bot-1.4.0.zip",
    "releaseDate": "2026-07-10T00:00:00.000Z"
  }
}
```

The server atomically prepends the entry to `changelogs`, updates
`currentVersion`, and mirrors the new URL onto `downloadUrl` /
`firebaseCdnUrl` for backwards compatibility.

## Notes

- Public routes (assets, products, changelog, order status, per-asset
  changelogs) require no authentication.
- Only `/api/assets/upload-url`, asset create/update/delete, `/api/admin/*`,
  and `/api/products` create/update require a valid Firebase ID token matching
  `ADMIN_ALLOWED_EMAIL`.
- The Midtrans webhook at `/api/payments/webhook` must be configured in the
  Midtrans dashboard and validates payloads with a SHA512 signature check
  before triggering Pterodactyl provisioning.
