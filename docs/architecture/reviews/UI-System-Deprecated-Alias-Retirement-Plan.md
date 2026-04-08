# UI System Deprecated Alias Retirement Plan

**Date:** 2026-04-08
**Closes:** Deprecated alias retirement planning gap identified in `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`
**Status:** Executed — all aliases retired

---

## Executive Summary

14 deprecated aliases (9 typography + 5 elevation) were identified in the audit validation report as deferred cleanup debt. A consumer impact scan revealed that all 9 typography aliases had **zero consumers** and the 5 elevation aliases had only **8 internal consumers** (all within `@hbc/ui-kit`). All aliases have been retired in this prompt: consumers migrated to canonical names and alias definitions/exports removed.

---

## Alias Inventory

### Typography Aliases — 9 total, 0 consumers (REMOVED)

| Deprecated Alias | Canonical Replacement | Live Consumers | Risk | Action |
|---|---|---|---|---|
| `displayHero` | `display` | 0 | Zero-risk | Removed |
| `displayLarge` | `heading1` | 0 | Zero-risk | Removed |
| `displayMedium` | `heading2` | 0 | Zero-risk | Removed |
| `titleLarge` | `heading3` | 0 | Zero-risk | Removed |
| `titleMedium` | `heading4` | 0 | Zero-risk | Removed |
| `bodyLarge` | `body` | 0 | Zero-risk | Removed |
| `bodyMedium` | `bodySmall` | 0 | Zero-risk | Removed |
| `caption` | `label` | 0 | Zero-risk | Removed |
| `monospace` | `code` | 0 | Zero-risk | Removed |

### Elevation Aliases — 5 total, 8 consumers (MIGRATED AND REMOVED)

| Deprecated Alias | Canonical Replacement | Live Consumers | Risk | Action |
|---|---|---|---|---|
| `elevationRest` | `elevationLevel1` | 2 | Low | Migrated, removed |
| `elevationHover` | `elevationLevel1` | 0 | Zero-risk | Removed |
| `elevationRaised` | `elevationLevel2` | 6 | Low | Migrated, removed |
| `elevationOverlay` | `elevationLevel2` | 0 | Zero-risk | Removed |
| `elevationDialog` | `elevationLevel3` | 0 | Zero-risk | Removed |

---

## Consumer Impact Map

All consumers were internal to `@hbc/ui-kit`. No consumers existed in `apps/`, feature packages, or other workspace packages.

### elevationRest → elevationLevel1 (2 consumers)

| File | Usage | Lane |
|------|-------|------|
| `packages/ui-kit/src/HbcDataTable/index.tsx` | `boxShadow` on wrapper | Productive |
| `packages/ui-kit/src/layouts/ToolLandingLayout.tsx` | `boxShadow` on KPI card | Productive |

### elevationRaised → elevationLevel2 (6 consumers)

| File | Usage | Lane |
|------|-------|------|
| `packages/ui-kit/src/HbcCommandBar/index.tsx` | `boxShadow` on root | Productive |
| `packages/ui-kit/src/layouts/ListLayout.tsx` | `boxShadow` on filter panel | Productive |
| `packages/ui-kit/src/HbcForm/HbcStickyFormFooter.tsx` | `boxShadow` on root | Productive |
| `packages/ui-kit/src/HbcForm/HbcForm.tsx` | `boxShadow` on form surface | Productive |
| `packages/ui-kit/src/layouts/CreateUpdateLayout.tsx` | `boxShadow` on form + footer | Productive |
| `packages/ui-kit/src/WorkspacePageShell/index.tsx` | `boxShadow` on header band + FAB | Productive |

---

## Changes Made

### Definitions removed
- `packages/ui-kit/src/theme/typography.ts` — removed 9 deprecated alias exports and deprecated entries from `hbcTypeScale`
- `packages/ui-kit/src/theme/elevation.ts` — removed 5 deprecated alias exports and deprecated entries from `hbcElevation`

### Barrel exports removed
- `packages/ui-kit/src/theme/index.ts` — removed 9 typography + 5 elevation alias re-exports
- `packages/ui-kit/src/index.ts` — removed 9 typography + 5 elevation alias re-exports

### Consumers migrated (8 files)
- `HbcDataTable/index.tsx` — `elevationRest` → `elevationLevel1`
- `layouts/ToolLandingLayout.tsx` — `elevationRest` → `elevationLevel1`
- `HbcCommandBar/index.tsx` — `elevationRaised` → `elevationLevel2`
- `layouts/ListLayout.tsx` — `elevationRaised` → `elevationLevel2`
- `HbcForm/HbcStickyFormFooter.tsx` — `elevationRaised` → `elevationLevel2`
- `HbcForm/HbcForm.tsx` — `elevationRaised` → `elevationLevel2`
- `layouts/CreateUpdateLayout.tsx` — `elevationRaised` → `elevationLevel2`
- `WorkspacePageShell/index.tsx` — `elevationRaised` → `elevationLevel2`

### Test updated
- `packages/ui-kit/src/theme/__tests__/typography.test.ts` — removed deprecated alias mapping test, updated key count

---

## Verification

- `tsc --noEmit` (ui-kit): **Pass**
- `tsc --project tsconfig.json` (ui-kit build): **Pass**
- `tsc --noEmit` (hb-webparts downstream): **Pass**
- Typography tests: **3/3 pass**
- Elevation tests: **4/4 pass**
- All values unchanged (aliases were already pointing to the same objects)

---

## Remaining Debt

**None.** All 14 deprecated aliases have been fully retired. No compatibility shims remain. The canonical intent-based typography scale and level-based elevation scale are now the only public API.
