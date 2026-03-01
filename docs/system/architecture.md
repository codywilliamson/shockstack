# Architecture

Monorepo with optional backend, activated by presence of `backend/` directory.

## Packages

- `frontend/` — Astro 5 SSR on CF Workers, Vue 3 islands, Tailwind 4
- `backend/` — .NET 10 Web API, clean architecture (Api → Core ← Infrastructure)
- `packages/tokens/` — Style Dictionary v5, outputs CSS vars + Tailwind config + TS + JSON

## Data Flow

1. Frontend renders static content (blog, docs) at build time
2. Dynamic pages (auth, dashboard) render server-side on CF Workers
3. Auth via Better Auth → sessions in httpOnly cookies
4. Frontend talks to Postgres via Drizzle ORM
5. Backend (optional) validates JWT from Better Auth, talks to same Postgres via EF Core

## Build Pipeline

Turborepo: `tokens:build` → `frontend:build` + `backend:build` (parallel)
