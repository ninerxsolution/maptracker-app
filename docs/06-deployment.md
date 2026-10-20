# Deployment

MapTracker runs on **PostgreSQL** — Docker locally, **Prisma Postgres** in
production on **Vercel**. (A SQLite file can't be used on Vercel: serverless functions have an
ephemeral filesystem and no shared disk, so writes would vanish.)

## Local

```bash
npm install
cp .env.example .env      # local DB URLs are already filled in; set AUTH_SECRET
npm run db:up             # Postgres 17 in Docker on port 5433
npm run db:migrate        # apply migrations
npm run db:seed           # live USGS events + demo users/zones/bookmarks
npm run dev
```

`npm run db:down` stops the database (data persists in a Docker volume).

## Environment variables

| Variable              | Required | Notes |
| --------------------- | -------- | ----- |
| `DATABASE_URL`        | ✅       | Used by the app and by `prisma migrate deploy`. Injected by the Prisma Postgres integration on Vercel. |
| `AUTH_SECRET`         | ✅       | Signs session JWTs. In production it must be ≥ 32 chars and not a placeholder (enforced at runtime). |
| `NEXT_PUBLIC_APP_URL` | ➖       | Absolute base URL for metadata/links. |
| `SEED_ADMIN_PASSWORD` | ➖       | Overrides the seeded admin password. |

The integration also adds `…POSTGRES_URL` and `…PRISMA_DATABASE_URL` (an
Accelerate URL); the app doesn't use them.

## Vercel + Prisma Postgres (free tiers)

1. **Import the repo** — Vercel → *Add New → Project* → pick the GitHub repo.
   Framework is detected as Next.js; the build command comes from `vercel.json`
   (`npm run vercel-build` = `prisma generate && prisma migrate deploy && next build`).
2. **Add the database** — Project → *Storage* → *Create* → **Prisma Postgres** →
   connect it to the project. This injects `DATABASE_URL`; don't set it by hand.
   - Preview deployments share this database (and run migrations against it).
     Connect it to Production only if previews shouldn't touch it.
3. **Add `AUTH_SECRET`** — Project → *Settings → Environment Variables* → Production
   and Preview. Generate one locally:
   `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48)) | Set-Clipboard`
   (PowerShell) or `openssl rand -base64 48`.
4. **Deploy** — redeploy after adding the database. Migrations run during the build.
5. **Seed once (optional)** — copy the `DATABASE_URL` value (Vercel → *Storage* →
   the database → *.env.local* tab → *Show secret*) and run the seed against it
   from your terminal without pasting it anywhere else:
   ```powershell
   $env:DATABASE_URL = Get-Clipboard; npm run db:seed; Remove-Item Env:DATABASE_URL
   ```
   Shell variables override `.env`. Set `SEED_ADMIN_PASSWORD` too if the site is public.

## Notes

- `postinstall` also runs `prisma generate`, so the client is built even with a
  cached `node_modules`.
- The free plan includes 200k operations/month and 2 GB storage — plenty for a demo.
  Prisma Client is a global singleton (`src/lib/db.ts`) so warm functions reuse
  their connection.
- Switching to **Neon** instead: it injects a pooled `DATABASE_URL` plus
  `DATABASE_URL_UNPOOLED`; add `directUrl = env("DATABASE_URL_UNPOOLED")` to the
  datasource so migrations use the direct connection.
- Basemap tiles and the USGS feeds are public and need no keys.
