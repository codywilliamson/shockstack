# Design Tokens

ShockStack uses `@google/design.md` as the single source of truth for design tokens. The tokens are extracted into the W3C DTCG format and fed into Style Dictionary, which then outputs our Tailwind 4 CSS variables.

## Using `DESIGN.md`

All aesthetic values (colors, spacing, radii, typography) are defined centrally in `docs/system/DESIGN.md` in the YAML frontmatter section.

By maintaining tokens in `DESIGN.md`, AI agents have persistent, structured context, guaranteeing they use the project's exact aesthetic system rather than hardcoding arbitrary HEX values into individual components.

## Build Outputs

- CSS variables for runtime theming
- JavaScript and TypeScript exports for code usage
- JSON outputs for tooling and integrations

## Customization

Update your token source file at `docs/system/DESIGN.md`, run `pnpm --filter @shockstack/tokens build`, and consume the regenerated CSS variables in the frontend!

## Theme Switching

Themes are switched using the `data-theme` attribute on the root document element.
