# Architecture

ShockStack is a convention-first monorepo with an optional backend. It is designed so teams can start with a frontend-first setup and add backend services without restructuring the project.

## System Parts

- Frontend app: server-rendered pages plus selectively hydrated interactive islands
- Optional backend API: clean architecture with clear application and infrastructure boundaries
- Design tokens package: single source of truth for visual primitives and themes
- Dev/ops tooling: shared build tasks, CI workflows, release automation, and container support

## Runtime Shape

- Static content (docs, blog, changelog) is generated at build time
- Dynamic pages (auth and account areas) render on the server
- Authentication uses cookie-based sessions
- Frontend and backend can share the same Postgres instance
- Backend is additive: the frontend can run on its own, or alongside the API

## Data and Request Flow

1. Browser requests route
2. Middleware resolves session context
3. Route is served as static output or server-rendered response
4. Data is read/written through the appropriate data access layer
5. Consistent API response and error envelopes are returned

## Build and Delivery Model

- Token generation runs before app builds
- Frontend and backend build independently after shared prerequisites are ready
- CI can scope jobs to changed areas for faster feedback
- Release and deploy workflows are automated from the default branch/release events
