# Project Sites UI Kit Upgrade & Light-Mode Enforcement

> **Date**: 2026-03-30
> **Scope**: UI maturity upgrade — theme provider wiring, light-mode enforcement, component migration, typography token adoption
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

## 3. Deferred Items

These were reviewed and intentionally deferred as clean, single-consumer implementations:
- **Segmented control elevation** — YearSelector uses HbcButton correctly with proper ARIA radiogroup pattern
- **Shimmer/skeleton primitive** — 10-line pulse animation, self-contained
- **Metadata grid primitive** — 2-column label/value layout, too specific for one consumer
- **Card-as-link enhancement** — Current `<a>` wrapper with hover effects is straightforward

## 4. Verification (Final — after Prompt 2)

| Check | Result |
|-------|--------|
| `@hbc/ui-kit check-types` | Pass |
| `@hbc/ui-kit build` | Pass |
| `@hbc/spfx check-types` | Pass |
| `@hbc/spfx lint` | Pass |
| `@hbc/spfx test (projectSites)` | 67/67 pass (7 files) |
| `@hbc/spfx-project-sites build` | Pass (479.90 KB, gzip 141.01 KB) |

## 5. Files Changed

| File | Change |
|------|--------|
| `apps/project-sites/src/mount.tsx` | Added HbcThemeProvider wrapper with forceTheme='light' |
| `apps/project-sites/vite.config.ts` | Added @hbc/ui-kit/icons and /theme subpath aliases |
| `apps/project-sites/package.json` | Version bump 0.0.1 → 0.0.3 |
| `packages/ui-kit/src/icons/index.tsx` | Added AlertTriangle, ExternalLink icons |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | ui-kit icons, typography tokens, HBC_STATUS_COLORS.error, light-mode docstring |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | HbcStatusBadge, ExternalLink icon, typography tokens, hbcBrandRamp[150] |
| `packages/spfx/src/webparts/projectSites/components/YearSelector.tsx` | Typography tokens |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | supportsThemeVariants: false |
| `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | supportsThemeVariants: false |
| `vitest.workspace.ts` | Added @hbc/ui-kit/icons and /theme aliases to @hbc/spfx entry |

## 6. Governance References

- **ADR-0116**: UI Doctrine and Visual Governance — theme/token compliance
- **ADR-0040**: Theme and Token Enforcement — enforced via `@hbc/ui-kit` imports
- **ADR-0067**: SPFx Boundary and Hosting Integration — host theme signals
- **Estimating precedent**: `docs/architecture/reviews/estimating-spfx-light-theme-ui-remediation.md`
