# Recommended Implementation Waves

## Wave 01 — Media truth and first-view hierarchy

### Goal
Fix the two issues that currently make the Spotlight feel obviously underperforming in the hosted runtime:

1. missing / failing media dominating the surface
2. the featured story beginning too low in the viewport

### Scope
- prove the PrimaryImage seam
- repair image resolution or data fallback if broken
- implement distinct missing-media posture
- reduce first-view dead space
- rebalance wide / medium hero height and title visibility

### Files / seams
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedMedia.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Wave 02 — Composition, disclosure, and constrained-mode redesign

### Goal
Make the surface feel productized and decisive across desktop, tablet, and phone states.

### Scope
- featured body hierarchy redesign
- stronger CTA policy
- history rail subordination
- real compact / minimal selectivity
- better desktop-vs-mobile disclosure posture

### Files / seams
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/SupportingRail.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

## Wave 03 — Doctrine cleanup and hosted closure

### Goal
Bring the family up to benchmark discipline and prove it in the hosted runtime.

### Scope
- token / literal cleanup
- primitive hygiene
- accessibility / interaction regression check
- hosted proof at the audited breakpoints
- closure artifacts

### Files / seams
- `packages/ui-kit/src/HbcProjectSpotlightSurface/*`
- any new local token / variant seam introduced for the Spotlight family
- story coverage
- hosted validation assets / tests
