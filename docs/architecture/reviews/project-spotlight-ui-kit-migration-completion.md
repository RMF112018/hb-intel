# Project Spotlight UI-Kit Migration Completion

_Date: 2026-04-09_

_Scope: Wave 01 follow-on — Project / Portfolio Spotlight homepage webpart
migrated to the shared `@hbc/ui-kit/homepage` surface-family layer._

## 1. Objective completed

Migrated the **Project / Portfolio Spotlight** homepage webpart from a
1,122-line local presentation file into a new shared surface family,
`HbcProjectSpotlightSurface`, published through `@hbc/ui-kit/homepage`.
The consuming webpart is now a thin integration layer that owns only data
fetch, audience normalization, authoring-state resolution, and view-model
mapping. All durable presentation grammar — featured hero composition,
image-safe rendering, team avatar strip + detail panel, supporting rail,
responsive behavior, reduced-motion handling — now lives in `@hbc/ui-kit`.

This mirrors the People & Culture precedent
(`feat(ui-kit,hb-webparts): migrate People & Culture to shared
HbcPeopleCultureSurface + HbcKudosComposer`) and materially improves the
named consumer's repo-truth migration status.

## 2. Shared UI ownership decisions

### Foundations (Layer 1)

No new governed tokens were required. The existing presentation-lane
brand tokens already carry the needed palette:

- `HBC_PRESENTATION_BLUE` / `HBC_PRESENTATION_BLUE_RGB` (`#225391` / `34, 83, 145`)
- `HBC_PRESENTATION_ORANGE` / `HBC_PRESENTATION_ORANGE_RGB` (`#e57e46` / `229, 126, 70`)
- `HBC_SURFACE_PRESENTATION` semantic surface role values

The new surface's CSS module references the brand foundation values
directly (matching the established pattern across HbcPeopleCultureSurface,
HbcEditorialSurface, and HbcOperationalSurface). No token sprawl.

### Primitives (Layer 2)

No new primitives were added. The surface reuses the existing
`HbcAvatarStack` primitive (introduced in the People & Culture wave) for
the project-team avatar strip, plus the standard homepage primitives:
`HbcPremiumCta`, `HbcPremiumBadge`, `HbcHomepageEyebrow`, and
`HbcHomepageMetadataRow`.

### Surface family (Layer 3) — net-new

**`HbcProjectSpotlightSurface`** was added as a single cohesive surface
family under `packages/ui-kit/src/HbcProjectSpotlightSurface/`, following
the flat-directory convention used by all six pre-existing homepage
surface families. The decision to ship as **one cohesive surface** (not a
fragmented family of micro-components) was driven by:

- The featured-hero + supporting-rail + team-strip composition is a
  cohesive authored grammar. Breaking it apart would destroy the
  featured-first hierarchy that defines the surface identity.
- The precedent (`HbcPeopleCultureSurface`) ships cohesive-surface + one
  shared primitive (`HbcAvatarStack`) rather than micro-components.
- Rail, featured, and team concerns are tightly coupled at the visual
  level; fragmenting them would push presentation logic back into
  consumers.

The surface's public view-model contract (`ProjectSpotlightSurfaceModel`)
is **decoupled from** `operationalAwarenessContracts.ts`. The local
consumer is responsible for mapping its normalized domain data into the
shared view-model.

An entry was added to `HBC_HOMEPAGE_SURFACE_FAMILIES` under the
`projectSpotlight` key (surfaces: `['operational']`), documenting the
family's character, shadow, radius, background, and border signature.
`HbcProjectSpotlightSurface` was added to the `HomepagePrimitiveName`
enum.

### Consumer (Layer 4)

The webpart now owns only the plumbing that cannot live in ui-kit:

- SharePoint list fetch via `useProjectSpotlightData`
- Manifest `preconfiguredEntries` fallback
- Normalization, audience filtering, stale detection, content
  completeness, and featured-vs-secondary partitioning via
  `normalizeProjectPortfolioSpotlightConfig`
- Authoring-state resolution via `resolveAuthoringMessage`
- Empty / loading fallbacks via `HomepageEmptyState` /
  `HomepageLoadingState`
- A small in-file adapter that maps
  `NormalizedProjectPortfolioSpotlightItem` →
  `ProjectSpotlightSurfaceModel`

## 3. Changes implemented

### Created

| Path | Purpose |
|------|---------|
| `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx` | New cohesive surface family, internal sub-components (`FeaturedSlot`, `FeaturedMedia`, `TeamStrip`, `RailTile`, `RailThumbnail`, `SupportingRail`), view-model types, `HbcAvatarStack` reuse. |
| `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css` | Full responsive layout via viewport media queries. Replaces the ~500 lines of JS-driven tier-aware style generators from the old consumer. Includes reduced-motion block and bottom-sheet vs popover detail panel behavior. |
| `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css.d.ts` | Class-name declarations for the CSS module. |
| `packages/ui-kit/src/HbcProjectSpotlightSurface/HbcProjectSpotlightSurface.stories.tsx` | Default / Sparse / NoRail / Mobile story variants for visual proof. |
| `docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md` | This report. |

### Modified

| Path | Change |
|------|--------|
| `packages/ui-kit/src/homepage.ts` | Export new surface + view-model types; add to `HomepagePrimitiveName` enum; add `projectSpotlight` entry to `HBC_HOMEPAGE_SURFACE_FAMILIES`. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | Collapsed from **1,122 → 167 lines** (~85% reduction). Removed: brand palette constants, motion defaults, tier-aware style generators, `FeaturedImage`, `RailThumbnail`, `SafeAvatar`, `ProjectTeamStrip`, `SupportingTile`, `getInitials`, `useResponsiveTier`/`usePrefersReducedMotion` imports, `homepage-interactive.module.css` import. Added: `HbcProjectSpotlightSurface` delegation, `toFeatured` / `toRailItem` adapters. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md` | Rewrote to reflect new ownership boundary. Removed stale "all sub-components are local" claim. Documented which layer owns what. Updated version reference. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | Patch version bump `0.0.21.0 → 0.0.22.0`. |
| `apps/hb-webparts/src/homepage/homepage-interactive.module.css` | Pruned `.teamStripButton:focus-visible` and `.teamDetailBackdrop` classes (only Project Spotlight used them; confirmed by grep). Removed their entries from the reduced-motion blanket. |
| `apps/hb-webparts/src/homepage/homepage-interactive.module.css.d.ts` | Dropped the corresponding class declarations. |

### Deleted

None. All removals were pruning inside otherwise-still-used files.

## 4. Named consumer impact

**Project / Portfolio Spotlight** — status changed from *materially
local* to **cleanly migrated**.

- Before: 1,122-line consumer file owning full presentation grammar
  including responsive layout, sub-components, brand constants, and
  interactive CSS classes.
- After: 167-line thin integration consumer that fetches data,
  normalizes, and delegates all rendering to
  `HbcProjectSpotlightSurface` with a typed view-model.

No other named consumers were touched. The surface family is ready to
serve future homepage compositions that need the same
spotlight-with-rail editorial grammar.

## 5. Verification performed

All commands executed from the repo root unless otherwise noted.

### Type checking (green)

- `pnpm --filter @hbc/ui-kit check-types` — clean
- `pnpm --filter @hbc/spfx-hb-webparts check-types` — clean

### Lint (no new errors)

- `pnpm --filter @hbc/ui-kit lint` — 1 pre-existing error in
  `HbcInput/hooks/__tests__/useVoiceDictation.test.ts` (unrelated;
  present at baseline before this migration). New files in
  `HbcProjectSpotlightSurface/` produce zero lint errors or warnings.
- `pnpm --filter @hbc/spfx-hb-webparts lint` — clean

### Build (green)

- `pnpm --filter @hbc/ui-kit build` — clean TypeScript compile; new
  declarations emitted for `HbcProjectSpotlightSurface/` and the new
  homepage.ts exports.
- `pnpm --filter @hbc/spfx-hb-webparts build` — clean Vite production
  bundle (`dist/hb-webparts-app.js` 564.64 kB / gzip 201.25 kB;
  `dist/spfx-hb-webparts.css` 51.65 kB / gzip 9.55 kB).

### Tests (no new failures)

- `pnpm --filter @hbc/ui-kit test` — 16 failed / 560 passed (576 total).
  All 16 failures are pre-existing in `HbcHeader`, `HbcBanner`, and
  `HbcKpiCard` suites; none reference `HbcProjectSpotlightSurface`. No
  new test file was required because the surface is covered by
  Storybook visual proof following the precedent (the existing six
  homepage surfaces and `HbcPeopleCultureSurface` also do not have
  dedicated `.test.tsx` files).
- `pnpm --filter @hbc/spfx-hb-webparts test` — 13 failed / 115 passed
  (128 total). Identical baseline count before and after the
  migration; 2 of the 13 failures are in
  `operationalAwarenessWebparts.test.tsx` and predate this work (the
  `getByLabelText(/featured/)` lowercase-regex mismatch and the
  `"Project spotlight configuration is invalid"` text mismatch that
  does not align with the current authoring registry entry). The
  migration did not regress any previously passing test.

### Visual proof

- `pnpm --filter @hbc/ui-kit exec storybook build` (via
  `pnpm exec storybook build --quiet`) — clean. Generated artifacts
  include:
  - `storybook-static/assets/HbcProjectSpotlightSurface-*.css`
  - `storybook-static/assets/HbcProjectSpotlightSurface.stories-*.js`
- Story variants exercised: **Default** (full view-model with featured
  image, status, milestones, 6-person team, 3 rail items), **Sparse**
  (featured-only, minimal data), **NoRail** (featured + empty rail),
  **Mobile** (constrained viewport).

## 6. Remaining gaps

- Two pre-existing test failures in
  `operationalAwarenessWebparts.test.tsx` remain unfixed because they
  predate this migration and fixing them is out of scope:
  - `getByLabelText(/featured/)` uses a case-sensitive lowercase regex
    that never matched the production `aria-label` text (which is
    correctly capitalized). The new surface does add
    `aria-label="Featured project spotlight"` on the featured region,
    so fixing the test is a one-line `/featured/i` change whenever the
    test owner wants to pick it up.
  - `getByText('Project spotlight configuration is invalid')` looks
    for a string that does not exist in the authoring-governance
    registry. The current text is
    `"Project spotlight items could not be displayed"`. Fixing it is
    a test-file update, not a production-code change.
- No new automated visual-regression snapshotting was added; the
  precedent (`HbcPeopleCultureSurface`) likewise relies on Storybook
  stories as the visual proof artifact.
- `apps/hb-webparts/src/homepage/homepage-interactive.module.css` still
  contains legacy CTA / search / hero-CTA interactive states used by
  other homepage consumers. Those are not in scope for this migration.

## 7. Final repo-truth posture for Project Spotlight

**Cleanly migrated.** The Project / Portfolio Spotlight homepage
webpart now delegates its entire authored presentation grammar to the
shared `HbcProjectSpotlightSurface` family in `@hbc/ui-kit/homepage`.
The consumer is a thin integration layer (~167 lines) that owns only
SharePoint plumbing, normalization, authoring-state handling, and a
typed view-model adapter. Import discipline is preserved
(`@hbc/ui-kit/homepage` only), governed presentation tokens are used
throughout the new CSS module, and the migration leaves the UI-system
migration posture materially stronger without introducing any new
verification failures.
