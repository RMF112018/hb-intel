# Current Spotlight Implementation Map

## 1. Runtime ownership map

### SPFx consumer boundary

Primary entry:

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`

Role:

- fetch SharePoint list data through `useProjectSpotlightData`
- fall back to manifest config
- normalize and audience-filter the source collection
- map the normalized collection into the shared `ProjectSpotlightSurfaceModel`
- resolve loading / empty / error / authoring states

This is the right architectural posture for a premium homepage webpart. The consumer is thin.

### Homepage shell embedding

Shell zone seam:

- `apps/hb-webparts/src/webparts/hbHomepage/zones/ProjectPortfolioSpotlightZone.tsx`

Shell layout target:

- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`

Current homepage placement:

- Row 1 major slot: `project-portfolio-spotlight`
- Row 1 minor slot: `hb-kudos`

That shell decision is consistent with the screenshots and broadly correct for homepage hierarchy.

## 2. Data seams

### Context seam

- `apps/hb-webparts/src/homepage/data/spContext.ts`

Used to determine whether the runtime has SPFx site context and can fetch the SharePoint list.

### Fetch hook

- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`

Responsibilities:

- consult site URL
- short-circuit to manifest fallback outside SPFx
- keep a 5-minute in-memory cache
- fetch list-backed config
- expose `listConfig`, `isLoading`, and `error`

This is clean and appropriate.

### SharePoint list source

- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`

Responsibilities:

- query `Homepage Project Spotlights`
- map list fields into the Spotlight item contract
- parse `PrimaryImage`
- synthesize milestones from completed/total counts
- map team members to photo URLs
- apply publish-window filtering
- fall back to a schema-light query on 400s

This seam is strong mechanically, but the screenshots strongly suggest that **media truth is not actually closed in the hosted runtime**. Either image data is absent, not resolving, or failing late enough that the placeholder dominates.

## 3. Normalization seam

- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`

Responsibilities:

- deterministic ranking
- audience visibility gating
- stale detection
- freshness labeling
- content completeness scoring
- featured vs secondary partitioning
- stale demotion inside the rail

This is one of the better parts of the implementation. The problem is not lack of normalization logic; the problem is that the resulting runtime still produces a weak first-view experience.

## 4. Shared presentation seam

Primary shared family:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/`

Current split seams include:

- `index.tsx`
- `types.ts`
- `layout-mode.ts`
- `use-spotlight-layout-mode.ts`
- `internals.ts`
- `Masthead.tsx`
- `FeaturedMedia.tsx`
- `FeaturedSlot.tsx`
- `Milestones.tsx`
- `TeamStrip.tsx`
- `SupportingRail.tsx`
- `HistoryDisclosure.tsx`
- `project-spotlight-surface.module.css`

This is directionally the right decomposition.

## 5. Responsive / shell-fit seam

### Layout mode contract

- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`

Modes:

- `wide`
- `medium`
- `compact`
- `minimal`

Resolver inputs:

- container width
- container height (for vertical-pressure step-down)

Thresholds:

- wide: `>= 1040`
- medium: `760–1039`
- compact: `440–759`
- minimal: `< 440`

Height pressure step-down:

- below `520px`, the mode steps down one tier

This is materially better than naïve viewport-only media queries.

### Live measurement seam

- `packages/ui-kit/src/HbcProjectSpotlightSurface/use-spotlight-layout-mode.ts`

Mechanics:

- `useLayoutEffect`
- first synchronous measurement on mount
- `ResizeObserver` for subsequent changes
- conservative default mode before measurement

Again, architecturally sound.

## 6. Disclosure seams

### Featured details disclosure

- `packages/ui-kit/src/HbcProjectSpotlightSurface/FeaturedSlot.tsx`

Pattern:

- always-visible essentials
- explicit details toggle
- default open in wide / medium
- default closed in compact / minimal

### History disclosure

- `packages/ui-kit/src/HbcProjectSpotlightSurface/HistoryDisclosure.tsx`

Pattern:

- explicit `Show past spotlights (N)` / `Hide past spotlights`
- default open in wide / medium
- default closed in compact / minimal

This is accessible and product-minded, but the wide/medium default-open posture is only as good as the first-view footprint. Right now the media footprint still dominates, so the disclosure model is not enough to rescue the experience.

## 7. Styling seam

Primary styling file:

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

Important reality:

- the surface family is still driven by extensive direct hex / rgba / px literals
- the separator is still a raw `<hr>`
- the team panel remains largely hand-rolled rather than anchored on a stronger governed overlay primitive
- the visual language is premium-styled but not doctrine-clean

## 8. Test / proof seams

Evidence seams noted in README:

- Storybook coverage in `HbcProjectSpotlightSurface.stories.tsx`
- local docs and migration notes
- hosted screenshots provided with this audit

Current conclusion:

- proof artifacts exist
- hosted quality closure does not
