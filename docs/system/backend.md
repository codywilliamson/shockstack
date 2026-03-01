# Backend

.NET 10 Web API with clean architecture. Optional — activated by `backend/` directory presence.

## Projects

- `ShockStack.Api` — controllers, middleware, Program.cs
- `ShockStack.Core` — entities, interfaces, DTOs (zero external deps)
- `ShockStack.Infrastructure` — EF Core DbContext, repositories
- `ShockStack.ServiceDefaults` — Aspire service defaults (OpenTelemetry, health checks, resilience)
- `ShockStack.AppHost` — Aspire orchestrator (Postgres, API, frontend)
- `ShockStack.Tests` — xUnit tests

## Key Patterns

- DI: `services.AddInfrastructure(connectionString)`
- Global exception handler maps domain exceptions → HTTP status codes
- Response envelope: `ApiResponse<T>` with data, errors, meta
- ServiceDefaults: OpenTelemetry tracing/metrics, health checks, service discovery
- Health endpoints: `/health` (readiness), `/alive` (liveness)

## Aspire (Dev Orchestration)

Single command starts Postgres, API, and frontend with Aspire dashboard:

```bash
dotnet run --project backend/src/ShockStack.AppHost
```

Dashboard shows logs, traces, metrics for all services. Postgres provisioned automatically with data volume.

## Commands

```bash
# run entire stack via aspire (recommended for dev)
dotnet run --project backend/src/ShockStack.AppHost

# or run api standalone
dotnet run --project backend/src/ShockStack.Api

dotnet build backend/ShockStack.slnx
dotnet test backend/ShockStack.slnx
```
