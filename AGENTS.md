# ShockStack — Agent Context

Convention-first monorepo: Astro 5 + Vue 3 + Tailwind 4, optional .NET 10 backend.

## Structure

- `frontend/` — Astro 5 SSR, Vue 3 islands, Tailwind 4, Better Auth, Drizzle ORM
- `backend/` — .NET 10 Web API, clean architecture, EF Core (optional)
- `packages/tokens/` — Style Dictionary design tokens
- `docker/` — Docker compose for full stack

## Commands

- `pnpm dev` / `pnpm build` / `pnpm test` — turborepo tasks
- `pnpm tokens:build` — rebuild design tokens
- `dotnet build/test backend/ShockStack.slnx` — .NET backend

## Conventions

- Conventional commits, pnpm only, Tailwind 4 via Vite plugin
- Tokens: JSON → CSS vars + Tailwind config + TS constants
- Themes: Dracula dark (default) + Alucard light via `data-theme` attribute
- See `docs/system/` for detailed architecture docs
