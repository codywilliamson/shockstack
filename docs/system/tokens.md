# Design Tokens

Design tokens are defined once and compiled into formats used by the frontend build and runtime styling.

## Token Model

- Base tokens: spacing, typography, radii, shadows, and shared primitives
- Theme tokens: dark and light palettes mapped to semantic names
- Custom overrides: project-specific additions layered on top

## Build Outputs

- CSS variables for runtime theming
- JavaScript and TypeScript exports for code usage
- JSON outputs for tooling and integrations

## Customization

Update token source files, run `pnpm tokens:build`, and consume the regenerated outputs in the frontend.

## Theme Switching

Themes are switched using the `data-theme` attribute on the root document element.
