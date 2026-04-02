# Commands

## Monorepo

```bash
pnpm dev              # start all services
pnpm build            # build all packages
pnpm tokens:build     # rebuild design tokens
pnpm lint             # lint all
pnpm test             # test all
pnpm typecheck        # typecheck all
```

## Frontend

```bash
pnpm --filter frontend dev       # astro dev server
pnpm --filter frontend build     # production build
pnpm --filter frontend test      # vitest
```

## Backend

```bash
# start entire stack via aspire (recommended)
dotnet run --project backend/src/ShockStack.AppHost

# or standalone
dotnet run --project backend/src/ShockStack.Api
dotnet build backend/ShockStack.slnx
dotnet test backend/ShockStack.slnx
```
