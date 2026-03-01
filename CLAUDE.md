# ShockStack

Convention-first monorepo template: Astro 5 + optional .NET 10 backend.

## Tech Stack

- **Frontend:** Astro 5, Vue 3, Tailwind 4, reka-ui, CVA
- **Auth:** Better Auth (email/password, OAuth)
- **Frontend DB:** Drizzle ORM + Postgres
- **Backend:** .NET 10 Web API (optional, activated by `backend/` dir)
- **Backend DB:** EF Core + Postgres
- **Tokens:** Style Dictionary → CSS vars, Tailwind, TS, JSON
- **Monorepo:** Turborepo + pnpm workspaces
- **CI/CD:** GitHub Actions, semantic-release

## Directory Map

```
frontend/          → Astro 5 SSR app (CF Workers or Docker)
backend/           → .NET 10 API (clean architecture)
packages/tokens/   → Design tokens (Style Dictionary)
docker/            → Docker compose + Dockerfiles
docs/system/       → Modular system docs
```

## Key Commands

```bash
pnpm dev              # start all services
pnpm build            # build all packages
pnpm tokens:build     # rebuild design tokens
pnpm lint             # lint all
pnpm test             # test all
pnpm typecheck        # typecheck all
```

## Frontend Commands

```bash
pnpm --filter frontend dev       # astro dev server
pnpm --filter frontend build     # production build
pnpm --filter frontend test      # vitest
```

## Backend Commands

```bash
dotnet build backend/ShockStack.slnx
dotnet test backend/ShockStack.slnx
dotnet run --project backend/src/ShockStack.Api
```

## Conventions

- Conventional commits enforced via commitlint
- pnpm workspaces, no npm/yarn
- Tailwind 4 via `@tailwindcss/vite` (not legacy integration)
- Design tokens: edit `packages/tokens/tokens/*.json` → `pnpm tokens:build`
- Theme: `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`
- CSS-only animations, zero JS animation dependencies
- `prefers-reduced-motion` respected globally

## Detailed Docs

See `docs/system/` for architecture, frontend, backend, database, auth, tokens, CI/CD, and conventions documentation.
