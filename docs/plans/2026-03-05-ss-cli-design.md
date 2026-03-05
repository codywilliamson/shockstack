# ss CLI — design doc

> ShockStack developer experience CLI. lightweight commander-based tool wired via package.json bin field.

## overview

a TypeScript CLI (`bin/ss.ts`) using commander for subcommand routing and tsx for execution. provides setup automation, scaffolding, smart dev server, and database convenience commands.

## v1 command surface

```bash
ss init [--yes] [--skip-prompts]
ss doctor
ss info
ss dev [--frontend | --backend]
ss add page|component|api <name> [--dry-run]
ss strip
ss db seed|reset|migrate|studio [--force]
```

## structure

```
bin/
├── ss.ts                      # entry point — commander setup
├── commands/
│   ├── init.ts                # interactive project setup + strip
│   ├── doctor.ts              # prerequisite checks
│   ├── info.ts                # show project state
│   ├── dev.ts                 # smart dev server start
│   ├── add.ts                 # scaffolding (page, component, api)
│   ├── strip.ts               # remove unused features
│   └── db.ts                  # database commands
├── templates/
│   ├── page.astro.hbs         # astro page template
│   ├── component.vue.hbs      # vue component template
│   └── endpoint.cs.hbs        # .NET endpoint template
└── lib/
    ├── context.ts             # repo root, feature detection, env mode
    ├── guards.ts              # assertRepoRoot, confirmDestructive, etc.
    ├── prompts.ts             # shared prompt helpers
    ├── detect.ts              # detect project state (backend? auth? etc.)
    └── log.ts                 # styled console output
```

## dependencies

- `commander` — subcommand routing, argument parsing, help text
- `@inquirer/prompts` — interactive prompts (select, confirm, input)
- `handlebars` — template rendering for scaffolding
- `tsx` — already in project, runs TypeScript directly

## wiring

package.json:

```json
{
  "bin": {
    "ss": "./bin/ss.ts"
  }
}
```

shebang in `bin/ss.ts`:

```ts
#!/usr/bin/env tsx
```

after `pnpm install`, `ss` is available anywhere in the repo.

## commands — detailed spec

### ss init

interactive project setup wizard. runs in phases with checkpoints.

**phase 1 — identity**

- prompt: project name, description, author
- updates package.json, README title

**phase 2 — feature selection**

- prompt: do you want the backend? (y/n)
- prompt: do you want auth? (y/n)
- prompt: do you want the blog/content? (y/n)
- prompt: which themes? (multi-select from 14 built-in)

**phase 3 — strip**

- runs `ss strip` internally for anything the user said no to
- warns about git dirty state before proceeding
- prints exactly what will be removed, asks for confirmation

**phase 4 — environment**

- generates `.env` from `.env.example` with smart defaults
- if `.env` already exists, shows diff and asks merge vs overwrite
- fills in `BETTER_AUTH_SECRET` with a generated value

**phase 5 — install & build**

- runs `pnpm install`
- runs `pnpm tokens:build`
- runs `ss doctor` to verify everything is good

**phase 6 — database (optional)**

- if postgres is reachable, offers to run migrations + seed
- if not, skips with instructions for later

**phase 7 — done**

- prints summary of what was set up
- prints "run `ss dev` to start"

flags:

- `--yes` — accept all defaults, no prompts
- `--skip-prompts` — skip interactive prompts, use defaults

resume: if a phase fails, prints which phase failed and how to retry from that point.

### ss doctor

checks prerequisites, prints pass/fail table.

| check    | required            | condition                    |
| -------- | ------------------- | ---------------------------- |
| node     | always              | >= 22                        |
| pnpm     | always              | >= 10.4                      |
| dotnet   | if backend/ exists  | any version                  |
| docker   | if docker/ exists   | any version                  |
| postgres | if DATABASE_URL set | connection succeeds          |
| .env     | always              | exists, has required vars    |
| tokens   | always              | packages/tokens/dist/ exists |

- distinguishes missing vs wrong version (e.g. "node 18 found, need 22+")
- validates optional deps conditionally (no .NET fail in frontend-only mode)
- checks it's running from repo root

### ss info

prints current project state:

- project name + version
- active features (backend, auth, blog)
- detected mode (frontend-only / full-stack)
- database status (connected / unreachable / not configured)
- theme count and active theme
- key paths (frontend, backend, tokens, docker)

### ss dev

smart dev server start.

detection logic:

1. backend/ exists + dotnet available → `dotnet run --project backend/src/ShockStack.AppHost`
2. backend/ exists but no dotnet → warn, fall back to frontend-only
3. frontend only → `pnpm --filter frontend dev`

flags:

- `--frontend` — force frontend-only mode
- `--backend` — force aspire/full-stack mode

extras:

- port collision detection with actionable fix
- if postgres is down in full-stack mode, show targeted remediation

### ss add \<type\> \<name\>

scaffolds files from handlebars templates.

**ss add page \<name\>**

- creates `frontend/src/pages/<name>.astro`
- prompts: layout? (default/none), auth guard? (y/n)
- name collision check

**ss add component \<name\>**

- creates `frontend/src/components/<name>.vue`
- prompts: props interface? (y/n)
- PascalCase enforcement

**ss add api \<name\>**

- creates `backend/src/ShockStack.Api/Endpoints/<Name>.cs`
- guards: blocks if backend feature is disabled, suggests `ss init` to enable
- prompts: HTTP method? (GET/POST/PUT/DELETE)

all types:

- `--dry-run` — prints what would be created without writing files
- name collision detection with abort

### ss strip

interactive feature removal. one-way destructive operation (designed for use during init or early setup).

removable features:

- **backend** — deletes backend/, removes docker backend service, aspire references, .NET from doctor checks
- **auth** — removes Better Auth config, auth pages, middleware, db auth schema, auth deps
- **blog** — removes content collections, blog pages, MDX dependencies
- **themes** — select which to keep, delete others from tokens config

safety:

- prints exact files/directories to be removed
- requires typed confirmation (type feature name to confirm)
- warns if git has uncommitted changes

### ss db \<subcommand\>

database convenience commands.

- `ss db seed` — runs `frontend/src/lib/db/seed.ts` via tsx
- `ss db reset` — drops all tables, runs migrations, seeds. requires `--force` or typed confirmation. blocks if DATABASE_URL looks like production.
- `ss db migrate` — runs `drizzle-kit push` or `drizzle-kit migrate`
- `ss db studio` — launches `drizzle-kit studio`, fails gracefully if not installed

## shared lib

### context.ts

- resolves repo root (walks up looking for package.json with "shockstack")
- detects active features by checking directory/file existence
- reads .env and package.json
- exposes `getContext()` returning typed project state

### guards.ts

- `assertRepoRoot()` — exit with message if not in shockstack repo
- `assertFeatureEnabled(feature)` — exit if feature is stripped
- `confirmDestructive(message)` — typed confirmation prompt
- `assertSafeToMutate()` — warn on dirty git state

### detect.ts

- `hasBackend()` — checks backend/ directory exists
- `hasAuth()` — checks auth config file exists
- `hasBlog()` — checks content collections exist
- `getThemes()` — lists available theme tokens
- `getDbStatus()` — tests postgres connection

### log.ts

- styled output: success (green), warning (yellow), error (red), info (blue)
- step indicators for multi-phase commands (e.g. `[3/7] building tokens...`)
- table output for doctor checks

## rollout order

1. **doctor + info + dev** — highest daily DX value, smallest scope
2. **init** — phased setup with resume
3. **strip** — feature removal during init
4. **add** — scaffolding with templates
5. **db** — database convenience

## future (v2)

- `ss feature list|enable|disable` — reversible feature toggling
- `ss add theme <name>` — scaffold new theme token set
- `--json` output flag on all commands
- `ss init --preset minimal|fullstack|content`
- template manifest (`bin/templates/manifest.json`) for data-driven scaffolding
