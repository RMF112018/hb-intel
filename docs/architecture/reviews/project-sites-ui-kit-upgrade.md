# Project Sites UI Kit Upgrade & Light-Mode Enforcement

> **Date**: 2026-03-30
> **Scope**: Full UI maturity upgrade — theme provider, light-mode enforcement, governed primitive migration, composition refinement
> **Surface**: Project Sites SPFx webpart (`apps/project-sites`, `packages/spfx/src/webparts/projectSites/`)

---

## 1. Problem Statement

The Project Sites webpart rendered correctly but bypassed the repo's established theming infrastructure:

1. **No `HbcThemeProvider`** — mount.tsx rendered `ProjectSitesRoot` without `HbcThemeProvider` or `FluentProvider`. This meant no theme context for Fluent-based ui-kit components, and OS dark mode could not be intercepted.
2. **Hardcoded light-mode tokens** — Components used `HBC_SURFACE_LIGHT['...']` direct object access for all colors, bypassing the semantic token system.
3. **Inline SVG icons** — Three inline SVG icon components (SearchIcon, AlertIcon, ArrowIcon) duplicated icons available in `@hbc/ui-kit/icons`.
4. **Local stage badges** — Hardcoded green/amber/gray badge colors for Active/Pursuit/default stages instead of using `HbcStatusBadge`.
5. **Hardcoded typography** — Font family, sizes, and weights specified as raw CSS values rather than referencing the design system type scale.

## 2. Changes Made

### 2.1 HbcThemeProvider Wiring (Step 1)

**File**: `apps/project-sites/src/mount.tsx`

Wrapped the component tree with `HbcThemeProvider` using `forceTheme='light'`, matching the pattern established in `apps/estimating/src/App.tsx:39-42`. This provides `FluentProvider` + light theme tokens to the entire tree while preventing OS dark mode from creating visual incoherence in the SharePoint light chrome.

### 2.2 New ui-kit Icons (Step 2)

**File**: `packages/ui-kit/src/icons/index.tsx`

Added two new icons to the "GENERAL" category using the existing `createIcon` factory:
- **`AlertTriangle`** — warning/error triangle icon for empty state and error displays
- **`ExternalLink`** — arrow-up-right icon for external link indicators

### 2.3 HbcStatusBadge Migration (Step 3)

**File**: `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

Replaced local stage badge styling (hardcoded `#065F46`/`#D1FAE5` for active, `#92400E`/`#FEF3C7` for pursuit) with `HbcStatusBadge`:
- `active` → `onTrack` variant (green, dual-channel with icon)
- `pursuit` → `warning` variant (amber, dual-channel with icon)
- default → `neutral` variant

This gains dual-channel accessibility (color + shape icon) and high-contrast mode support. The project number badge was intentionally kept as-is (it's an identifier, not a status).

### 2.4 Icon Migration (Step 4)

**Files**: `ProjectSitesRoot.tsx`, `ProjectSiteCard.tsx`

- Replaced inline `SearchIcon` (48px SVG) with `Search` from `@hbc/ui-kit/icons`
- Replaced inline `AlertIcon` (48px SVG) with `AlertTriangle` from `@hbc/ui-kit/icons`
- Replaced inline `ArrowIcon` (14px SVG) with `ExternalLink` from `@hbc/ui-kit/icons`

### 2.5 Typography Token Adoption (Step 5)

**Files**: `ProjectSitesRoot.tsx`, `ProjectSiteCard.tsx`, `YearSelector.tsx`

Replaced hardcoded font values with design system typography token references:
- Page title → `heading2` tokens (1.25rem, weight 700)
- Count label → `bodySmall` tokens
- Project name → `heading3` tokens (1rem, weight 600)
- Meta labels → `label` tokens (0.75rem, weight 500)
- Meta values → `body` tokens (0.875rem)
- Year selector label → `label` tokens (weight 600 override for emphasis)
- Removed hardcoded `fontFamily` from root style (FluentProvider cascades font-family)

### 2.6 Vite Alias Configuration

**File**: `apps/project-sites/vite.config.ts`

Added `@hbc/ui-kit/icons` and `@hbc/ui-kit/theme` subpath aliases before the parent `@hbc/ui-kit` alias, matching the pattern in `tools/vitest-webpart.config.ts`.

**File**: `vitest.workspace.ts`

Added the same subpath aliases to the `@hbc/spfx` workspace entry to fix test resolution.

### 2.7 Light-Mode Enforcement (Prompt 2)

Three-layer light-mode governance, each reinforcing the others:

1. **Mount boundary** (`apps/project-sites/src/mount.tsx`): `HbcThemeProvider` with `forceTheme='light'` wraps the entire component tree. This is the primary enforcement — it provides `FluentProvider` with `hbcLightTheme` regardless of OS dark-mode preference. Matches the pattern established by the Estimating SPFx app.

2. **Compile-time tokens**: All Griffel `makeStyles` calls reference `HBC_SURFACE_LIGHT` for colors and design system typography tokens. These resolve to static light-mode values at build time, providing defense-in-depth that cannot be overridden by runtime theme changes.

3. **SPFx manifest** (`ProjectSitesWebPart.manifest.json`): Set `supportsThemeVariants: false` in both manifest copies. This prevents SharePoint from injecting section theme variants (dark section backgrounds) into the webpart DOM, eliminating host-level theme interference.

**Additional token cleanup:**
- Replaced hardcoded `#FF4D4D` in error alert icon with `HBC_STATUS_COLORS.error`
- Replaced hardcoded `#E8F1F8` in project number badge with `hbcBrandRamp[150]`

**Accessibility in enforced light posture:**
- Focus styles: `HBC_PRIMARY_BLUE` 2px outline with 2px offset on card wrappers — passes WCAG 2.2 AA (3:1 focus indicator contrast on white)
- Hover states: `elevationLevel2` shadow + `translateY(-2px)` — visible affordance with `prefers-reduced-motion` respected
- Disabled states: 0.6 opacity with hover effects suppressed — meets 3:1 non-text contrast
- HbcStatusBadge: dual-channel (color + shape icon) badges meet WCAG without relying on color alone
- HbcButton (YearSelector): primary/secondary variants both pass 4.5:1 text contrast in light theme

## 3. Governed Composition Migration (Prompt 4)

### 3.1 YearSelector → HbcSegmentedControl

Deleted `YearSelector.tsx` (105 lines) and replaced with `HbcSegmentedControl` from `@hbc/ui-kit`. The year options are built from the API result using `useMemo` and passed directly to the control. This eliminates 60+ lines of manual keyboard navigation and ARIA radiogroup wiring that are now encapsulated in the shared primitive.

### 3.2 Metadata Grid → HbcDescriptionList

Replaced the manual `metaGrid` / `metaLabel` / `metaValue` Griffel styles in `ProjectSiteCard` with `HbcDescriptionList` (dense mode). Metadata items are built via `useMemo` from the entry fields. This gains semantic `<dl>`/`<dt>`/`<dd>` HTML structure (better screen reader associations) and removes 20+ lines of local grid styling.

### 3.3 Header System Refinement

Upgraded the header from a flat flexbox with spacer to a deliberate two-zone layout:
- **Left zone**: Page title promoted to `heading1` typography (from heading2) for stronger hierarchy
- **Right zone**: `headerTrailing` flex container groups year selector and result count as a unified control cluster

Result count now renders as a subtle badge (surface-2 background with border-radius) rather than plain muted text, giving it visual weight proportional to its informational value.

### 3.4 Sparse-Results Grid Behavior

Added `gridSparse` class that activates when 1-2 results exist. On screens ≥768px it constrains card max-width to 380px via `repeat(auto-fill, minmax(320px, 380px))`, preventing cards from stretching the full page width and looking unfinished.

### 3.5 Provisioning State Refinement

Replaced the plain italic "Provisioning..." text with a more intentional treatment:
- Animated pulse dot (6px circle with 1.5s breathing animation, respects `prefers-reduced-motion`)
- "Provisioning" label with label-weight font alongside the dot
- Reduced wrapper opacity from 0.6 → 0.55 for slightly clearer disabled contrast

### 3.6 Card Composition Polish

- Project number badge: tighter padding (2px vertical), tabular-nums for numeric alignment
- Footer action: `bodySmall` sizing for proportional scaling with card density
- Department label: `bodySmall` + label weight for consistent secondary text treatment
- Gap values aligned to 8px grid throughout

## 4. Deferred Items

- **Shimmer/skeleton primitive** — 10-line pulse animation, self-contained, not worth elevating
- **Card-as-link enhancement** — Current `<a>` wrapper with hover/focus effects is straightforward

## 5. Verification (Final — after Prompt 4)

| Check | Result |
|-------|--------|
| `@hbc/ui-kit check-types` | Pass |
| `@hbc/ui-kit build` | Pass |
| `@hbc/spfx check-types` | Pass |
| `@hbc/spfx lint` | Pass (0 errors, 0 warnings) |
| `@hbc/spfx test (projectSites)` | 61/61 pass (6 files) |
| `@hbc/spfx-project-sites build` | Pass (481.92 KB, gzip 141.61 KB) |

## 6. Files Changed (Cumulative)

| File | Change |
|------|--------|
| `apps/project-sites/src/mount.tsx` | HbcThemeProvider with forceTheme='light' |
| `apps/project-sites/vite.config.ts` | @hbc/ui-kit subpath aliases |
| `apps/project-sites/package.json` | Version 0.0.1 → 0.0.4 |
| `packages/ui-kit/src/icons/index.tsx` | AlertTriangle, ExternalLink icons |
| `packages/ui-kit/src/HbcSegmentedControl/` | New governed pill-group selector |
| `packages/ui-kit/src/HbcDescriptionList/` | New semantic key/value metadata list |
| `packages/ui-kit/src/index.ts` | Barrel exports for new components |
| `packages/ui-kit/package.json` | Version 2.2.87 → 2.2.88 |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | HbcSegmentedControl, refined header, sparse grid, token migration |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | HbcDescriptionList, HbcStatusBadge, refined provisioning state |
| `packages/spfx/src/webparts/projectSites/components/YearSelector.tsx` | **Deleted** (replaced by HbcSegmentedControl) |
| `packages/spfx/src/webparts/projectSites/components/YearSelector.test.tsx` | **Deleted** (component removed) |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | supportsThemeVariants: false |
| `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | supportsThemeVariants: false |
| `vitest.workspace.ts` | @hbc/ui-kit subpath aliases for @hbc/spfx |
| `docs/reference/ui-kit/HbcSegmentedControl.md` | Component reference documentation |
| `docs/reference/ui-kit/HbcDescriptionList.md` | Component reference documentation |

## 7. Governance References

- **ADR-0116**: UI Doctrine and Visual Governance — theme/token compliance
- **ADR-0040**: Theme and Token Enforcement — enforced via `@hbc/ui-kit` imports
- **ADR-0067**: SPFx Boundary and Hosting Integration — host theme signals
- **Estimating precedent**: `docs/architecture/reviews/estimating-spfx-light-theme-ui-remediation.md`
