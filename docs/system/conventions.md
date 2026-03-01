# Conventions

## Commits

Conventional commits enforced by commitlint + husky.
Types: `feat`, `fix`, `chore`, `ci`, `test`, `refactor`, `docs`, `style`, `perf`, `build`

## Package Management

pnpm only. Workspaces are configured at the repo root.

## Linting

- ESLint + Prettier run across workspace packages
- lint-staged runs on pre-commit

## Documentation Style

- Prefer behavior and intent over implementation details
- Avoid hardcoding library/framework versions in docs text
- Keep file-path references minimal and only when they are required for action
- Update docs when conventions or workflows change

## Versioning

semantic-release on push to main. Single version for entire repo.

## CI/CD

- CI: paths-filter → tokens build → frontend matrix (lint, typecheck, test, build) → backend matrix (build, test)
- Release: semantic-release → CHANGELOG.md → GitHub Release
- Deploy: CF Workers (frontend) + Docker/GHCR (backend)
