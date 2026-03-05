# ADR-0016: UI Design System Foundation

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.3
**Deciders:** HB Intel Engineering Team

## Context

Phase 4.3 established the foundational design token system for the HB Intel Design System. The project required a comprehensive token architecture supporting dual themes (light + Field Mode), construction-industry-specific color choices, and enforcement tooling to prevent drift.

## Decisions

### 1. Token Architecture

All visual properties are defined as TypeScript constants in `packages/ui-kit/src/theme/tokens.ts` using Fluent UI's `BrandVariants` type. The 16-shade brand ramp (`hbcBrandRamp`) derives from the HB Intel orange `#F37021`.

### 2. Dual Theme System

Two complete themes are exported:
- `hbcLightTheme` — warm off-white (`#FAFBFC`) surface, standard contrast ratios
- `hbcFieldTheme` — dark theme optimized for outdoor/sunlight readability with elevated contrast targets (7:1 AAA)

### 3. Sunlight-Optimized Status Colors

Five status colors are chosen for maximum differentiation under direct sunlight conditions:
- Success/On-Track: `#00C896` (green)
- At-Risk/Error: `#FF4D4D` (red)
- Warning/Behind: `#FFB020` (amber)
- Info: `#3B9FFF` (blue)
- Neutral/Inactive: `#8B95A5` (gray)

### 4. ESLint Token Enforcement

A custom ESLint rule (`enforce-hbc-tokens`) warns on hardcoded hex values in component files, directing developers to use design tokens from `@hbc/ui-kit/theme`.

### 5. Supporting Token Modules

Additional token modules provide complete coverage:
- `typography.ts` — 9 type intents (display, heading, subtitle, body, caption, etc.)
- `grid.ts` — responsive grid breakpoints and column configurations
- `animations.ts` — timing constants with `prefers-reduced-motion` fallbacks
- `elevation.ts` — 4-level dual-shadow scale with Field Mode variants
- `density.ts` — 3-tier density system (Comfortable, Compact, Touch)

## Alternatives Considered

- **CSS custom properties only**: Rejected because TypeScript tokens provide compile-time safety and IDE autocompletion.
- **Tailwind config tokens**: Rejected because the project uses Fluent UI's theming system, not Tailwind.

## Consequences

- All components must consume tokens from `@hbc/ui-kit/theme` — direct color values trigger ESLint warnings.
- Adding new tokens requires updating `tokens.ts` and both theme definitions.
- The dual-theme architecture adds complexity but enables Field Mode (outdoor readability) as a first-class feature.
