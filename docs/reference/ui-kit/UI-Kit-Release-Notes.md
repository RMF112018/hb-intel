# UI Kit Release Notes — v2.2.0 (Production-Ready)

> **Doc Classification:** Living Reference — WS1-T13 release notes for `@hbc/ui-kit` v2.2.0, the production-ready version following WS1 UI Kit Production Scrub.

**Release Date:** 2026-03-16
**Previous Version:** 2.1.0
**Workstream:** WS1 — UI Kit Production Scrub (T01–T13, 13 tasks across 6 phases)

---

## Summary

`@hbc/ui-kit` v2.2.0 is the production-ready release following the WS1 UI Kit Production Scrub. This workstream performed a comprehensive audit and refinement of the entire design system — from token-level visual language through page-level composition — to achieve Wave 1 readiness for HB Intel.

---

## Major Improvements

### Visual Language Normalization (T03)
- **Border-radius tokens:** New intent-based 6-stop radii scale (`HBC_RADIUS_NONE` through `HBC_RADIUS_FULL`). All 27+ production components migrated from hardcoded pixel values.
- **Interactive state tokens:** `HBC_ACCENT_ORANGE_HOVER`, `HBC_ACCENT_ORANGE_PRESSED`, `HBC_DANGER_HOVER`, `HBC_DANGER_PRESSED` replace hardcoded hex values across buttons, layouts, and shell components.
- **Surface tokens extended:** `HBC_SURFACE_LIGHT` and `HBC_SURFACE_FIELD` now include `surface-active`, `destructive-bg`, `destructive-text`, `destructive-bg-hover`.
- **Surface roles:** `HBC_SURFACE_ROLES` maps 7 canonical surface roles to token combinations.

### Visual Hierarchy System (T04)
- **5-level elevation:** Added `elevationLevel4` / `elevationBlocking` for modal blocking surfaces.
- **Content levels:** `HBC_CONTENT_LEVELS` defines 12 content levels with typography, color, spacing mappings.
- **Zone distinctions:** `HBC_ZONE_DISTINCTIONS` defines 7 page zones with visual weight assignments.
- **Card weight classes:** `HbcCard` now accepts `weight` prop (`primary` | `standard` | `supporting`).
- **3-second read standard:** `HBC_THREE_SECOND_STANDARD` provides testable evaluation criteria.

### Adaptive Density & Field Readability (T05)
- **Density tokens:** `HBC_DENSITY_TOKENS` provides per-tier minimums for touch targets, font sizes, contrast, spacing.
- **Field readability constraints:** `HBC_FIELD_READABILITY` defines 8 measurable categories with standard vs field values.
- **Field interaction assumptions:** 5 documented field conditions (gloved touch, sunlight, one-handed, motion, intermittent focus).
- **Application model:** `HBC_DENSITY_APPLICATION_MODEL` documents detection, toggle, component API, persistence.

### Component Polish (T07)
- **HbcSpinner:** Added `prefers-reduced-motion` support — replaces rotation with opacity pulse.
- **HbcErrorBoundary:** Migrated from inline styles to Griffel `makeStyles` with semantic typography tokens.
- **Maturity upgrades:** HbcErrorBoundary C→B, HbcSpinner C→B. Highest-risk count reduced from 7 to 5.

### Accessibility (T09)
- **HbcBanner:** Added `aria-live` (assertive for error/warning, polite for info/success).
- **HbcConfirmDialog:** Uses `role="alertdialog"` (new `role` prop on HbcModal).
- **Reduced-motion sweep:** 12 animated components now respect `prefers-reduced-motion: reduce`.

### Test Infrastructure (T11)
- **Vitest configuration:** `vitest.config.ts` with jsdom, React plugin, V8 coverage.
- **Test scripts:** `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`.
- **9 passing tests** across theme context, theme responsiveness, and connectivity bar.

### Contribution Governance (T12)
- **6 governance rules** documented in `@hbc/ui-kit/README.md`.
- **Conformance audit:** 56 Wave 1-critical components assessed across 7 dimensions.

---

## New Exports

### Theme Constants
- `HBC_ACCENT_ORANGE_HOVER`, `HBC_ACCENT_ORANGE_PRESSED`, `HBC_DANGER_HOVER`, `HBC_DANGER_PRESSED`
- `HBC_SURFACE_ROLES`
- `HBC_RADIUS_NONE`, `HBC_RADIUS_SM`, `HBC_RADIUS_MD`, `HBC_RADIUS_LG`, `HBC_RADIUS_XL`, `HBC_RADIUS_FULL`, `hbcRadii`
- `elevationLevel4`, `elevationBlocking`, `elevationFieldLevel4`
- `HBC_CONTENT_LEVELS`, `HBC_ZONE_DISTINCTIONS`, `HBC_CARD_WEIGHTS`, `HBC_THREE_SECOND_STANDARD`
- `HBC_DENSITY_TOKENS`, `HBC_FIELD_READABILITY`, `HBC_FIELD_INTERACTION_ASSUMPTIONS`, `HBC_DENSITY_APPLICATION_MODEL`, `DENSITY_MODE_LABELS`

### New Types
- `HbcRadiusKey`, `ContentLevel`, `ContentLevelSpec`, `PageZone`, `ZoneSpec`, `CardWeight`, `CardWeightSpec`, `ThreeSecondStandard`
- `DensityTokenSet`, `DensityModeLabel`, `FieldReadabilityCategory`, `FieldReadabilityConstraint`, `FieldInteractionAssumption`, `DensityApplicationModel`

### Composition & Layout Primitives (v2.2.84–v2.2.85)
- `MultiColumnLayout` — Responsive CSS grid with configurable left/center/right columns and bottom region. Collapsible rails, breakpoint-driven region hiding.
- `HbcNavRail` — Generic collapsible vertical navigation rail with status indicators (8 states), labels, count badges, and icon-only collapse mode.
- `HbcContextRail` — Right-side context panel rail with titled card sections, item count badges, density-aware spacing, maxItems truncation, and empty-section messages.
- `HbcActivityStrip` — Collapsible horizontal timeline strip with typed entries, configurable type labels/colors, and collapsed-by-default summary badge.
- `HbcQuickActionBar` — Persistent touch-safe action toolbar with availability states and unavailable labels.
- `HbcSyncStatusBar` — Sync state indicator bar with state dot, pending/failed counts, and last-sync timestamp.

### New Multi-Column Types
- `MultiColumnRegionId`, `MultiColumnRegionConfig`, `MultiColumnLayoutConfig`, `MultiColumnLayoutProps`
- `NavRailItem`, `NavRailItemStatus`, `HbcNavRailProps`
- `ContextRailItem`, `ContextRailSection`, `HbcContextRailProps`
- `ActivityStripEntry`, `HbcActivityStripProps`
- `QuickAction`, `HbcQuickActionBarProps`
- `SyncState`, `HbcSyncStatusBarProps`

### New Files
- `packages/ui-kit/src/layouts/multi-column-types.ts` — generic multi-column type contracts
- `packages/ui-kit/src/layouts/MultiColumnLayout.tsx` — responsive multi-column grid
- `packages/ui-kit/src/HbcNavRail/` — nav rail component + stories + tests
- `packages/ui-kit/src/HbcContextRail/` — context rail component + stories + tests
- `packages/ui-kit/src/HbcActivityStrip/` — activity strip component + stories + tests
- `packages/ui-kit/src/HbcQuickActionBar/` — quick action bar component + stories + tests
- `packages/ui-kit/src/HbcSyncStatusBar/` — sync status bar component + stories + tests
- `packages/ui-kit/src/theme/radii.ts` — border-radius token scale
- `packages/ui-kit/src/theme/hierarchy.ts` — visual hierarchy constants
- `packages/ui-kit/vitest.config.ts` — test configuration

### Component Changes
- `HbcCard`: New `weight` prop (`'primary'` | `'standard'` | `'supporting'`)
- `HbcModal`: New `role` prop (`'dialog'` | `'alertdialog'`)

---

## Breaking Changes

None. All changes are additive and backward-compatible:
- Existing token names/values unchanged
- Existing component props unchanged (new props are optional with defaults matching prior behavior)
- No exports removed or renamed

---

## Reference Documents Produced

| Document | Task |
|----------|------|
| `UI-Kit-Component-Maturity-Matrix.md` | T01 |
| `UI-Kit-Mold-Breaker-Principles.md` | T02 |
| `UI-Kit-Competitive-Benchmark-Matrix.md` | T02 |
| `UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` | T04, T08 |
| `UI-Kit-Field-Readability-Standards.md` | T05 |
| `UI-Kit-Adaptive-Data-Surface-Patterns.md` | T06 |
| `UI-Kit-Composition-Review.md` | T08 |
| `UI-Kit-Wave1-Page-Patterns.md` | T08 |
| `UI-Kit-Accessibility-Findings.md` | T09 |
| `UI-Kit-Usage-and-Composition-Guide.md` | T10 |
| `UI-Kit-Visual-Language-Guide.md` | T10 |
| `UI-Kit-Verification-Coverage-Plan.md` | T11 |
| `UI-Kit-Application-Standards-Conformance-Report.md` | T12 |
| `UI-Kit-Production-Readiness-Scorecard.md` | T13 |
| `UI-Kit-Release-Notes.md` | T13 |
| `UI-Kit-Residual-Debt-Register.md` | T13 |

---

## Wave 1 Compatibility

Confirmed. All Wave 1 page patterns (Personal Work Hub, Project Hub, dashboards, work queues, forms, detail pages) can be assembled using only `@hbc/ui-kit` primitives without visual patching.

---

*Release Notes v1.0 — @hbc/ui-kit v2.2.0 (2026-03-16)*
