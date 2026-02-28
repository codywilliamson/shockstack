# ShockStack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a convention-first monorepo template with Astro 5 SSR on Cloudflare Workers, optional .NET 10 backend, Style Dictionary design tokens, Better Auth, and complete CI/CD.

**Architecture:** Monorepo with `frontend/` (Astro 5 + Vue 3), `backend/` (.NET 10, optional), `packages/tokens/` (Style Dictionary v5). Turborepo orchestrates builds, pnpm workspaces manage JS packages. Frontend deploys to CF Workers or Docker. Backend deploys via Docker.

**Tech Stack:** Astro 5, Vue 3, Tailwind 4, reka-ui, CVA, Better Auth, Drizzle ORM, Postgres, .NET 10, EF Core, .NET Aspire, Style Dictionary v5, Turborepo, semantic-release, GitHub Actions

---

## Phase 1: Repository Foundation (Tasks 1-5)

### Task 1: Initialize monorepo structure

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.nvmrc`
- Create: `.editorconfig`

**Step 1: Create root package.json**

```json
{
  "name": "shockstack",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "prepare": "husky"
  },
  "devDependencies": {
    "turbo": "^2.5.0"
  },
  "packageManager": "pnpm@10.4.1",
  "engines": {
    "node": ">=22"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "frontend"
  - "packages/*"
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {}
  }
}
```

**Step 4: Create .nvmrc**

```
22
```

**Step 5: Create .editorconfig**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

**Step 6: Install and commit**

```bash
pnpm install
git add pnpm-workspace.yaml turbo.json .nvmrc .editorconfig package.json pnpm-lock.yaml
git commit -m "chore: initialize monorepo with pnpm workspaces and turbo"
```

---

### Task 2: Setup commit enforcement

**Files:**
- Create: `commitlint.config.js`
- Create: `.husky/commit-msg`
- Create: `.husky/pre-commit`
- Modify: `package.json`

**Step 1: Install dependencies**

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional husky lint-staged
```

**Step 2: Create commitlint.config.js**

```js
export default {
  extends: ["@commitlint/config-conventional"],
};
```

**Step 3: Initialize husky**

```bash
pnpm exec husky init
```

**Step 4: Create .husky/commit-msg**

```bash
pnpm exec commitlint --edit "$1"
```

**Step 5: Create .husky/pre-commit**

```bash
pnpm exec lint-staged
```

**Step 6: Add lint-staged config to package.json**

```json
{
  "lint-staged": {
    "*.{ts,tsx,vue,astro,js,cjs,mjs}": ["eslint --fix"],
    "*.{ts,tsx,vue,astro,js,cjs,mjs,json,css,md}": ["prettier --write"]
  }
}
```

**Step 7: Commit**

```bash
git add commitlint.config.js .husky/ package.json pnpm-lock.yaml
git commit -m "chore: add commitlint, husky, and lint-staged"
```

---

### Task 3: Setup semantic-release

**Files:**
- Create: `.releaserc.json`

**Step 1: Install semantic-release and plugins**

```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git @semantic-release/github @semantic-release/exec @semantic-release/npm
```

**Step 2: Create .releaserc.json**

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { "changelogFile": "CHANGELOG.md" }],
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/exec", { "prepareCmd": "echo 'version: ${nextRelease.version}' > .release-version" }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json", ".release-version"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

**Step 3: Commit**

```bash
git add .releaserc.json package.json pnpm-lock.yaml
git commit -m "chore: add semantic-release config"
```

---

### Task 4: Create GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
      backend: ${{ steps.filter.outputs.backend }}
      tokens: ${{ steps.filter.outputs.tokens }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'frontend/**'
              - 'packages/**'
            backend:
              - 'backend/**'
            tokens:
              - 'packages/tokens/**'

  tokens:
    needs: changes
    if: ${{ needs.changes.outputs.tokens == 'true' || needs.changes.outputs.frontend == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @shockstack/tokens build
      - uses: actions/upload-artifact@v4
        with:
          name: token-dist
          path: packages/tokens/dist/

  frontend:
    needs: [changes, tokens]
    if: ${{ needs.changes.outputs.frontend == 'true' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        task: [lint, typecheck, test, build]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        with:
          name: token-dist
          path: packages/tokens/dist/
      - run: pnpm --filter frontend ${{ matrix.task }}

  backend:
    needs: changes
    if: ${{ needs.changes.outputs.backend == 'true' }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        task: [build, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "10.x"
      - run: dotnet restore backend/ShockStack.sln
      - if: ${{ matrix.task == 'build' }}
        run: dotnet build backend/ShockStack.sln --no-restore --configuration Release
      - if: ${{ matrix.task == 'test' }}
        run: dotnet test backend/ShockStack.sln --no-restore --configuration Release
      - if: ${{ matrix.task == 'build' }}
        run: dotnet format backend/ShockStack.sln --verify-no-changes
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add CI workflow with paths-filter and matrix jobs"
```

---

### Task 5: Create release and deploy workflows

**Files:**
- Create: `.github/workflows/release.yml`
- Create: `.github/workflows/deploy.yml`

**Step 1: Create .github/workflows/release.yml**

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 2: Create .github/workflows/deploy.yml**

```yaml
name: Deploy

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      skip_frontend:
        description: "Skip frontend deploy"
        type: boolean
        default: false
      skip_backend:
        description: "Skip backend deploy"
        type: boolean
        default: false

jobs:
  build-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @shockstack/tokens build
      - uses: actions/upload-artifact@v4
        with:
          name: token-dist
          path: packages/tokens/dist/

  deploy-frontend:
    needs: build-tokens
    if: ${{ !inputs.skip_frontend }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        with:
          name: token-dist
          path: packages/tokens/dist/
      - run: pnpm --filter frontend build
      - run: pnpm --filter frontend exec wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

  deploy-backend:
    needs: build-tokens
    if: ${{ !inputs.skip_backend }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend:latest
            ghcr.io/${{ github.repository }}/backend:${{ github.event.release.tag_name || github.sha }}
```

**Step 3: Commit**

```bash
git add .github/workflows/release.yml .github/workflows/deploy.yml
git commit -m "ci: add release and deploy workflows"
```

---

_The remaining phases (2-9, Tasks 6-58) continue with the same granularity. Due to the length of this plan, they are saved as companion files._

**Companion files:**
- Phase 2-3 (Tasks 6-18): Design tokens + frontend core
- Phase 4-6 (Tasks 19-40): Auth + .NET backend + Docker
- Phase 7-9 (Tasks 41-58): Animations + AI agent config + QA

---

## Phase Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | Monorepo, commit enforcement, semantic-release, CI/CD workflows |
| 2 | 6-10 | Style Dictionary token system with Dracula/Alucard themes |
| 3 | 11-18 | Astro 5 project, Tailwind 4, components, content collections, pages |
| 4 | 19-24 | Better Auth with Drizzle, middleware, auth UI |
| 5 | 25-35 | .NET 10 API with clean architecture, Aspire, tests |
| 6 | 36-40 | Docker compose, Dockerfiles, postgres init |
| 7 | 41-45 | View transitions, scroll animations, landing page polish |
| 8 | 46-52 | AI agent configs (CLAUDE.md, AGENTS.md, etc.), system docs, README |
| 9 | 53-58 | .env.example, API client, smoke tests, CI validation, v1.0.0 release |

**Total: 58 tasks across 9 phases**

Each task is a single conventional commit. The plan follows TDD where applicable (token tests, controller tests, integration tests, smoke tests).
