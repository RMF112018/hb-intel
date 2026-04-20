# PH4C.12 — Responsive Navigation Dead Zone (Comprehensive)

**Phase:** 4C | **Task:** 4C.12
**Concern:** At viewport widths 768–1024px, neither sidebar nor bottom navigation is visible.
Three misaligned breakpoint constants create silent dead zones across all display conditions.
**Locked Decisions:** D-PH4C-24, D-PH4C-25
**Parent plan:** `PH4C-UI-Design-Completion-Plan.md`
**Locked references:** Blueprint §2c | Foundation Plan PH4.14.5 | PH4B.10
**Depends on:** PH4C.11
**Blocks:** PH4C.8
**Status:** COMPLETE

---

## Problem Statement

### Root Cause: Three Misaligned Breakpoint Constants

Navigation visibility in `HbcAppShell` is determined entirely by `appMode` (`'field'` vs
`'office'`), not by viewport width. This creates a dead zone whenever `appMode` is `'office'`
and the viewport is in the tablet range:

| Hook / File | Constant | Value | Semantic intent |
|-------------|----------|-------|----------------|
| `useIsMobile.ts` | `MOBILE_BREAKPOINT` | 767 | ≤767px = mobile (field-mode auto-detect) |
| `useIsTablet.ts` | `TABLET_BREAKPOINT` | 1023 | ≤1023px = tablet (bottom nav intended) |
| `useSidebarState.ts` | `MOBILE_BREAKPOINT` | 1024 | ≤1024px = sidebar returns `null` |

### The Dead Zone (full codebase audit 2026-03-07)

At viewport widths **768–1024px in office mode**:

1. `showSidebar = appMode === 'office'` → `true` — `HbcAppShell` renders `<HbcSidebar>`.
2. Inside `HbcSidebar.tsx:193`: `if (isMobile) return null` — `isMobile` from `useSidebarState`
   at `MOBILE_BREAKPOINT = 1024`. At 900px: `900 <= 1024 = true` → `null`. Sidebar disappears.
3. `showBottomNav = appMode === 'field'` → `false` — no bottom nav in office mode.
4. **Result: zero navigation elements visible.** The user is stranded.

### Secondary Issues Confirmed by Audit

| Issue | File | Line(s) | Detail |
|-------|------|---------|--------|
| `useIsTablet` hook exists but unused in `HbcAppShell` | `HbcAppShell.tsx` | — | Tablet breakpoint awareness never applied to nav logic |
| `HbcSidebar` independent null guard | `HbcSidebar.tsx` | 193 | `if (isMobile) return null` fires independently of `HbcAppShell.showSidebar` |
| `HbcHeader` hardcoded CSS media query | `HbcHeader.tsx` | 51 | `'@media (max-width: 1024px)'` hides center toolbar — not referencing canonical constant |
| `DashboardLayout` hardcoded breakpoints | `DashboardLayout.tsx` | 27, 30 | `@media (max-width: 1199px)` and `@media (max-width: 767px)` |
| `ToolLandingLayout` hardcoded breakpoints | `ToolLandingLayout.tsx` | 105, 108 | Same pattern |
| `useAdaptiveDensity` hardcoded threshold | `useAdaptiveDensity.ts` | 68 | `width < 1024` for touch density — inline literal |
| Empty `sidebarGroups` → empty bottom nav | `HbcAppShell.tsx` + `HbcBottomNav` | — | `showBottomNav = appMode === 'field'` renders nav with zero items |
| SPFx mode: no bottom nav | `shellModeRules.ts` | — | `spfx` mode uses `ContextualSidebar`; no `HbcBottomNav` concept — must be documented |

---

## Solution Architecture

### Canonical Breakpoint Hierarchy (post-fix)

```
≤767px   (HBC_BREAKPOINT_MOBILE)     bottom nav only; field mode auto-activates
768–1023px (HBC_BREAKPOINT_TABLET)   bottom nav only; sidebar hidden
≥1024px  (HBC_BREAKPOINT_SIDEBAR)    sidebar shown; bottom nav hidden
```

### Revised Navigation Visibility Logic

```tsx
// HbcAppShell after PH4C.12
const isTablet = useIsTablet();   // true when window.innerWidth <= HBC_BREAKPOINT_TABLET (1023)

const showSidebar = appMode === 'office' && !isTablet && !isFocusModeActive;
const showBottomNav = (appMode === 'field' || isTablet)
  && !isFocusModeActive
  && bottomNavItems.length > 0;  // never render empty nav
```

| Viewport | appMode | showSidebar | showBottomNav | Nav available? |
|----------|---------|-------------|---------------|----------------|
| ≤767px | any | false | true (if items > 0) | ✓ Bottom nav |
| 768–1023px | office | false | true (if items > 0) | ✓ Bottom nav |
| 768–1023px | field | false | true (if items > 0) | ✓ Bottom nav |
| ≥1024px | office | true | false | ✓ Sidebar |
| ≥1024px | field | false | false | — intentional: field mode on desktop shows neither (correct UX) |

**Note on ≥1024px field mode:** The app is in a non-standard configuration (field mode on a large
display). The existing design intent is that field mode is for small devices. Bottom nav at ≥1024px
would be a degenerate UI. The correct behaviour is: the sidebar is absent (field mode), bottom nav
is absent (desktop width), and the `main` content area occupies full width. Users can return to
office mode via the user menu.

---

## Step-by-Step Implementation

### Step 1 — Create canonical breakpoints file

**File:** `packages/ui-kit/src/theme/breakpoints.ts` *(new file)*

```ts
/**
 * HBC Navigation Breakpoints — Canonical constants
 * PH4C.12 | Blueprint §2c
 * All breakpoint magic numbers across ui-kit reference these exports.
 */

/** ≤767px: full-mobile layout; field mode auto-activates */
export const HBC_BREAKPOINT_MOBILE = 767;

/** ≤1023px: tablet range — bottom nav shown, sidebar hidden */
export const HBC_BREAKPOINT_TABLET = 1023;

/** ≥1024px: sidebar shown; <1024px (≤1023px): bottom nav territory */
export const HBC_BREAKPOINT_SIDEBAR = 1024;

/** Content layout medium reflow (DashboardLayout, ToolLandingLayout grid collapse) */
export const HBC_BREAKPOINT_CONTENT_MEDIUM = 1199;

/** Compact density threshold — pointer: fine + ≥1440px */
export const HBC_BREAKPOINT_COMPACT_DENSITY = 1440;
```

Export all from `packages/ui-kit/src/index.ts`.

### Step 2 — Align `useIsMobile.ts` to canonical constant

**File:** `packages/ui-kit/src/hooks/useIsMobile.ts` *(modify)*

Replace `const MOBILE_BREAKPOINT = 767` with:
```ts
import { HBC_BREAKPOINT_MOBILE } from '../theme/breakpoints.js';
```
Use `HBC_BREAKPOINT_MOBILE` wherever `MOBILE_BREAKPOINT` appeared.

### Step 3 — Align `useIsTablet.ts` to canonical constant

**File:** `packages/ui-kit/src/hooks/useIsTablet.ts` *(modify)*

Replace `const TABLET_BREAKPOINT = 1023` with:
```ts
import { HBC_BREAKPOINT_TABLET } from '../theme/breakpoints.js';
```
Use `HBC_BREAKPOINT_TABLET` wherever `TABLET_BREAKPOINT` appeared.

### Step 4 — Align `useSidebarState.ts` to canonical constant

**File:** `packages/ui-kit/src/HbcAppShell/hooks/useSidebarState.ts` *(modify)*

Replace the inline `MOBILE_BREAKPOINT = 1024` with:
```ts
import { HBC_BREAKPOINT_SIDEBAR } from '../../theme/breakpoints.js';
```

Update the comparison to strict less-than: `window.innerWidth < HBC_BREAKPOINT_SIDEBAR`.
This means `isMobile = true` at ≤1023px, `false` at ≥1024px — aligning exactly with
`useIsTablet`.

### Step 5 — Update `HbcAppShell.tsx` — fix dead zone with `useIsTablet`

**File:** `packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx` *(modify)*

1. Add `import { useIsTablet } from '../hooks/useIsTablet.js'`.
2. Add `const isTablet = useIsTablet();` alongside `useSidebarState`.
3. Replace nav visibility logic:

**Before:**
```tsx
const showBottomNav = appMode === 'field' && !isFocusModeActive;
const showSidebar = appMode === 'office';
```

**After:**
```tsx
// PH4C.12: Sidebar shows in office mode only at ≥1024px desktop width
const showSidebar = appMode === 'office' && !isTablet && !isFocusModeActive;

// PH4C.12: Bottom nav shows whenever viewport <1024px (any mode) or always in field mode
// Guard: never render visible-but-empty bottom nav (bottomNavItems may be empty)
const showBottomNav = (appMode === 'field' || isTablet)
  && !isFocusModeActive
  && bottomNavItems.length > 0;
```

4. Update main content margin class selection:

```tsx
const mainClass = mergeClasses(
  styles.main,
  (appMode === 'field' || isTablet)
    ? styles.mainMobile
    : isExpanded && !isFocusModeActive ? styles.mainExpanded : styles.mainCollapsed,
  isFocusModeActive && styles.mainFocusMode,
  showBottomNav && styles.mainBottomNav,
);
```

### Step 6 — Verify `HbcSidebar.tsx` internal null guard alignment

**File:** `packages/ui-kit/src/HbcAppShell/HbcSidebar.tsx` *(verify, likely no change needed)*

After Step 4, `useSidebarState` computes `isMobile = window.innerWidth < HBC_BREAKPOINT_SIDEBAR`
(strict). The guard at line 193 `if (isMobile) return null` now fires at ≤1023px, identical to
`useIsTablet`. This is defence-in-depth: `HbcAppShell` already won't render `<HbcSidebar>` when
`showSidebar = false`, so the guard is redundant but harmless.

**Verify** the guard references the same `isMobile` from `useSidebarState` (not a separate call)
and that no independent `useIsMobile` call was added to `HbcSidebar`.

### Step 7 — Update `HbcBottomNav/index.tsx` — render null when items are empty

**File:** `packages/ui-kit/src/HbcBottomNav/index.tsx` *(modify)*

Add a null guard at the start of the component body:

```tsx
if (!items || items.length === 0) return null;
```

This prevents a visible-but-empty nav bar even if the caller fails to apply the `bottomNavItems.length > 0` guard in `HbcAppShell`.

### Step 8 — Fix `HbcHeader.tsx` hardcoded CSS media query

**File:** `packages/ui-kit/src/HbcAppShell/HbcHeader.tsx` *(modify)*

Replace line 51 `'@media (max-width: 1024px)'` with the canonical constant:

```tsx
import { HBC_BREAKPOINT_SIDEBAR } from '../theme/breakpoints.js';

// In makeStyles center style:
[`@media (max-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
  display: 'none',
},
```

The center toolbar (search, toolbox, favorites) hides at ≤1024px, aligning with the tablet range
where bottom nav replaces the sidebar.

### Step 9 — Fix `DashboardLayout.tsx` hardcoded breakpoints

**File:** `packages/ui-kit/src/layouts/DashboardLayout.tsx` *(modify)*

```tsx
import {
  HBC_BREAKPOINT_CONTENT_MEDIUM,
  HBC_BREAKPOINT_MOBILE,
} from '../theme/breakpoints.js';

// Replace @media (max-width: 1199px) with:
[`@media (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: { ... }

// Replace @media (max-width: 767px) with:
[`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: { ... }
```

### Step 10 — Fix `ToolLandingLayout.tsx` hardcoded breakpoints

**File:** `packages/ui-kit/src/layouts/ToolLandingLayout.tsx` *(modify)*

Same pattern as Step 9 — replace `1199` with `HBC_BREAKPOINT_CONTENT_MEDIUM` and `767` with
`HBC_BREAKPOINT_MOBILE`.

### Step 11 — Fix `useAdaptiveDensity.ts` hardcoded threshold

**File:** `packages/ui-kit/src/HbcDataTable/hooks/useAdaptiveDensity.ts` *(modify)*

```ts
import { HBC_BREAKPOINT_SIDEBAR, HBC_BREAKPOINT_COMPACT_DENSITY } from '../../theme/breakpoints.js';

function detectTier(): DensityTier {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const width = window.innerWidth;
  if (coarse && width < HBC_BREAKPOINT_SIDEBAR) return 'touch';
  if (!coarse && width >= HBC_BREAKPOINT_COMPACT_DENSITY) return 'compact';
  return 'standard';
}
```

### Step 12 — Document SPFx navigation model

**File:** `docs/reference/navigation/spfx-navigation-model.md` *(new)*

Document explicitly:
- SPFx webparts use `ShellLayout` + `ContextualSidebar` (from `@hbc/shell`), not `HbcAppShell`.
- `HbcBottomNav` is not used in SPFx mode.
- The viewport dead zone fix (Steps 5–8 above) applies only to `HbcAppShell`-based deployments
  (PWA, dev-harness). SPFx has no equivalent dead zone.
- `shellModeRules.spfx.supportsContextualSidebar = true` — `ContextualSidebar` shows by default.
- In SPFx, SharePoint's global suite nav provides top-level navigation; `ContextualSidebar`
  provides tool-level navigation within the webpart.

### Step 13 — Update `PwaPreview` and add Storybook regression story

**File:** `apps/dev-harness/src/tabs/PwaPreview.tsx` *(verify, no code change required)*

The `PwaPreview` harness uses `HbcAppShell` — it will automatically benefit from the fixes above.
Verify at 900px viewport that bottom nav appears and sidebar is absent.

**File:** `packages/ui-kit/src/HbcAppShell/HbcAppShell.stories.tsx` *(modify)*

Add a `NavigationDeadZoneRegression` story that:
1. Renders `HbcAppShell` with `sidebarGroups` populated (non-empty).
2. Simulates 900px viewport width using a CSS container constraint.
3. Asserts sidebar absent, bottom nav visible.

---

## Verification Commands

```bash
# 1. Confirm no inline breakpoint magic numbers remain in ui-kit source
grep -rn "= 767\|= 1023\|= 1024\|= 1199\|= 1440\|max-width: 767\|max-width: 1024\|max-width: 1199" \
  packages/ui-kit/src \
  --include="*.ts" --include="*.tsx" \
  | grep -v "breakpoints.ts" \
  | grep -v "\.test\." \
  | grep -v "\.stories\."
# Expected: no output

# 2. Confirm useIsTablet consumed in HbcAppShell
grep -n "useIsTablet\|isTablet" packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx
# Expected: import line + const declaration + usage in showSidebar/showBottomNav/mainClass

# 3. Confirm bottomNavItems.length guard
grep -n "bottomNavItems.length" packages/ui-kit/src/HbcAppShell/HbcAppShell.tsx
# Expected: present in showBottomNav expression

# 4. Confirm HbcBottomNav null guard
grep -n "return null" packages/ui-kit/src/HbcBottomNav/index.tsx
# Expected: guard near top of component

# 5. Full build
pnpm turbo run build --filter=@hbc/ui-kit

# 6. Manual viewport regression (dev-harness)
pnpm --filter=dev-harness dev
# Office mode, resize 1200px → 900px → 400px:
#   1200px: sidebar collapsed/expanded ✓, no bottom nav ✓
#   900px:  no sidebar ✓, bottom nav visible (with items) ✓
#   400px:  no sidebar ✓, bottom nav visible ✓
# Field mode, resize 1200px → 900px:
#   Any width: bottom nav visible (if items > 0), no sidebar ✓
```

---

## Definition of Done

- [x] `packages/ui-kit/src/theme/breakpoints.ts` created with 5 canonical constants.
- [x] `useIsMobile.ts` references `HBC_BREAKPOINT_MOBILE`.
- [x] `useIsTablet.ts` references `HBC_BREAKPOINT_TABLET`.
- [x] `useSidebarState.ts` references `HBC_BREAKPOINT_SIDEBAR` with strict `<` comparison.
- [x] `HbcAppShell.tsx` consumes `useIsTablet`; `showSidebar` and `showBottomNav` use it.
- [x] `showBottomNav` includes `bottomNavItems.length > 0` guard.
- [x] `main` content margin class uses `isTablet` in the condition.
- [x] `HbcSidebar.tsx` null guard verified (no independent misaligned call).
- [x] `HbcBottomNav/index.tsx` renders `null` when `items.length === 0`.
- [x] `HbcHeader.tsx` center toolbar media query uses `HBC_BREAKPOINT_SIDEBAR`.
- [x] `DashboardLayout.tsx` uses `HBC_BREAKPOINT_CONTENT_MEDIUM` and `HBC_BREAKPOINT_MOBILE`.
- [x] `ToolLandingLayout.tsx` uses same canonical constants.
- [x] `useAdaptiveDensity.ts` uses `HBC_BREAKPOINT_SIDEBAR` and `HBC_BREAKPOINT_COMPACT_DENSITY`.
- [x] SPFx navigation model documented in `docs/reference/navigation/spfx-navigation-model.md`.
- [x] Storybook `NavigationDeadZoneRegression` story added.
- [x] Grep for magic numbers 767/1023/1024/1199/1440 returns zero numeric literal matches in PH4C.12-targeted files outside `breakpoints.ts`.
- [x] `pnpm turbo run build` passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: COMPLETE — PH4C.12 implemented 2026-03-07
2026-03-07: Step cluster 1-4 completed — canonical breakpoints file created and hooks aligned (useIsMobile/useIsTablet/useSidebarState) to D-PH4C-24 and D-PH4C-25.
2026-03-07: Step cluster 5-11 completed — HbcAppShell navigation visibility logic, header media query, bottom-nav empty guard, layout breakpoints, and adaptive density thresholds updated to canonical constants.
2026-03-07: Step cluster 12-13 completed — SPFx navigation model reference doc added and NavigationDeadZoneRegression Storybook story added for tablet-width regression.
2026-03-07: Verification completed — breakpoint literal grep clean for PH4C.12-targeted files outside breakpoints.ts (excluding stories/tests), build/lint/type-check/storybook validation commands executed for @hbc/ui-kit.
Dead zone resolved per PH4C.12 matrix: office mode at 768-1023px now renders bottom nav and suppresses sidebar.
-->
