# Phase 02-01 Completion Note — Homepage Token and Primitive Upgrade

## Status

**Complete.** Homepage design token system created, shared primitives upgraded, webpart inline style debt materially reduced.

## Repo-truth findings

The audit identified ~60 hardcoded inline style values across 5 shared primitives and 8 webpart components:
- 6 spacing variants (4–20px) with no semantic naming
- 3 border-radius values (6, 8, 10px) with inconsistent usage
- 5 border opacity levels (0.08–0.25) with near-identical visual appearance
- 3 text opacity values (0.75, 0.8, 0.85) with no semantic distinction
- Gradient hex values embedded directly in JSX
- Duplicate style objects allocated on every render

## Changes made

### New file: `src/homepage/tokens.ts`
Homepage-local design token system with:
- `HP_SPACE` — 7-tier spacing scale (xs=4 through 3xl=20)
- `HP_RADIUS` — 3-tier radius (image=6, card=8, hero=10)
- `HP_BORDER` — 3 semantic border strengths (subtle, standard, interactive)
- `HP_TEXT_OPACITY` — 2 semantic opacity tiers (secondary=0.75, muted=0.85)
- `HP_IMAGE` — featured/compact max-height + object-fit
- `HP_LAYOUT` — top-band flex ratios and min-widths
- `HP_HERO` — branded gradient values and text color
- 11 pre-composed `React.CSSProperties` fragments for common patterns

### Shared primitives upgraded (4 files)
| File | Change |
|------|--------|
| `HomepageCuratedContentCluster.tsx` | Replaced 6 inline style objects with shared tokens (`hpFeaturedContainer`, `hpSecondaryGrid`, `hpSecondaryCard`, `hpHeadingReset`) |
| `HomepageOperationalAwarenessCluster.tsx` | Same pattern — eliminated duplicate styling with CuratedContentCluster; both now share identical token-backed styles |
| `HomepageTopBandPair.tsx` | Replaced hardcoded flex/minWidth with `HP_LAYOUT` tokens |
| `HomepageUtilityDenseGroup.tsx` | Replaced hardcoded spacing with `HP_SPACE` and `HP_LAYOUT` tokens |
| `HomepageDiscoveryCluster.tsx` | Replaced ~20 inline style values across search input, quick paths, promoted resources, and category groups |

### Webpart components upgraded (8 files)
| File | Tokens Used |
|------|-------------|
| `HbHeroBanner.tsx` | `HP_HERO`, `HP_RADIUS.hero`, `HP_SPACE`, `hpHeadingReset`, `hpContentParagraph` |
| `PersonalizedWelcomeHeader.tsx` | `HP_SPACE`, `hpHeadingReset` |
| `CompanyPulse.tsx` | `hpHeadingReset`, `hpContentParagraph`, `hpSecondaryText` |
| `PriorityActionsRail.tsx` | `HP_SPACE`, `hpHeadingReset`, `hpZoneFlexLayout` |
| `ToolLauncherWorkHub.tsx` | `HP_SPACE`, `hpHeadingReset`, `hpZoneFlexLayout` |
| `ProjectPortfolioSpotlight.tsx` | `hpHeadingReset`, `hpBadgeRow`, `hpContentParagraph`, `hpSecondaryText`, `hpListStyle` |
| `SafetyFieldExcellence.tsx` | `hpHeadingReset`, `hpBadgeRow`, `hpContentParagraph`, `hpSecondaryText` |
| `LeadershipMessage.tsx` | `hpHeadingReset`, `hpContentParagraph`, `hpFeaturedImage` |
| `PeopleCulture.tsx` | `hpHeadingReset`, `hpContentParagraph`, `hpCompactImage` |

### Version bump
`config/package-solution.json`: `1.0.0.31` → `1.0.0.32`

## Verification

| Step | Result |
|------|--------|
| `check-types` | PASS |
| `lint` | PASS |
| `build` | PASS (262.34 KB — slight decrease from 262.49 KB due to shared object reuse) |
| `test` | PASS (14 files, 48 tests) |

## What was preserved

- All Phase 01 acceptance guarantees intact (48 tests pass)
- Mount/dispatch seam unchanged
- Import discipline unchanged (no new @hbc/ui-kit imports)
- Loading/empty/stale/noResults state handling unchanged
- Independent webpart mountability preserved
- Authoring governance integration unchanged

## Deferred to Phase 02-02

- Hover/focus/transition treatments for interactive elements
- Motion token system (currently only HbHeroBanner has transition)
- Skeleton/loading surface visual upgrade (still uses HbcSpinner delegation)
- SmartSearchWayfinding and PeopleCulture webpart-level styling (delegated to shared primitives already)
