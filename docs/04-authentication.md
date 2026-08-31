# Authentication & authorization

Auth is hand-rolled (no Auth.js) for full control and to avoid a beta dependency.
It's a stateless JWT session with role-based access, layered for defense in depth.

## Sessions

- On login/register, the server signs a JWT (`jose`, HS256) containing
  `{ sub, email, name, role }` and sets it as an **httpOnly, sameSite=lax,
  secure-in-prod** cookie (`mt_session`), valid for 7 days.
  (`src/lib/auth/jwt.ts`, `src/lib/auth/session.ts`.)
- Passwords are hashed with **bcryptjs** (`src/lib/auth/password.ts`).
- `AUTH_SECRET` (env) signs and verifies tokens.

The JWT helpers are edge-safe (no Node APIs), so the same `verifyToken` runs in
both middleware and server components.

## The three layers of gating

1. **Middleware** (`src/middleware.ts`, runs at the edge)
   - `/app/*` requires any valid session; `/admin/*` requires `role === ADMIN`.
   - unauthenticated requests to protected routes redirect to `/login?next=…`.
   - logged-in users are bounced off `/login` and `/register`.

2. **Layout guards** (`requireUser` / `requireAdmin` in
   `src/lib/auth/current-user.ts`)
   - re-fetch the user from the DB (request-memoised with React `cache`), so a
     **suspended or deleted** account is rejected even with a valid token,
   - redirect on failure.

3. **Server actions**
   - every mutation calls `requireUser`/`requireAdmin` again and verifies per-row
     ownership (e.g. a user can only edit their own zones; admins can't
     demote/suspend/delete themselves).

## Login flow

```
POST login → validate (zod) → find user → check status → verify password
           → sign JWT + set cookie → redirect (admin → /admin, else → /app or ?next)
```

Errors are intentionally generic ("Invalid email or password") to avoid user
enumeration. The `next` redirect target is restricted to same-origin absolute
paths to prevent open redirects.

## Demo accounts

`admin@maptracker.app` / `demo@maptracker.app`, both `password123` (seeded). The
sign-in page has one-click "fill demo" buttons.
