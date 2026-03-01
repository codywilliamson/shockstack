# Backend

The backend is optional and follows clean architecture so domain logic stays independent of delivery and persistence concerns.

## Layering

- API layer: HTTP endpoints, request/response handling, middleware
- Core layer: domain entities, interfaces, and business contracts
- Infrastructure layer: persistence and external integrations
- Shared service defaults: observability, health, resilience conventions
- App host: local orchestration for multi-service development
- Tests: backend verification suite

## Behavior Conventions

- Dependency injection wires infrastructure behind core interfaces
- Domain-oriented exceptions are translated to HTTP status codes
- API responses use a consistent envelope shape
- Health endpoints support readiness/liveness checks

## Local Development

Use the app host when you want a full-stack local environment (database + API + frontend + service dashboard).  
Use the API project directly when iterating on backend-only changes.

## Build and Test

```bash
cd backend
dotnet build
dotnet test
```
