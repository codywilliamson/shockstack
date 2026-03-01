# ShockStack

Convention-first monorepo template: Astro 5 + optional .NET 10 backend, ready for Cloudflare Workers or Docker deployment.

## Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Frontend      | Astro 5, Vue 3, Tailwind 4        |
| Content       | Astro Content Collections (MDX)   |
| Auth          | Better Auth (email/password)      |
| Frontend DB   | Drizzle ORM + Postgres            |
| Backend       | .NET 10 Web API (optional)        |
| Backend DB    | EF Core + Postgres                |
| Design Tokens | Style Dictionary v4               |
| Theme         | Dracula dark + Alucard light      |
| Animations    | CSS + View Transitions (zero JS)  |
| Monorepo      | Turborepo + pnpm workspaces       |
| CI/CD         | GitHub Actions + semantic-release |
| Deploy        | Cloudflare Workers + Docker       |

## Quick Start

```bash
# prerequisites: node 22+, pnpm 10+, .NET 10 SDK, Docker
pnpm install
pnpm tokens:build

# start everything with aspire (postgres + api + frontend + dashboard)
dotnet run --project backend/src/ShockStack.AppHost
```

Aspire starts Postgres, the .NET API, and the Astro frontend automatically. The Aspire dashboard gives you logs, traces, and metrics for all services.

**Frontend-only development:**

```bash
pnpm tokens:build
pnpm --filter frontend dev
```

## Project Structure

```
shockstack/
├── frontend/           # astro 5 + vue 3 application
├── backend/            # .NET 10 web api (optional)
├── packages/tokens/    # style dictionary design tokens
├── docker/             # compose files + dockerfiles
├── docs/system/        # modular system documentation
└── .github/            # ci/cd workflows
```

## Design Tokens

Style Dictionary generates multi-format outputs from JSON source tokens:

```bash
pnpm tokens:build
```

**Outputs:** CSS custom properties, Tailwind theme extension, TypeScript constants, JSON manifest.

**Customize:** edit `packages/tokens/tokens/custom.json` → rebuild.

**Themes:** Dracula (dark, default) + Alucard (light). Switched via `[data-theme]` attribute on `<html>`.

## Auth

Better Auth with email/password. Session stored in httpOnly secure cookies. Middleware injects user into `Astro.locals` and guards protected routes.

## Backend (Optional)

The .NET 10 backend activates when the `/backend` directory is present. Clean architecture with `Core` → `Infrastructure` → `Api` layers.

```bash
cd backend
dotnet build
dotnet test
```

## Docker

```bash
# full stack
docker compose -f docker/docker-compose.yml up

# dev with hot reload
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up
```

## Environment Variables

Copy `.env.example` and fill in values:

```bash
cp .env.example .env
```

## CI/CD

- **CI:** paths-filter → tokens build → frontend matrix (lint, typecheck, test, build) → backend matrix (build, test)
- **Release:** semantic-release on push to main → CHANGELOG.md → GitHub Release
- **Deploy:** Cloudflare Workers (frontend) + Docker/GHCR (backend)

## AI Agent Docs

This repo ships context files for multiple AI coding assistants:

- `CLAUDE.md` — Claude Code
- `AGENTS.md` — OpenAI Codex
- `.cursorrules` — Cursor
- `.clinerules` — Cline
- `.github/copilot-instructions.md` — GitHub Copilot
- `.gemini/settings.json` — Gemini Code Assist

Detailed system docs live in `docs/system/`.

## Conventions

- **Commits:** conventional commits enforced by commitlint + husky
- **Package manager:** pnpm only
- **Linting:** ESLint flat config + Prettier with Astro/Vue/Tailwind plugins
- **Versioning:** semantic-release, single version for entire repo

## License

MIT
