# Security and Quality Maintenance

**Date:** 2026-05-26

**Goal:** Consolidate repo-sentinel security issues, code-scanning alerts, and overlapping Dependabot PRs into one reviewed maintenance branch.

**Primary fix strategy:** raise vulnerable package floors, absorb pending Dependabot version bumps, add container healthchecks, and keep the GitHub issue labels aligned with the affected stack area.

## Alert Mapping

| Issue | Alert | Finding                                                                      | File                               | Fix                                                           |
| ----- | ----- | ---------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| #99   | 31    | CVE-2026-45736, `ws` before 8.20.1                                           | `pnpm-lock.yaml`                   | Pin `ws` override to 8.20.1 and refresh lockfile              |
| #97   | 30    | CVE-2026-44635, `kysely` before 0.28.17                                      | `pnpm-lock.yaml`                   | Pin `kysely` override to 0.28.17 and refresh lockfile         |
| #96   | 26    | CVE-2026-44665, `fast-xml-builder` before 1.1.7                              | `pnpm-lock.yaml`                   | Pin `fast-xml-builder` override to 1.1.7 and refresh lockfile |
| #95   | 29    | CVE-2026-42570, `devalue` before 5.8.1                                       | `pnpm-lock.yaml`                   | Pin `devalue` override to 5.8.1                               |
| #94   | 28    | CVE-2026-45028, `astro` before 6.1.10                                        | `pnpm-lock.yaml`                   | Update frontend `astro` to `^6.1.10`                          |
| #92   | 27    | CVE-2026-44664, `fast-xml-builder` before 1.1.6                              | `pnpm-lock.yaml`                   | Covered by `fast-xml-builder` 1.1.7                           |
| #91   | 26    | Duplicate CVE-2026-44665, `fast-xml-builder` before 1.1.7                    | `pnpm-lock.yaml`                   | Covered by `fast-xml-builder` 1.1.7                           |
| #90   | 25    | CVE-2026-42191, `OpenTelemetry.Exporter.OpenTelemetryProtocol` before 1.15.3 | `backend/Directory.Packages.props` | Update exporter to 1.15.3                                     |
| #77   | 24    | CVE-2026-40891, `OpenTelemetry.Exporter.OpenTelemetryProtocol` before 1.15.3 | `backend/Directory.Packages.props` | Update exporter to 1.15.3                                     |
| #76   | 23    | CVE-2026-40182, `OpenTelemetry.Exporter.OpenTelemetryProtocol` before 1.15.2 | `backend/Directory.Packages.props` | Covered by exporter 1.15.3                                    |
| n/a   | 22    | DS-0026, no Docker healthcheck                                               | `docker/frontend.Dockerfile`       | Add frontend HTTP healthcheck                                 |
| n/a   | 20    | DS-0026, no Docker healthcheck                                               | `backend/Dockerfile`               | Add backend HTTP readiness healthcheck                        |

## Additional Audit Finding

| Source              | Finding                                 | Path                                                               | Fix                               |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------ | --------------------------------- |
| `pnpm audit --prod` | GHSA-67mh-4wv8-2f99, `esbuild` < 0.25.0 | `better-auth` optional tooling through `drizzle-kit`/`esbuild-kit` | Pin `esbuild` override to 0.25.12 |

## Superseded Pull Requests

The consolidated branch absorbs these open Dependabot PRs so they can be closed as superseded:

| PR  | Area                  | Consolidated update                                                      |
| --- | --------------------- | ------------------------------------------------------------------------ |
| #98 | root dev dependencies | commitlint, eslint, vitest, turbo, tsx, lint-staged, and related tooling |
| #87 | .NET                  | `Microsoft.Extensions.Http.Resilience` 10.5.0                            |
| #86 | .NET                  | `Microsoft.EntityFrameworkCore` 10.0.7                                   |
| #85 | frontend              | `vue` 3.5.33                                                             |
| #84 | frontend              | `@astrojs/mdx` 5.0.4                                                     |
| #83 | .NET                  | `Microsoft.AspNetCore.OpenApi` 10.0.7                                    |
| #82 | frontend              | `tailwindcss` 4.2.4                                                      |
| #81 | .NET Aspire           | `Aspire.Hosting.PostgreSQL` 13.2.4                                       |
| #80 | frontend              | `@tailwindcss/vite` 4.2.4                                                |
| #78 | .NET Aspire           | `Aspire.Hosting.JavaScript` 13.2.4                                       |

## Labels

- JavaScript package issues: `security`, `dependencies`, `javascript`
- .NET package issues: `security`, `dependencies`, `.NET`
- Container quality alerts: `security`, `docker`

## Validation Checklist

- `pnpm install --lockfile-only`
- `pnpm audit --prod`
- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `dotnet restore backend/ShockStack.slnx`
- `dotnet test backend/ShockStack.slnx`
- `dotnet publish backend/src/ShockStack.Api/ShockStack.Api.csproj -c Release`
- `docker build -f backend/Dockerfile backend`
- `docker build -f docker/frontend.Dockerfile .`
