# ShockStack

[![CI](https://github.com/codywilliamson/shockstack/actions/workflows/ci.yml/badge.svg)](https://github.com/codywilliamson/shockstack/actions/workflows/ci.yml) [![Release](https://github.com/codywilliamson/shockstack/actions/workflows/release.yml/badge.svg)](https://github.com/codywilliamson/shockstack/actions/workflows/release.yml) [![Deploy](https://github.com/codywilliamson/shockstack/actions/workflows/deploy.yml/badge.svg)](https://github.com/codywilliamson/shockstack/actions/workflows/deploy.yml)

Convention-first monorepo template: Astro + optional .NET backend, ready for Cloudflare Workers or Docker deployment.

🔗 **[shockstack.dev](https://shockstack.dev)**

## Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Frontend      | Astro, Vue, Tailwind              |
| Content       | Astro Content Collections (MDX)   |
| Auth          | Better Auth (email/password)      |
| Frontend DB   | Drizzle ORM + Postgres            |
| Backend       | .NET Web API (optional)           |
| Backend DB    | EF Core + Postgres                |
| Design Tokens | Style Dictionary                  |
| Theme         | Multiple built-in palettes        |
| Animations    | CSS + View Transitions (zero JS)  |
| Monorepo      | Turborepo + pnpm workspaces       |
| CI/CD         | GitHub Actions + semantic-release |
| Deploy        | Cloudflare Workers + Docker       |

## Quick Start

```bash
# prerequisites: Node.js, pnpm, .NET SDK, Docker
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
├── backend/            # .NET web api (optional)
├── bin/                # ss CLI (developer experience tooling)
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

**Customize:** edit token source files → rebuild.

**Themes:** 14 built-in palettes, including Dracula, Alucard, Nord, Gruvbox variants, Catppuccin Mocha, Tokyo Night, One Dark, Solarized, Midnight, and Dawn. Switched via `[data-theme]` on `<html>`.

## Auth

Better Auth with email/password. Session state is cookie-backed with route protection enforced server-side.

## Backend (Optional)

The backend activates when the `/backend` directory is present. Clean architecture with Core, Infrastructure, and API layers.

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

## CLI (`ss`)

ShockStack includes a developer experience CLI. Run commands with `pnpm ss` or `npx tsx bin/ss.ts`.

| Command                   | Description                                                                 |
| ------------------------- | --------------------------------------------------------------------------- |
| `ss init`                 | interactive project setup wizard (identity, features, env, install, doctor) |
| `ss dev`                  | start dev server — auto-detects full-stack (Aspire) or frontend-only        |
| `ss doctor`               | check prerequisites (Node, pnpm, .NET, Docker) and project health           |
| `ss info`                 | show project state, active features, and token/theme status                 |
| `ss add page <name>`      | scaffold an Astro page (optional auth guard)                                |
| `ss add component <name>` | scaffold a Vue component                                                    |
| `ss add api <name>`       | scaffold a .NET API controller                                              |
| `ss strip`                | interactively remove unused features (backend, auth, blog)                  |
| `ss db migrate`           | run Drizzle migrations                                                      |
| `ss db seed`              | run the database seed script                                                |
| `ss db reset`             | drop all tables, migrate, and seed (with confirmation)                      |
| `ss db studio`            | launch Drizzle Studio                                                       |

## Conventions

- **Commits:** conventional commits enforced by commitlint + husky
- **Package manager:** pnpm only
- **Linting:** ESLint flat config + Prettier
- **Versioning:** semantic-release, single version for entire repo

## License

MIT
