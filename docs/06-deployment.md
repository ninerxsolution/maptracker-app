# Deployment

## Local

SQLite is perfect locally:

```bash
npm install
cp .env.example .env      # set AUTH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment variables

| Variable             | Required | Notes |
| -------------------- | -------- | ----- |
| `DATABASE_URL`       | ✅       | `file:./dev.db` locally; a network DB in prod |
| `AUTH_SECRET`        | ✅       | Signs session JWTs. Generate: `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL`| ➖       | Absolute base URL for metadata/links |

## Deploying to Vercel

> ⚠️ **Plain SQLite does not work on Vercel.** Serverless functions run on an
> ephemeral, effectively read-only filesystem — writes vanish and instances don't
> share a disk. Swap the datasource to a networked database. Prisma makes this a
> near one-line change.

### Option A — Turso / libSQL (closest to SQLite)

1. Create a Turso database and get its `libsql://…` URL + auth token.
2. Point Prisma at libSQL using the driver adapter (`@prisma/adapter-libsql`) and
   set `DATABASE_URL` to the Turso URL.
3. Keep the rest of the schema as-is (libSQL is SQLite-compatible).

### Option B — Postgres (Neon / Vercel Postgres / Supabase)

1. In `prisma/schema.prisma` set `datasource.provider = "postgresql"`.
2. Set `DATABASE_URL` to a **pooled** connection string.
3. Regenerate the migration for Postgres.

### Then, for either option

1. Set `DATABASE_URL`, `AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` in Vercel's
   environment settings.
2. Run migrations at deploy time — add `prisma migrate deploy` to the build
   (e.g. a `vercel-build` script) rather than migrating at runtime.
3. Seed once against the production database if you want demo data
   (`npm run db:seed` with the prod `DATABASE_URL`).

## Notes

- `postinstall` runs `prisma generate` so the client is always built.
- The build is a standard `next build`; no special server is required.
- Basemap tiles and the USGS feeds are public and need no keys.
