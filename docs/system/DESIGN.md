---
name: ShockStack
description: Convention-first Astro + Vue + Tailwind 4 + .NET 10 monorepo template.
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  accent-purple: "#8B5CF6"
  accent-red: "#EF4444"
  bg-primary: "#FFFFFF"
  bg-secondary: "#F9FAFB"
  bg-tertiary: "#F3F4F6"
  fg-primary: "#111827"
  fg-secondary: "#4B5563"
  fg-muted: "#9CA3AF"
  border-default: "#E5E7EB"
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
  body:
    fontFamily: Inter
    fontSize: 16px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
---

## Overview

ShockStack perfectly blends Astro 5, Vue 3, and Tailwind 4 to create a robust, convention-first architectural template. The design language favors a sleek, dark/light configurable UI featuring smooth CSS-only view transitions and robust Headless UI accessibility.

## Colors

Our palette maps closely to functional roles (`bg`, `fg`, `border`) allowing dark mode inversions without hassle.

- **Primary**: Used for standard interface text and high-contrast structural sections.
- **Accents**: Used exclusively for interactive flourishes like hover states or call-to-actions.

## Typography

- **Headings**: `Space Grotesk` is used to give structural UI a modern, engineered feel.
- **Body**: `Inter` handles the bulk of legible UI copy, maintaining high readability in dense data grids.

## Components

The system is highly componentized, meaning design decisions manifest primarily in the `tokens/` package but roll down into `frontend/` UI components (like Buttons, Modals, Forms) via Tailwind configurations.

## Elevation & Depth

We avoid thick, heavy drop shadows in favor of crisp 1px borders and slight background color variations (e.g., `bg-primary` to `bg-secondary` differentiation).
