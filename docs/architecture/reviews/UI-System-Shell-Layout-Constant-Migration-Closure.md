# UI System Shell Layout Constant Migration — Closure Note

**Date:** 2026-04-08
**Closes:** Shell-layout constant ownership gap identified in `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`

---

## Summary

Six shell-layout constants were migrated from `packages/ui-kit/src/theme/tokens.ts` (design token layer) to `packages/ui-kit/src/HbcAppShell/constants.ts` (app-shell boundary). This corrects the ownership: shell chrome dimensions are not design tokens and belong with the app-shell components that consume them.

---

## Constants Migrated

| Constant | Value | Purpose |
|----------|-------|---------|
| `HBC_HEADER_HEIGHT` | 56 | Fixed header height (px) |
| `HBC_CONNECTIVITY_HEIGHT_ONLINE` | 2 | Connectivity bar height when online |
| `HBC_CONNECTIVITY_HEIGHT_OFFLINE` | 4 | Connectivity bar height when offline |
| `HBC_SIDEBAR_WIDTH_COLLAPSED` | 56 | Sidebar width when collapsed (icon rail) |
| `HBC_SIDEBAR_WIDTH_EXPANDED` | 240 | Sidebar width when expanded |
| `HBC_BOTTOM_NAV_HEIGHT` | 56 | Bottom navigation bar height (mobile) |

---

## Ownership Change

| Attribute | Before | After |
|-----------|--------|-------|
| **Canonical source** | `packages/ui-kit/src/theme/tokens.ts` | `packages/ui-kit/src/HbcAppShell/constants.ts` |
| **Entry point export** | Not exported from `@hbc/ui-kit/app-shell` | Exported from `@hbc/ui-kit/app-shell` |
| **Theme path** | Defined inline with `@deprecated` markers | Re-exports from `HbcAppShell/constants.ts` for compatibility |
| **Main barrel** | Re-exported through `theme/index.ts` → `index.ts` | Unchanged (compatibility chain intact) |

---

## Consumers Updated

| Consumer | File | Change |
|----------|------|--------|
| HbcAppShell | `packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx` | Import changed from `../theme/tokens.js` to `./constants.js` |
| HbcSidebar | `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx` | Shell constants split to `./constants.js`; color tokens remain from `../theme/tokens.js` |
| HbcHeader | `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx` | Shell constants split to `./constants.js`; color tokens remain from `../theme/tokens.js` |
| HbcBottomNav | `packages/ui-kit/src/HbcBottomNav/index.tsx` | `HBC_BOTTOM_NAV_HEIGHT` imported from `../HbcAppShell/constants.js` |

No external consumers (outside `packages/ui-kit`) import these constants directly.

---

## Compatibility Shims Kept

- **`theme/tokens.ts`** — re-exports all 6 constants from `HbcAppShell/constants.ts` with `@deprecated` JSDoc. Any consumer importing from the old theme path continues to work.
- **`theme/index.ts`** — re-exports from `tokens.ts` unchanged.
- **`index.ts`** (main barrel) — re-exports from `theme/index.ts` unchanged.

These shims ensure zero breaking changes for any downstream consumer regardless of import path.

---

## Verification

- `tsc --noEmit` (ui-kit): **Pass**
- `tsc --project tsconfig.json` (ui-kit build): **Pass**
- `tsc --noEmit` (hb-webparts): **Pass** — confirms downstream app still compiles
- No external consumers found in `apps/` importing these constants

---

## Remaining Transitional Debt

- The compatibility re-exports in `theme/tokens.ts`, `theme/index.ts`, and `index.ts` can be removed in a future wave when no consumers import from those paths. Currently no external consumers do, so removal could happen as part of the main barrel reduction.
