# Deployment

MapTracker runs on **PostgreSQL** — Docker locally, **Neon** in production on
**Vercel**. (A SQLite file can't be used on Vercel: serverless functions have an
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

| Variable                | Required | Notes |
| ----------------------- | -------- | ----- |
| `DATABASE_URL`          | ✅       | Pooled connection — used by the app. Injected by the Neon integration on Vercel. |
| `DATABASE_URL_UNPOOLED` | ✅       | Direct connection — used by `prisma migrate deploy`. Injected by the Neon integration. |
| `AUTH_SECRET`           | ✅       | Signs session JWTs. In production it must be ≥ 32 chars and not a placeholder (enforced at runtime). |
| `NEXT_PUBLIC_APP_URL`   | ➖       | Absolute base URL for metadata/links. |
| `SEED_ADMIN_PASSWORD`   | ➖       | Overrides the seeded admin password. |

## Vercel + Neon (free tiers)

1. **Import the repo** — Vercel → *Add New → Project* → pick the GitHub repo.
   Framework is detected as Next.js; the build command comes from `vercel.json`
   (`npm run vercel-build` = `prisma generate && prisma migrate deploy && next build`).
2. **Add the database** — Project → *Storage* → *Create* → **Neon** → connect it to
   the project (Production + Preview). This injects `DATABASE_URL` and
   `DATABASE_URL_UNPOOLED`; don't set them by hand.
   - Enable Neon **Preview branching** if you deploy previews, so each preview gets
     its own database branch instead of migrating the production database.
3. **Add `AUTH_SECRET`** — Project → *Settings → Environment Variables* → Production
   and Preview. Generate one locally:
   `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48)) | Set-Clipboard`
   (PowerShell) or `openssl rand -base64 48`.
4. **Deploy** — redeploy after adding the database. Migrations run during the build.
5. **Seed once (optional)** — copy the Neon **direct** connection string (Neon
   console → Connect, pooling off) and run the seed against it from your terminal:
   ```powershell
   $env:DATABASE_URL = "<neon direct url>"; $env:DATABASE_URL_UNPOOLED = $env:DATABASE_URL
   npm run db:seed
   ```
   Shell variables override `.env`. Set `SEED_ADMIN_PASSWORD` too if the site is public.

## Notes

- `postinstall` also runs `prisma generate`, so the client is built even with a
  cached `node_modules`.
- Neon's free compute scales to zero after 5 minutes idle; the first request
  afterwards waits for it to wake (usually well under a second).
- If you ever see `prepared statement "s0" already exists`, append
  `pgbouncer=true` to the pooled `DATABASE_URL`.
- Basemap tiles and the USGS feeds are public and need no keys.
