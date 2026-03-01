# Frontend

Astro 5 with `output: 'server'` and `@astrojs/cloudflare` adapter.

## Rendering

- Static: blog, docs, changelog (`export const prerender = true`)
- Dynamic: auth pages, dashboard (server-rendered on Workers)

## Components

- Astro components for layout/static
- Vue 3 islands for interactivity (`client:load`)
- Design system uses token CSS vars via Tailwind 4 `@theme`

## Content Collections

- Blog: MDX, frontmatter (title, date, description, tags, draft)
- Docs: MDX, ordered by `order` field
- Changelog: MD, version + date

## Key Files

- `astro.config.ts` — Astro + integrations config
- `src/content.config.ts` — collection schemas
- `src/layouts/BaseLayout.astro` — main layout with SEO + ViewTransitions
- `src/styles/global.css` — Tailwind 4 + token integration
- `src/middleware.ts` — auth session injection
