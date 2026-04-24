---
applyTo: "**"
description: "Project conventions and standards"
---

## Conventions

- Conventional commits enforced via commitlint
- pnpm workspaces, no npm/yarn
- Tailwind 4 via `@tailwindcss/vite` (not legacy integration)
- Design tokens: edit `docs/system/DESIGN.md` → run `pnpm --filter @shockstack/tokens build` to extract via `@google/design.md` and export to Tailwind
- Theme: `[data-theme="dark"]` / `[data-theme="light"]` on `<html>`
- CSS-only animations, zero JS animation dependencies
- `prefers-reduced-motion` respected globally

See `docs/system/` for architecture, frontend, backend, database, auth, tokens, CI/CD, and conventions documentation.
