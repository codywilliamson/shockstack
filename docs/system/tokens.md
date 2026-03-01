# Design Tokens

Style Dictionary v4 generates multi-format outputs from JSON source tokens.

## Token Files

- `packages/tokens/tokens/base.json` — spacing, typography, radii, shadows, z-index
- `packages/tokens/tokens/dracula.json` — dark theme colors (Dracula)
- `packages/tokens/tokens/light.json` — light theme colors (Alucard)
- `packages/tokens/tokens/custom.json` — user overrides (empty by default)

## Build Outputs

- `dist/tokens.css` — CSS custom properties (dark + light selectors)
- `dist/tailwind.tokens.js` — Tailwind theme extension
- `dist/tokens.js` + `tokens.d.ts` — TypeScript constants
- `dist/tokens.json` — JSON manifest

## Customization

Edit `custom.json` → `pnpm tokens:build` → all outputs regenerate.

## Theme Switching

`[data-theme="dark"]` / `[data-theme="light"]` on `<html>`. Default: system preference, persisted to localStorage.
