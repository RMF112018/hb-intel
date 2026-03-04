# ADR-0016: UI Design System Foundation (V2.1)

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.3 — Design System Foundation
**References:** Blueprint §1d, PH4.3-UI-Design-Plan.md §3, PH4-UI-Design-Plan.md §3

## Context

The HB Intel platform is used by field personnel on construction jobsites where sunlight glare, outdoor conditions, and varying device sizes create unique UX challenges. The Phase 2.6 baseline design tokens used standard web colors (Fluent UI defaults) that lack sufficient contrast for outdoor use. Field users reported difficulty distinguishing status indicators under bright sunlight, and the generic dark theme provided no meaningful advantage for jobsite conditions.

Additionally, the typography scale used size-based naming (`displayHero`, `bodyLarge`) which did not convey intent, making it difficult for developers to choose the correct level without consulting documentation.

## Decision

We adopt the V2.1 Design System Foundation with the following key changes:

### 1. Sunlight-Optimized Status Colors
Replace standard web status colors with high-contrast, sunlight-optimized values:
- Success: `#00C896` (vibrant teal-green, visible in direct sunlight)
- Warning: `#FFB020` (bright amber)
- Error: `#FF4D4D` (bright red, distinct from orange CTA)
- Info: `#3B9FFF` (sky blue, separable from brand blue)
- Neutral: `#8B95A5` (warm gray)

Each status includes a 5-step HSL ramp (10/30/50/70/90) for background fills, borders, and text use.

### 2. Intent-Based Typography
Rename from size-based to intent-based naming:
- `display` (was `displayHero`) — 2rem/700
- `heading1`-`heading4` (was `displayLarge`..`titleMedium`)
- `body`, `bodySmall`, `label`, `code`

Old names are preserved as deprecated aliases for migration.

### 3. Field Mode Theme
Replace the generic dark theme with a purpose-built Field Mode theme featuring:
- Navy/slate surface palette (`#0F1419`, `#1A2332`, `#243040`)
- High-contrast text (`#E8EAED` on dark surfaces)
- Same sunlight-optimized status colors (high contrast on both light and dark)

### 4. Three-Weight Icon Library
60+ stroke-based SVG icons with three weights (light 1.5/regular 2/bold 2.5) and three sizes (16/20/24px), organized into 6 domain categories: Construction, Navigation, Action, Status, Connectivity, Layout.

### 5. Grid & Spacing System
4px base unit spacing scale, responsive breakpoints (mobile/tablet/desktop/wide), and 12-column grid configuration.

## Consequences

- **Positive:** Field users gain measurably better visibility of status indicators. Intent-based typography reduces developer decision fatigue. Field Mode enables true outdoor usability.
- **Positive:** HSL ramps enable consistent derived colors for backgrounds, borders, and hover states.
- **Negative:** Existing hardcoded hex values in components (HbcErrorBoundary, HbcChart) will need migration to token references in a follow-up pass.
- **Migration:** Deprecated aliases ensure zero breaking changes for current internal consumers.

## Alternatives Considered

1. **Keep Fluent defaults** — rejected due to insufficient outdoor contrast.
2. **Material Design color system** — rejected to maintain Fluent UI alignment and avoid mixed design language.
3. **CSS custom properties only** — rejected because TypeScript token objects enable compile-time checking and IDE autocomplete.
