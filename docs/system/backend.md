# Backend

.NET 10 Web API with clean architecture. Optional — activated by `backend/` directory presence.

## Projects

- `ShockStack.Api` — controllers, middleware, Program.cs
- `ShockStack.Core` — entities, interfaces, DTOs (zero external deps)
- `ShockStack.Infrastructure` — EF Core DbContext, repositories
- `ShockStack.Tests` — xUnit tests

## Key Patterns

- DI: `services.AddInfrastructure(connectionString)`
- Global exception handler maps domain exceptions → HTTP status codes
- Response envelope: `ApiResponse<T>` with data, errors, meta
- Health checks at `/health` and `/api/v1/health/ready`

## Commands

```bash
dotnet build backend/ShockStack.slnx
dotnet test backend/ShockStack.slnx
dotnet run --project backend/src/ShockStack.Api
```
