# Current Spotlight Implementation Map

## 1. Runtime ownership boundary

### Thin SPFx consumer
**File:** `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`

The webpart is intentionally thin. It:
- loads list-backed data via `useProjectSpotlightData()`
- falls back to manifest config when list data is unavailable
- normalizes data via `normalizeProjectPortfolioSpotlightConfig(...)`
- resolves loading / empty / authoring states
- maps normalized items into `ProjectSpotlightSurfaceModel`
- renders the shared UI-kit surface

This is the correct ownership boundary and should be preserved.

### Shared presentation owner
**Files:**
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`

The shared surface owns:
- masthead
- image-led featured hero
- milestone strip
- team strip and detail panel
- supporting rail
- most responsive presentation behavior
- reduced-motion handling
- focus / dialog behavior for the team panel

This is the primary redesign seam.

## 2. Data and normalization seams

### SharePoint list source
**File:** `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`

Responsibilities:
- fetches from SharePoint list `Homepage Project Spotlights`
- maps raw SharePoint fields into `ProjectPortfolioSpotlightItem`
- strips HTML from summary
- resolves image URLs
- synthesizes milestone arrays from aggregate counts
- maps team members
- applies publish-window filtering
- returns list-level stale-after override when present

This seam is generally sound and does not block the target state.

### Data hook
**File:** `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`

Responsibilities:
- SPFx-site-aware loading
- 5-minute cache
- fallback behavior when no site URL exists
- fetch error isolation

This seam is stable and should not be bloated with presentation logic.

### Normalization and collection partitioning
**File:** `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`

Responsibilities:
- audience filtering
- freshness / stale resolution
- featured-first sorting
- secondary-rail partitioning
- stale-item demotion
- section CTA defaults
- normalization of CTA, image, milestones, team members
- `contentCompleteness` inference (`full` / `partial` / `minimal`)

Important note:
`contentCompleteness` exists, but it is not yet used to drive a real surface-mode contract. That is a missed opportunity and a key redesign lever.

### Contract defaults
**File:** `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`

Responsibilities:
- item/config types
- default heading
- default max secondary items (`3`)
- default stale threshold
- default section CTA label / URL

This seam should remain the business contract source of truth.

## 3. Presentation seams inside the shared surface

### Masthead seam
**Component:** `Masthead`
Shows:
- portfolio eyebrow
- section heading
- freshness label
- section-level CTA

Current issue:
The masthead stays information-bearing at all sizes, but it does not participate in an explicit compact/minimal contract.

### Featured media seam
**Component:** `FeaturedMedia`
Shows:
- image / placeholder
- overlay eyebrow
- status / strategic / stale chips

Current issue:
The media block remains visually dominant at all sizes, but there is no mode-based relationship between media height and content burden.

### Featured body seam
**Component:** `FeaturedSlot`
Shows:
- title
- headline
- summary
- milestone strip
- freshness meta row
- team strip
- CTA

Current issue:
This is the core over-disclosure seam. Nearly the entire story payload is visible by default.

### Team disclosure seam
**Component:** `TeamStrip`
Shows:
- explicit button
- desktop popover
- mobile bottom sheet
- Escape / outside-click dismissal

This is the strongest existing disclosure pattern in the surface and should be used as precedent for the missing details/history disclosure model.

### Supporting rail seam
**Components:** `SupportingRail`, `RailTile`
Shows:
- “More projects” rail
- numbered rail tiles
- thumbnail / title / metadata
- footer CTA

Current issue:
This is functionally a past-spotlight/history rail, but it is always present. It is not mode-governed and is not suppressible in compact/minimal entry states.

## 4. Responsive seams

### CSS-driven only
**File:** `project-spotlight-surface.module.css`

Current responsive behavior:
- mobile `<768`
- tablet `>=768`
- desktop `>=1200`
- composition is single-column stacked at all breakpoints
- desktop enlarges rail thumbnails and spacing
- team panel flips between popover and bottom sheet via CSS breakpoint

Current issue:
This is breakpoint styling, not a true content-visibility mode system.

### Story validation seam
**File:** `HbcProjectSpotlightSurface.stories.tsx`

Current stories:
- default `maxWidth: 1080`
- `SharePointSection` `maxWidth: 920`
- mobile `maxWidth: 420`
- sparse and no-rail scenarios

Current issue:
Stories validate width wrappers but do not validate:
- layout modes
- progressive disclosure defaults
- compact/minimal state rules
- narrowest stable nested width
- explicit details/history reveal behavior

## 5. Host/runtime seams

### Homepage entrypoint governance
**File:** `packages/ui-kit/src/homepage.ts`

This file re-exports the Spotlight surface through the governed homepage entrypoint and defines homepage a11y guardrails such as:
- visible focus
- reduced motion
- no hover-only critical information

The Spotlight redesign should stay fully within this governed surface family pattern.

### Webpart README / closure seam
**File:** `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/README.md`

This file accurately documents the thin-consumer boundary and the single-column stacked composition, but it still overstates the sophistication of current responsive behavior. The implementation is not yet truly “mode-governed.”

## 6. Architectural conclusion

The overall repo shape is healthy:
- business/data logic is separated from presentation
- the presentation surface is centralized
- the consumer is thin

That means the next work is **not a homepage-shell rewrite** and **not a data-pipeline rewrite**.

It is a **shared-surface structural redesign** focused on:
- mode ownership
- visibility rules
- disclosure control
- compact-state credibility
- validation / docs closure
