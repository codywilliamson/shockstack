# Conventions

## Commits

Conventional commits enforced by commitlint + husky.
Types: `feat`, `fix`, `chore`, `ci`, `test`, `refactor`, `docs`, `style`, `perf`, `build`

## Package Management

pnpm only. Workspaces defined in `pnpm-workspace.yaml`.

## Linting

- ESLint flat config with Astro, Vue, TypeScript plugins
- Prettier with Astro + Tailwind plugins
- lint-staged runs on pre-commit

## Versioning

semantic-release on push to main. Single version for entire repo.

## CI/CD

- CI: paths-filter → tokens build → frontend matrix (lint, typecheck, test, build) → backend matrix (build, test)
- Release: semantic-release → CHANGELOG.md → GitHub Release
- Deploy: CF Workers (frontend) + Docker/GHCR (backend)
