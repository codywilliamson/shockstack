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

## Structure

```
frontend/          → Astro 5 SSR app (CF Workers or Docker)
backend/           → .NET 10 API (clean architecture)
packages/tokens/   → Design tokens (Style Dictionary)
docker/            → Docker compose + Dockerfiles
docs/system/       → Modular system docs
```
