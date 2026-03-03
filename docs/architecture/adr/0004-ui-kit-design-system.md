# ADR-0004: UI Kit Design System — Fluent v9 + Griffel + Lazy ECharts

**Status:** Accepted
**Date:** 2026-03-03
**Blueprint Reference:** §1d — ui-kit (Enhanced – Critical for Leadership Pitch & Brand Recognition)
**Foundation Plan Reference:** Phase 2, step 2.6

## Context

HB Intel requires a shared component library that implements a distinctive, instantly recognizable design system. The platform must stand out as a premium construction-technology application during leadership presentations and walk-by displays. Components are consumed by the PWA, 11 SPFx webparts, and HB Site Control.

## Decision

### Component Framework: Fluent UI v9 + Griffel

- **Fluent UI v9** (`@fluentui/react-components`) as the base component library
- **Griffel** (`@griffel/react`) for atomic CSS-in-JS styling with `makeStyles`
- All components consume theme tokens via Fluent's token system — no hardcoded colors
- `data-hbc-ui="*"` attributes on root elements as styling hooks

**Rationale:** Fluent v9 provides SharePoint/M365 visual consistency while Griffel enables zero-runtime-cost theming with atomic CSS extraction. This combination supports both PWA and SPFx deployment modes with a single codebase.

### Brand Color Derivation

- **HB Blue Primary:** `#004B87` — extracted from HB Construction logo background
- **HB Orange Accent:** `#F37021` — extracted from the highlighted square logo element
- **BrandVariants ramp:** 16 shades (10→160) generated via HSL lightness interpolation from `#004B87`
- Semantic tokens extend Fluent's `Theme` type with `HbcSemanticTokens` for status colors and surface variants

### Virtualized DataTable (@tanstack/react-table + @tanstack/react-virtual)

- `useReactTable` for table state management (sorting, pagination, row selection)
- `useVirtualizer` for 10,000+ row performance with virtualized rendering
- Semantic `<table>/<thead>/<tbody>` elements for WCAG 2.2 AA screen reader support
- Sticky header via CSS `position: sticky`

**Rationale:** Construction project data (buyout logs, compliance entries, schedule activities) routinely exceeds 1,000 rows. Virtualization ensures smooth scrolling at 60fps without DOM bloat.

### Lazy-Loaded ECharts

- `EChartsRenderer.tsx` is a separate file imported via `React.lazy(() => import(...))`
- `tsc` emits the dynamic import as-is; consuming app's bundler (Vite) handles code splitting
- ECharts (~800KB) only loaded when a chart first renders
- HB Intel color palette registered as custom ECharts theme inside `EChartsRenderer`

**Rationale:** Not all views contain charts. Lazy loading prevents the 800KB ECharts bundle from penalizing initial page load for table-heavy views like Buyout Schedule and Compliance.

### Storybook 8 for Visual/A11y Testing

- `@storybook/react-vite` for fast HMR during component development
- `@storybook/addon-a11y` included per Blueprint §4e (WCAG 2.2 AA)
- Config bootstrapped in Phase 2.6; individual `.stories.tsx` files written in Phase 3 (dev-harness)

## Consequences

- All UI development uses Griffel `makeStyles` — no raw CSS, inline styles, or CSS modules
- Theme changes propagate automatically through Fluent's `FluentProvider`
- ECharts is tree-shaken per chart type (only bar/line/pie/scatter registered by default)
- Storybook serves as the living style guide and accessibility audit tool
- `@hbc/shell` components (Phase 2.5) use `data-hbc-shell="*"` attributes — shell↔ui-kit visual integration happens in Phase 3

## Alternatives Considered

1. **Chakra UI / Radix UI** — rejected because Fluent v9 provides native SharePoint/M365 consistency
2. **Tailwind CSS** — rejected because Griffel provides type-safe token consumption and atomic CSS without a separate build step
3. **D3.js for charts** — rejected because ECharts provides declarative API with built-in interactivity, reducing chart code by ~70%
4. **CSS Modules** — rejected because Griffel's atomic CSS approach provides better runtime performance and theme token integration
