# Auth

Better Auth with email/password. Drizzle adapter for Postgres.

## Setup

- Config: `frontend/src/lib/auth.ts`
- Client: `frontend/src/lib/auth-client.ts`
- API route: `frontend/src/pages/api/auth/[...all].ts`

## Session Flow

1. User signs in via Better Auth API
2. Session stored in httpOnly secure cookie
3. Middleware (`src/middleware.ts`) reads session, injects user into `Astro.locals`
4. Protected routes redirect to `/login` if no session

## Schema

Tables: `users`, `sessions`, `accounts`, `verifications`
Defined in `frontend/src/lib/db/schema.ts`
