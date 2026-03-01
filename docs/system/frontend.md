# Frontend

The frontend uses server rendering by default, with selective client interactivity where needed.

## Rendering

- Static content for docs, blog, and changelog
- Dynamic content for auth and account pages

## Components

- Layout and content components are mostly static
- Interactive UI is isolated into client-hydrated islands
- Theme-aware styles are backed by design tokens

## Content Collections

- Blog: MDX, frontmatter (title, date, description, tags, draft)
- Docs: MDX, ordered by `order` field
- Changelog: MD, version + date

## Routing and Middleware

- File-based routing controls URL structure
- Middleware resolves session context and route protection
- Public content routes avoid unnecessary auth/database work
