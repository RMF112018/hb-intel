# Project Sites UI-Kit Compliance Closure

> W01r-P11 — Closure of the targeted compliance gaps identified in
> `docs/architecture/reviews/project-sites-ui-kit-compliance-audit.md`,
> combined with a premium productive-surface polish pass on the
> Project Sites webpart.
>
> Scope: `apps/project-sites/`, `packages/spfx/src/webparts/projectSites/`,
> `packages/ui-kit/src/app-shell.ts`, `packages/spfx/package.json`,
> `docs/reference/ui-kit/entry-points.md`, and this closure report.
>
> Lane: **productive** (unchanged). Project Sites is not a presentation-lane
> surface and this pass does not reopen that classification.

## 1. Objective

Implement the targeted remediation required to close the named compliance gaps from the Project Sites UI-kit compliance audit and elevate the webpart to a more premium productive-surface standard. Specifically: eliminate the full `@hbc/ui-kit` root-barrel dependency in the consumer code path, formalize a narrow sanctioned path for `HbcThemeProvider`, replace the fragile cross-package relative source import in the app-host mount with a clean package-oriented seam, normalize routine spacing/layout rhythm toward shared foundations where practical, and refine the surface's hierarchy, rhythm, state differentiation, and loading/empty affordances without drifting into presentation-lane decoration.

## 2. Scope

### Files created (2)

| File | Purpose |
|---|---|
| `packages/spfx/src/webparts/projectSites/index.ts` | Package-oriented barrel for the Project Sites webpart surface. Exports `ProjectSitesRoot`, `ProjectSitesWebPart`, and the named data contracts so the app host can import via `@hbc/spfx/project-sites` instead of reaching into the source tree. |
| `docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-compliance-closure.md` | This closure report. |

### Files modified (12)

| File | Change |
|---|---|
| `packages/ui-kit/src/app-shell.ts` | Re-export `HbcThemeProvider`, `HbcThemeContext`, and `HbcThemeProviderProps` from the narrow SPFx-safe `@hbc/ui-kit/app-shell` entry point. Closes Gap 3 by giving productive-lane SPFx consumers a narrow sanctioned path for the theme-context wrapper without inventing a new entry point. |
| `packages/spfx/package.json` | Add `./project-sites` subpath export resolving to `./dist/webparts/projectSites/index.{d.ts,js}`. Required so `moduleResolution: "bundler"` can resolve `@hbc/spfx/project-sites` via the package.json exports map. |
| `apps/project-sites/package.json` | Add `@hbc/spfx: "workspace:*"` as a direct workspace dependency. Required so pnpm symlinks `node_modules/@hbc/spfx` for the app host and the `./project-sites` subpath export can be resolved. |
| `apps/project-sites/tsconfig.json` | Replace the single broad `@hbc/ui-kit` path with four narrow paths (`@hbc/ui-kit/app-shell`, `@hbc/ui-kit/primitives`, `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`) so tsc cannot fall back to the root barrel. Add an explicit `@hbc/spfx/project-sites` path alias for the new barrel. The root `@hbc/ui-kit` alias is intentionally removed — Project Sites no longer has any path that would reinforce root-barrel habit. |
| `apps/project-sites/vite.config.ts` | Mirror the tsconfig changes in the Vite alias list. The alias list is rewritten as an ordered array so subpath aliases unambiguously precede parent aliases. Added explanatory comment referencing the W01r-P11 closure. |
| `apps/project-sites/src/mount.tsx` | Replace `import { HbcThemeProvider } from '@hbc/ui-kit'` with `import { HbcThemeProvider } from '@hbc/ui-kit/app-shell'`. Replace the relative source reach `from '../../../packages/spfx/src/webparts/projectSites/ProjectSitesRoot.js'` with `import { ProjectSitesRoot } from '@hbc/spfx/project-sites'`. |
| `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` | Split the single `from '@hbc/ui-kit'` import into `@hbc/ui-kit/primitives` (for `HbcEmptyState`, `HbcSegmentedControl`) and `@hbc/ui-kit/theme` (for surface/status/radii tokens, typography, elevation, spacing, motion, and `hbcMediaQuery`). Replace all routine hardcoded spacing (`'24px'`, `'32px'`, `'16px'`, `'8px'`, `'2px'`) with `HBC_SPACE_*` tokens. Replace hardcoded `'1.5s'` shimmer animation duration with `TRANSITION_SLOW`. Replace hardcoded `@media (min-width: 480px)` / `(min-width: 1200px)` with `hbcMediaQuery('tablet')` / `hbcMediaQuery('desktop')` via governed breakpoints. Premium polish: add an eyebrow ("HB Central · Projects") + title stack, consolidate the year selector and count badge into a right-aligned control cluster that wraps cleanly, replace the flat shimmer rectangle with a realistic card skeleton (eyebrow line + title line + meta line + footer row), reframe the empty/error container with a dashed border and surface-1 background, and harden Griffel border properties via `shorthands.border*()` helpers. |
| `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` | Split the `@hbc/ui-kit` import into `@hbc/ui-kit/primitives` (for `HbcCard`, `HbcStatusBadge`, `HbcDescriptionList`, `StatusVariant`, `DescriptionListItem`) and `@hbc/ui-kit/theme` (for color tokens, radii, spacing, elevation, motion, typography). Replace hardcoded spacing (`'8px'`, `'10px'`, `'4px'`, `'6px'`) with `HBC_SPACE_XS/SM`. Replace hardcoded `'1.5s'` provisioning dot animation with `TRANSITION_SLOW`. Replace `borderRadius: '3px'` (dot) with `HBC_RADIUS_FULL`. Harden Griffel border definitions via `shorthands.border()` / `shorthands.borderTop()`. Premium polish: elevate the archived state so hover restores full opacity, add a brand-tinted "Open Site" action chip (rather than a bare underlined text link), add a subtle divider rule above the metadata description list, and tighten motion transitions to `TRANSITION_FAST`. |
| `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Bump `version` from `*` to `0.1.0.0` (SPFx 4-part sequence). Establishes a tracked baseline now that the surface is compliance-closed. |
| `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Same version bump. |
| `vitest.workspace.ts` | Add `@hbc/ui-kit/app-shell` and `@hbc/ui-kit/primitives` Vite aliases to the `@hbc/spfx` test project so existing `ProjectSitesRoot`/`ProjectSiteCard` tests can resolve the new narrow imports at test time. Pre-existing `@hbc/ui-kit/theme` and `/icons` aliases left intact. |
| `docs/reference/ui-kit/entry-points.md` | Document that `@hbc/ui-kit/app-shell` now also exports `HbcThemeProvider` / `HbcThemeContext` / `HbcThemeProviderProps`, and explain the doctrinal rationale (theme context is shell-adjacent; it physically lives in `HbcAppShell/`). |

### Files deleted (0)

## 3. Remediation summary by gap

### 3.1 Gap 1 — Full ui-kit main-barrel dependency in a constrained SPFx consumer

**Status: fully closed.**

The Project Sites consumer no longer imports anything from the root `@hbc/ui-kit` barrel. Every import now resolves through one of the four narrow entry points: `@hbc/ui-kit/app-shell` (theme provider), `@hbc/ui-kit/primitives` (Layer 2 components), `@hbc/ui-kit/theme` (tokens, typography, elevation, motion, spacing, breakpoints, media-query helper), and `@hbc/ui-kit/icons` (HBC SVG icons). The root alias has also been removed from both `apps/project-sites/tsconfig.json` and `apps/project-sites/vite.config.ts` so tsc and Vite will fail fast if any future code re-introduces a root-barrel import, rather than silently falling back to the broad path.

**Code changes:**
- `apps/project-sites/src/mount.tsx` (root-barrel import replaced)
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` (split imports)
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` (split imports)

**Config changes:**
- `apps/project-sites/tsconfig.json` (narrow paths, root alias removed)
- `apps/project-sites/vite.config.ts` (narrow aliases, root alias removed)

### 3.2 Gap 2 — Primitive-layer imports are broader than necessary

**Status: fully closed.**

Every Layer 2 primitive consumed by Project Sites now imports from `@hbc/ui-kit/primitives`:

- `HbcEmptyState`, `HbcSegmentedControl` (in `ProjectSitesRoot.tsx`)
- `HbcCard`, `HbcStatusBadge`, `HbcDescriptionList`, `StatusVariant` type, `DescriptionListItem` type (in `ProjectSiteCard.tsx`)

No primitive import still routes through the root barrel. The Project Sites consumer matches the primitive-entry-point doctrine documented in `docs/reference/ui-kit/entry-points.md` and the Productive-Lane Standard.

**Code changes:**
- `ProjectSitesRoot.tsx` and `ProjectSiteCard.tsx`.

### 3.3 Gap 3 — Theme-provider narrow-entry exception is not formalized

**Status: fully closed by exporting, not by formalizing an exception.**

The chosen path was to re-export `HbcThemeProvider`, `HbcThemeContext`, and `HbcThemeProviderProps` from `@hbc/ui-kit/app-shell` rather than to formalize a main-barrel exception. This is doctrinally the most coherent choice because:

- `HbcThemeProvider` physically lives in `packages/ui-kit/src/HbcAppShell/HbcThemeContext.tsx`.
- It is consumed internally by `HbcAppShell` itself — it IS shell-adjacent.
- The `/app-shell` entry is the lean sanctioned SPFx-safe path; providing theme context is exactly what SPFx customizer bundles need at the mount boundary.
- The same re-export was already in place for `@hbc/ui-kit/homepage` (for homepage webparts that force a light theme at mount). Adding it to `/app-shell` closes the SPFx productive-lane gap without inventing a ninth entry point.

`apps/project-sites/src/mount.tsx` now imports the theme provider via the narrow path:

```tsx
import { HbcThemeProvider } from '@hbc/ui-kit/app-shell';
```

`docs/reference/ui-kit/entry-points.md` documents the rationale so future readers do not have to infer whether the presence of `HbcThemeProvider` in `/app-shell` is deliberate or accidental.

**Code / doc changes:**
- `packages/ui-kit/src/app-shell.ts` (re-export added)
- `apps/project-sites/src/mount.tsx` (new import path)
- `docs/reference/ui-kit/entry-points.md` (rationale added)

### 3.4 Gap 4 — App build config reinforces root-barrel usage

**Status: fully closed.**

`apps/project-sites/tsconfig.json` and `apps/project-sites/vite.config.ts` no longer alias the root `@hbc/ui-kit` barrel at all. In its place they define four narrow path entries pointing at the source files for `app-shell`, `primitives`, `theme`, and `icons`. The Vite alias list was also converted from an object to an ordered array so subpath aliases unambiguously precede parent aliases and so the resolver walks them deterministically. A comment in the vite config explicitly records the closure decision.

**Config changes:**
- `apps/project-sites/tsconfig.json`
- `apps/project-sites/vite.config.ts`

### 3.5 Gap 5 — Cross-package relative source import from app host into package source

**Status: fully closed.**

`apps/project-sites/src/mount.tsx` previously imported `ProjectSitesRoot` through the filesystem-relative path `'../../../packages/spfx/src/webparts/projectSites/ProjectSitesRoot.js'`. It now imports through the package-oriented seam:

```tsx
import { ProjectSitesRoot } from '@hbc/spfx/project-sites';
```

This required four coordinated changes:

1. A new `packages/spfx/src/webparts/projectSites/index.ts` barrel exporting `ProjectSitesRoot`, `ProjectSitesWebPart`, and the named data contracts.
2. A new `./project-sites` subpath entry in `packages/spfx/package.json`'s `exports` map so `moduleResolution: "bundler"` can resolve the path through the package.json exports.
3. A new `@hbc/spfx: "workspace:*"` entry in `apps/project-sites/package.json` so pnpm symlinks `node_modules/@hbc/spfx` for the app host (previously `@hbc/spfx` was not a declared workspace dependency of the Project Sites app, which is itself a prior-missing-link gap).
4. A new `@hbc/spfx/project-sites` alias in the app-host `tsconfig.json` and `vite.config.ts` so both tools resolve to the source file at build time.

The app host no longer reaches into raw sibling source paths, and the boundary is now expressed as a package-level import contract.

**Code changes:**
- `packages/spfx/src/webparts/projectSites/index.ts` (new barrel)
- `packages/spfx/package.json` (subpath export)
- `apps/project-sites/package.json` (workspace dep)
- `apps/project-sites/src/mount.tsx` (new import)
- `apps/project-sites/tsconfig.json` + `vite.config.ts` (aliases)

### 3.6 Gap 6 — Routine spacing and layout rhythm still live as consumer-local literals

**Status: fully closed for all routine values; a few intentional micro-spacing literals remain.**

`ProjectSitesRoot.tsx` and `ProjectSiteCard.tsx` now consume shared foundations for every routine spacing value:

- `HBC_SPACE_XS` (4 px) — fine gaps between icons and adjacent text, chip padding top/bottom
- `HBC_SPACE_SM` (8 px) — small gaps in header clusters, footer row, description-list divider padding
- `HBC_SPACE_MD` (16 px) — card body and shimmer padding, row-gap in wrap-cluster headers
- `HBC_SPACE_LG` (24 px) — section vertical rhythm, grid gap, empty-container horizontal padding
- `HBC_SPACE_XL` (32 px) — root bottom padding, empty-container top/bottom padding

Routine breakpoint queries (previously `@media (min-width: 480px)` / `(min-width: 1200px)`) are now generated via `hbcMediaQuery('tablet')` / `hbcMediaQuery('desktop')`, which resolve to `@media (min-width: 768px)` and `@media (min-width: 1200px)` against the governed `hbcBreakpoints` table.

Routine animation durations previously hardcoded as `'1.5s'` (shimmer + provisioning dot pulse) are now `TRANSITION_SLOW`. The card wrapper transition uses `TRANSITION_FAST`, and the grid reveal uses `TRANSITION_NORMAL` — all consumed from `@hbc/ui-kit/theme`.

Remaining literal values that were intentionally kept and are NOT a compliance debt:

- `'2px'` padding on the legacy project-number chip and the stage-badge focus outline offset — these are one-off micro-spacing values that sit below the lowest governed token (`HBC_SPACE_XS = 4`). Promoting them to a new token would be speculative abstraction.
- `'200px'` shimmer minimum height — not a spacing value; it's a layout floor intended to match a realistic card height.
- `'280px'` / `'320px'` / `'380px'` grid `minmax()` breakpoint widths — layout constants that control how many cards fit per row at each tier; not a rhythm value.
- `'1.4'`, `'1.35'`, `'1.25'` line-height values on headings — derived from the typography scale object and intentionally stay alongside the font-size they match.
- `'2px'`, `'3px'` border widths — border widths, not spacing rhythm; deliberately left as literals consistent with the rest of the ui-kit's border patterns (see sibling surfaces that use the same style).

**Code changes:**
- `ProjectSitesRoot.tsx` and `ProjectSiteCard.tsx` (spacing tokens, media queries, motion tokens, Griffel `shorthands.border*()` for border hardening).

### 3.7 Gap 7 — Prior validation does not prove latest-doctrine compliance

**Status: fully closed by this report.**

Prior Project Sites upgrade validation (`docs/architecture/reviews/spfx/project-sites/project-sites-ui-kit-upgrade.md`) proved the earlier phase of the migration — theming, light-mode enforcement, primitive migration, accessibility, packaging — but did not validate compliance against the current layered export model, the current productive-lane doctrine, or the current package-boundary expectations.

This closure report, combined with the actual remediation commits, provides that validation:

- **Shared UI ownership** — recorded in §3.1, §3.2, §3.3 above.
- **Foundation / token compliance** — recorded in §3.6 above.
- **Primitive-layer compliance** — recorded in §3.2 above.
- **Entry-point / import compliance** — recorded in §3.1, §3.4 above, and §5 below documents the final import model by category.
- **Package-boundary compliance** — recorded in §3.5 above.
- **Lane classification** — unchanged and explicitly preserved as productive-lane (see §1 and the "Guardrails" section of the closure commit message).
- **Verification performed** — recorded in §6 below.

## 4. Premium surface enhancement summary

The non-gap-closure enhancements raise Project Sites to a more premium productive-surface quality while staying strictly within productive-lane doctrine (no theatrical motion, no oversized editorial treatment, no decorative drift).

### Header composition and hierarchy

- Added an eyebrow row (`HB Central · Projects`, uppercase, muted color, tight letter-spacing) above the title. This gives the surface a clear provenance signal and a stronger vertical compositional rhythm.
- The `header` flex container now uses `alignItems: 'flex-end'` with `rowGap` + `columnGap` so the title on the left and the control cluster on the right line up along the baseline of the segmented control. At narrow widths the control cluster wraps cleanly below the title without breaking the title-eyebrow relationship.
- The count badge is now a bordered chip (1 px `surface-3` border, `surface-2` background, 8 px horizontal padding) rather than a flat tinted rectangle. It reads as a real operational badge rather than a spare text token.

### Control cluster refinement

- The segmented-control + count-badge cluster sits in a dedicated `headerTrailing` flex group with `gap: HBC_SPACE_MD`, so the relationship between "year selected" and "result count" is visually explicit.
- Both elements share `flexWrap: 'wrap'` so the cluster reflows gracefully under constrained widths inside SharePoint section containers.

### Card system — state differentiation

**Active cards** keep their blue top accent, `elevationLevel1` baseline, and `elevationLevel2` / `translateY(-2px)` hover lift. The "Open Site" affordance is now a brand-tinted action chip (`hbcBrandRamp[100]` background, `HBC_BRAND_ACTION` text, `HBC_SPACE_SM` horizontal padding, `HBC_RADIUS_SM` radius) rather than a bare text link with underlined hover — it reads as a real interactive affordance.

**Archived cards** keep their reduced opacity (0.82) and `elevationLevel0` baseline. Hover now restores full opacity **and** lifts to `elevationLevel1` + `translateY(-1px)`, so the card signals interactivity clearly without drawing attention when idle. The "Open Site" action chip uses a neutral `surface-2` background instead of the brand tint, so active and archived cards have a deliberate visual hierarchy even when both are hoverable.

**Provisioning cards** keep their dashed border, solid orange top accent, and pulsing dot indicator (now driven by `TRANSITION_SLOW` token rather than a `'1.5s'` literal). The wrapper has an explicit `surface-1` background so the dashed border reads against any SharePoint section tint without visual conflict.

### Metadata readability

- The `ProjectSiteCard` body now places the `HbcDescriptionList` inside a `metaList` wrapper with a subtle `HBC_SURFACE_LIGHT['surface-2']` top border and `HBC_SPACE_XS` top padding. This separates the project name (heading 3) from the client/location/type metadata without requiring the description list to grow its own divider.
- The card footer min-height increased from 20 px to 24 px so the action chip and provisioning label sit inside a consistent footer band across all three states.

### Loading state

- The flat 200 px `surface-2` shimmer rectangle is replaced with a realistic card skeleton that renders: an eyebrow-line shimmer (40 % width), a title-line shimmer (85 % width, taller), a meta-line shimmer (60 % width), and a footer-row shimmer with two short lines. The skeleton card has the same border/radius/shadow/top-accent treatment as a real archived card, so the loading state blends into the grid rather than interrupting it.
- The shimmer uses `TRANSITION_SLOW` for the opacity pulse and honors `prefers-reduced-motion` by locking opacity to a stable value.

### Empty / error framing

- The empty/error container now has a dashed 1 px `surface-3` border, an explicit `surface-1` background, and `HBC_SPACE_LG` horizontal padding. It reads as a real empty-state card rather than a naked `HbcEmptyState` hanging in the flow, which gives the states a sense of deliberate framing.

### Action affordance quality

- "Open Site" is now a real action chip (background + text color + padding + radius) and signals hoverability without relying on underlines.
- Focus-visible outlines remain `HBC_PRIMARY_BLUE` with `outlineOffset: '2px'` on both active and archived cards.

### Motion and focus discipline

- All card and action transitions use `TRANSITION_FAST` from `@hbc/ui-kit/theme`.
- Grid reveal uses `TRANSITION_NORMAL` for the initial fade-in on year change.
- Provisioning pulse and shimmer pulse use `TRANSITION_SLOW`.
- Every motion path has a matching `@media (prefers-reduced-motion: reduce)` override that collapses the animation, preserving the a11y contract.
- No decorative persistent motion. No scale jumps. No parallax. No presentation-lane drama.

### Token / spacing discipline improvements

- All routine spacing comes from `HBC_SPACE_*` tokens.
- All breakpoint queries come from `hbcMediaQuery()` against `hbcBreakpoints`.
- All border definitions are written via Griffel's `shorthands.border*()` helpers, which matches the pattern already used by sibling ui-kit surface cards and fixes a previously hidden Griffel type-system trip point (writing `borderTopWidth` + `borderRightWidth` as individual properties was flagged by the strict Griffel style type).

## 5. Final import model

The post-closure Project Sites import topology by category:

### Primitives (Layer 2)

```tsx
// packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx
import {
  HbcEmptyState,
  HbcSegmentedControl,
} from '@hbc/ui-kit/primitives';

// packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx
import {
  HbcCard,
  HbcStatusBadge,
  HbcDescriptionList,
  type StatusVariant,
  type DescriptionListItem,
} from '@hbc/ui-kit/primitives';
```

### Theme / tokens

```tsx
import {
  // colors + surface + brand
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_BRAND_ACTION,
  hbcBrandRamp,

  // radii
  HBC_RADIUS_SM,
  HBC_RADIUS_XL,
  HBC_RADIUS_FULL,

  // spacing
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,

  // elevation
  elevationLevel0,
  elevationLevel1,
  elevationLevel2,

  // motion
  TRANSITION_FAST,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,

  // typography
  heading1,
  heading3,
  bodySmall,
  label as labelType,

  // breakpoints + media helper
  hbcMediaQuery,
} from '@hbc/ui-kit/theme';
```

### Icons (HBC proprietary SVG)

```tsx
// Root surface
import { Search, AlertTriangle } from '@hbc/ui-kit/icons';

// Card
import { ExternalLink } from '@hbc/ui-kit/icons';
```

### Theme provider / shell-adjacent

```tsx
// apps/project-sites/src/mount.tsx
import { HbcThemeProvider } from '@hbc/ui-kit/app-shell';
```

Note: the app host does **not** import `HbcAppShell` or `HbcConnectivityBar` because the Project Sites webpart is hosted inside a SharePoint page canvas rather than composing its own shell chrome. Only the theme-context wrapper is consumed from `/app-shell`.

### Package seam for `ProjectSitesRoot`

```tsx
// apps/project-sites/src/mount.tsx
import { ProjectSitesRoot } from '@hbc/spfx/project-sites';
```

This resolves through the new `./project-sites` subpath export in `packages/spfx/package.json`, which points at `packages/spfx/src/webparts/projectSites/index.ts`. The app host never reaches into raw source paths.

### Eliminated

```tsx
// Removed — no longer present anywhere in the Project Sites consumer or app host:
import { ... } from '@hbc/ui-kit';
import { ProjectSitesRoot } from '../../../packages/spfx/src/webparts/projectSites/ProjectSitesRoot.js';
```

Both root `@hbc/ui-kit` aliases (`tsconfig.json` and `vite.config.ts`) have also been removed so a regression back to the root barrel will be caught by tsc / Vite at build time rather than silently working.

## 6. Verification performed

All commands were executed against the live workspace after the full remediation.

### Commands run

```bash
# ui-kit (new app-shell export)
pnpm --filter @hbc/ui-kit check-types      # ✅ pass
pnpm --filter @hbc/ui-kit build            # ✅ pass (rebuilds dist/app-shell.d.ts with HbcThemeProvider, confirmed via grep)
pnpm --filter @hbc/ui-kit lint             # 1 pre-existing error (useVoiceDictation.test.ts Function-type), unchanged from the baseline recorded in docs/architecture/reviews/people-culture-ui-kit-migration-completion.md; 0 new errors

# @hbc/spfx (consumer code + new barrel)
pnpm --filter @hbc/spfx check-types        # ✅ pass
pnpm --filter @hbc/spfx build              # ✅ pass (emits packages/spfx/dist/webparts/projectSites/index.{d.ts,js})
pnpm --filter @hbc/spfx lint               # ✅ pass (0 errors, 0 warnings)
pnpm --filter @hbc/spfx test               # ✅ 62/62 tests pass across 6 test files
                                           #    ProjectSitesRoot.test.tsx: 8/8
                                           #    ProjectSiteCard.test.tsx: 14/14
                                           #    types.test.ts: 9/9
                                           #    hooks/useAvailableYears.test.ts: 5/5
                                           #    hooks/useProjectSites.test.ts: 7/7
                                           #    normalizeProjectSiteEntry.test.ts: 19/19

# @hbc/spfx-project-sites (app host + packaging)
pnpm --filter @hbc/spfx-project-sites build  # ✅ pass (tsc --noEmit && vite build)
pnpm --filter @hbc/spfx-project-sites lint   # ✅ pass (0 errors, 0 warnings — previously-fixed eslint-disable block now uses /* eslint-disable */ wrapping the two `as any` casts)
```

### Packaging / integration proof

The `apps/project-sites` build produces `dist/project-sites-app.js` at **399.93 KB** raw, **121.53 KB** gzipped. The bundle is slightly smaller than before the remediation (the previous baseline was ~400 KB raw), which is expected because the consumer no longer pulls in root-barrel intermediaries for the primitive/theme/icon imports that are now directly tree-shaken.

The IIFE contract is preserved:

- `mount(el, spfxContext)` and `unmount()` remain exported.
- `globalThis.__hbIntel_projectSites` is still published belt-and-suspenders on both `globalThis` and `window`.
- `HbcThemeProvider(forceTheme='light')` still wraps the React tree at the mount boundary — just sourced from `@hbc/ui-kit/app-shell` instead of the root barrel.

### Pre-existing failures explicitly separated from new failures

- `@hbc/ui-kit` lint: 1 pre-existing error (`useVoiceDictation.test.ts:61:34` — Function-as-type). Unchanged from the post-Company-Pulse baseline.
- No new test failures introduced anywhere. All 62 `@hbc/spfx` tests pass.

## 7. Remaining exceptions or follow-ups

| Item | Type | Notes |
|---|---|---|
| `HbcThemeProvider` is now exported from both `@hbc/ui-kit/app-shell` **and** `@hbc/ui-kit/homepage` | Intentional | Homepage webparts continue to use it from `/homepage` (already enforced by homepage ESLint import-discipline rule). Productive-lane SPFx consumers now use it from `/app-shell`. Root barrel also still exports it for PWA and other non-constrained consumers. This is not an exception — it is the deliberate layered model. |
| `apps/project-sites/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` still duplicates `packages/spfx/src/webparts/projectSites/ProjectSitesWebPart.manifest.json` | Pre-existing observation | Both manifests now carry `version: 0.1.0.0` and are kept in sync by manual edit. Consolidating to a single manifest is a packaging-hygiene task that is explicitly out of scope for this compliance closure. |
| A few deliberately-kept literal values (`2px` borders, `3px` top accent, `200px` shimmer min-height, `280px`/`320px`/`380px` grid `minmax` widths, line-height decimals) | Intentional | See §3.6 for the rationale. These are layout constants and border widths, not spacing rhythm values, and promoting them to new tokens would be speculative abstraction. |
| Consumer-level SPFx-workbench screenshots | Wave-wide gap | Storybook-equivalent isolated proof for ui-kit primitives exists at the `@hbc/ui-kit` level. Live SPFx-workbench before/after screenshots for Project Sites specifically remain pending a workbench run, as with the previously-migrated homepage consumers. Not a compliance regression — a wave-wide verification gap. |
| Stale `ProjectPortfolioSpotlight` row in the Wave 01 Execution Note (carryover from earlier closure passes) | Pre-existing drift | Not in scope for this Project Sites pass. |

No gap from the audit remains open.

## 8. Final closure posture

**All seven named compliance gaps are closed.**

Project Sites is now aligned with the latest productive-lane and entry-point doctrine:

- The consumer and app host import only from narrow sanctioned entry points (`@hbc/ui-kit/primitives`, `/theme`, `/icons`, `/app-shell`). The root `@hbc/ui-kit` barrel is no longer reached anywhere in the Project Sites code path, tsconfig, or vite config.
- `HbcThemeProvider` is exported from a narrow SPFx-safe path (`@hbc/ui-kit/app-shell`) with an explicit doctrinal rationale documented in `docs/reference/ui-kit/entry-points.md`. No exception required.
- The app host reaches into the webpart implementation through a clean package seam (`@hbc/spfx/project-sites`) backed by a real `packages/spfx/package.json` `./project-sites` subpath export, a workspace dependency, a new `index.ts` barrel, and matching tsconfig + vite aliases. No more relative source reach.
- Routine spacing, breakpoint, and motion values come from shared foundations (`HBC_SPACE_*`, `hbcMediaQuery()`, `TRANSITION_*`). The remaining literals are layout constants and border widths that are not spacing rhythm values.
- The webpart is materially more polished as a premium productive surface: stronger header hierarchy (eyebrow + title), more deliberate control-cluster composition, a realistic card-skeleton loading state, a framed empty/error container, a brand-tinted "Open Site" action chip, restored-on-hover archived state, and disciplined motion that stays strictly within the productive-lane register.
- The remediated state is explicitly documented in this closure report, the entry-points reference, and the updated manifest version baseline.
- Verification passes end-to-end: `@hbc/ui-kit` typecheck + build + lint; `@hbc/spfx` typecheck + build + lint + all 62 tests; `@hbc/spfx-project-sites` build (tsc + vite) + lint. The Project Sites IIFE bundle still packages correctly at ~400 KB raw / ~122 KB gzipped.

Project Sites should now be treated in repo truth as **fully compliant with the latest ui-kit productive-lane and entry-point doctrine** and **materially improved in premium-quality execution**.
