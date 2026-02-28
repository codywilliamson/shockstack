# ShockStack — Design Document

> Convention-first monorepo template: Astro 5 + optional .NET 10 backend, ready for Cloudflare Workers or Docker deployment.

## Audience

Built for personal use, structured for sharing. Excellent AI agent docs, clean README + contributor guides, smooth template experience.

## Approach

**Convention-First Template** — opinionated, batteries-included. Works out of the box with sensible defaults. Customization via well-documented config files. Optional .NET backend activated by presence of `/backend` directory.

---

## Repository Structure

```
shockstack/
├── frontend/                    # astro 5 application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # design system primitives
│   │   │   ├── layout/          # shell, header, footer, sidebar
│   │   │   └── content/         # blog cards, doc nav, changelog entries
│   │   ├── content/             # collections: blog, docs, changelog
│   │   ├── layouts/             # BaseLayout, DocsLayout, BlogLayout
│   │   ├── pages/               # file-based routing
│   │   ├── lib/
│   │   │   ├── auth.ts          # better auth config
│   │   │   ├── db/              # drizzle schema, client, migrations
│   │   │   └── api-client.ts    # typed client for .NET backend
│   │   ├── middleware.ts        # auth guards
│   │   └── styles/
│   │       └── global.css       # token CSS + tailwind
│   ├── public/
│   ├── astro.config.ts
│   ├── tailwind.config.ts
│   ├── wrangler.jsonc
│   ├── drizzle.config.ts
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   └── package.json
│
├── backend/                     # optional .NET 10 web API
│   ├── src/
│   │   ├── ShockStack.Api/      # controllers, middleware, Program.cs
│   │   ├── ShockStack.Core/     # entities, interfaces, DTOs
│   │   ├── ShockStack.Infrastructure/ # EF Core, repositories
│   │   └── ShockStack.Tests/    # xUnit tests
│   ├── ShockStack.sln
│   └── Dockerfile
│
├── packages/
│   └── tokens/                  # design token system (style dictionary)
│       ├── tokens/              # base.json, dracula.json, light.json, custom.json
│       ├── build.ts
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml       # full stack
│   ├── docker-compose.dev.yml   # dev overrides
│   ├── frontend.Dockerfile
│   └── postgres/init.sql
│
├── .github/
│   ├── workflows/ci.yml, release.yml, deploy.yml
│   ├── copilot-instructions.md
│   ├── CODEOWNERS
│   └── dependabot.yml
│
├── docs/
│   └── system/                  # modular system docs (token-efficient)
│       ├── architecture.md
│       ├── frontend.md
│       ├── backend.md
│       ├── database.md
│       ├── auth.md
│       ├── tokens.md
│       ├── ci-cd.md
│       └── conventions.md
│
├── CLAUDE.md                    # lean AI agent context (~100-150 lines)
├── AGENTS.md                    # openai codex context
├── .cursorrules                 # cursor AI context
├── .clinerules                  # cline context
├── .gemini/settings.json        # gemini code assist
├── commitlint.config.js
├── .releaserc.json
├── .editorconfig
├── .nvmrc
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## Frontend Architecture

### Rendering

- `output: 'server'` with `@astrojs/cloudflare` adapter
- Static content (blog, docs, changelog) uses `prerender: true`
- Dynamic pages (auth, dashboard) render on-demand via Workers

### Components

- Astro components for static/layout concerns
- Vue 3 islands for interactivity (auth forms, theme toggle, search, mobile nav)
- reka-ui for headless primitives
- CVA + clsx + tailwind-merge for variant styling

### Content Collections

- **Blog:** MDX, frontmatter (title, date, description, tags, image, draft), tag filtering, RSS, OG images
- **Docs:** MDX, auto-generated sidebar nav from file structure, prev/next navigation
- **Changelog:** auto-populated from semantic-release output, rendered as timeline

### Auth (Better Auth)

- Email/password + configurable OAuth providers
- Session management via httpOnly secure cookies
- Astro middleware injects user into `Astro.locals`
- JWT issuance for .NET API calls when backend enabled

### Database (Drizzle + Postgres)

- Drizzle ORM for Astro server routes
- Cloudflare Hyperdrive for connection pooling on CF Workers
- Direct connection in Docker mode
- Schema in `frontend/src/lib/db/schema.ts`, migrations via `drizzle-kit`

### SEO

- Reusable SEO component for `<head>` management
- `@astrojs/sitemap` for auto sitemap
- OpenGraph + Twitter Card meta per page
- JSON-LD structured data (Article, WebSite, BreadcrumbList)
- Canonical URLs, robots.txt
- preconnect hints, font optimization, `astro:assets` image optimization

### Animations

- Astro View Transitions API for page navigation
- CSS `@starting-style` and `transition-behavior: allow-discrete` for enter/exit
- Scroll-driven animations for content reveals
- `prefers-reduced-motion` respected globally
- Zero JS animation dependencies

---

## .NET Backend Architecture

### .NET 10 Web API — Clean Architecture, DDD-lite

**ShockStack.Api** — host/entry point:
- Thin controllers mapping HTTP to application layer, RESTful, versioned (`/api/v1/...`)
- Middleware: JWT validation (Better Auth tokens), global error handling, request logging, rate limiting
- Swagger/OpenAPI via Swashbuckle with XML comments and request/response examples
- Health checks (`/health`, `/health/ready`), CORS configured

**ShockStack.Core** — domain layer (zero external dependencies):
- Pure POCO entities, interfaces (`IRepository<T>`, `IUnitOfWork`), DTOs with data annotations
- Domain exceptions (`NotFoundException`, `ConflictException`)

**ShockStack.Infrastructure** — data access:
- `AppDbContext` with `IEntityTypeConfiguration<T>`
- Generic repository pattern, EF Core migrations
- References Core only

**ShockStack.Tests** — xUnit:
- Unit tests for Core logic and controllers
- Integration tests via `WebApplicationFactory<Program>`
- Coverlet for code coverage

### Key Patterns

- DI everywhere — `services.AddInfrastructure()`, `services.AddApplication()`
- Rate limiting via `System.Threading.RateLimiting` (fixed + sliding window)
- API versioning via `Asp.Versioning.Mvc`
- Global exception handler maps domain exceptions to HTTP status codes
- Response envelope: `ApiResponse<T>` with `data`, `errors`, `meta`
- OpenAPI spec exported as `openapi.json` at build time

---

## Design Token System

### Style Dictionary → CSS Variables + Tailwind Config

**Token hierarchy:**
```
base.json          → spacing, typography, radii, shadows, z-index, breakpoints
├── dracula.json   → default dark theme (Dracula colors)
├── light.json     → light mode overrides
└── custom.json    → user entry point (empty, overrides anything)
```

**Build outputs:**
1. CSS custom properties → `frontend/src/styles/tokens.css`
2. Tailwind theme extension → `frontend/tailwind.tokens.js`
3. TypeScript constants → `packages/tokens/dist/tokens.ts`
4. JSON manifest → `packages/tokens/dist/tokens.json`

**Theme switching:**
- `[data-theme="light"]` / `[data-theme="dark"]` attribute on `<html>`
- Default: system preference via `prefers-color-scheme`, persisted to localStorage
- Tailwind `darkMode: 'selector'` with `[data-theme="dark"]`

**Customization:** edit `custom.json` → `pnpm tokens:build` → all outputs regenerate.

---

## CI/CD, Versioning & DevOps

### Commit Enforcement

- commitlint with `@commitlint/config-conventional`
- husky: `commit-msg` → commitlint, `pre-commit` → lint-staged
- lint-staged: eslint --fix on `.ts/.vue/.astro`, prettier --write on all

### CI (on PR + push to main)

- Change detection via `dorny/paths-filter`
- Tokens build first (frontend depends on outputs)
- Frontend: lint → typecheck → test (vitest) → build
- Backend: build → test → format check
- Matrix: Node 20/22, .NET 10

### Release (on push to main)

- semantic-release: analyze commits → bump version → CHANGELOG.md → git tag → GitHub Release

### Deploy (on release published)

- Frontend → CF Workers via `wrangler deploy`
- Backend → Docker image → push to GHCR → deploy (configurable target)
- Either job can be disabled independently

### Docker

- `docker-compose.yml`: frontend + backend + postgres
- Multi-stage Dockerfiles for both frontend and backend
- Dev compose adds volume mounts and hot reload
- Health checks on all containers
- Ports bound to localhost only

### Turborepo

- Pipeline: `tokens:build` → `frontend:build` + `backend:build` (parallel)
- Caching for unchanged packages
- `turbo run lint test build` from root

---

## AI Agent Configuration

### Strategy: token-efficient, modular

**Root agent files** (~100-150 lines each) — lean context:
- Project name, tech stack list, key commands, directory map
- Pointers to `docs/system/` for detail
- Instruction: "keep these and docs/system/ updated on architectural changes"

**`docs/system/`** — modular topic files (~50-100 lines each):
- architecture.md, frontend.md, backend.md, database.md, auth.md, tokens.md, ci-cd.md, conventions.md
- Agents read only what's relevant to their task

**Files shipped:**
- `CLAUDE.md` — Claude Code / Claude
- `AGENTS.md` — OpenAI Codex / ChatGPT Agents
- `.cursorrules` — Cursor AI
- `.clinerules` — Cline
- `.github/copilot-instructions.md` — GitHub Copilot
- `.gemini/settings.json` — Google Gemini Code Assist

---

## Technology Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 5, Vue 3, Tailwind 4 |
| UI | reka-ui, CVA, tailwind-merge |
| Content | Astro Content Collections (MDX) |
| Auth | Better Auth |
| Frontend DB | Drizzle ORM + Postgres |
| Backend | .NET 10 Web API |
| Backend DB | EF Core + Postgres |
| Design Tokens | Style Dictionary |
| Default Theme | Dracula (light/dark, customizable) |
| Animations | CSS + View Transitions |
| SEO | sitemap, structured data, OG images |
| Monorepo | Turborepo + pnpm workspaces |
| CI | GitHub Actions |
| Versioning | semantic-release + commitlint |
| Deploy | CF Workers + Docker |
| AI Docs | modular, token-efficient system docs |
