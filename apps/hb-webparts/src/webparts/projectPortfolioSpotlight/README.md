# Project / Portfolio Spotlight

Premium editorial spotlight surface for the HB Central homepage. Renders one dominant featured project with a subordinate supporting rail of secondary projects, sourced from the **Homepage Project Spotlights** SharePoint list.

## Manifest

- **ID:** `8370ab0c-b6df-4db0-82f1-24b54750f508`
- **Zone:** Operational Awareness
- **Alias:** `ProjectPortfolioSpotlightWebPart`
- **Version:** `0.0.7.0`

## Data source

**Primary:** SharePoint list `Homepage Project Spotlights` via REST API fetch.
**Fallback:** Manifest `preconfiguredEntries` seed data (local dev / demo only).

The list is fetched when SPFx context provides a site URL. Items are filtered server-side by `HomepageEnabled eq 1` and client-side by publish window (`PublishStart`/`PublishEnd`). Audience filtering and stale detection happen during normalization.

Field mapping, fetch logic, and raw-to-contract mapping live in `homepage/data/projectSpotlightListSource.ts`. The fetch hook with 5-minute cache is in `homepage/data/useProjectSpotlightData.ts`. Site URL storage is in `homepage/data/spContext.ts`.

## Component structure

```
ProjectPortfolioSpotlight          Main component, responsive layout orchestration
  FeaturedImage                    Safe featured image with branded placeholder fallback
  ProjectTeamStrip                 Avatar strip + detail panel (popover or mobile bottom-sheet)
    SafeAvatar                     Avatar with initials fallback on error
  SupportingTile                   Secondary project tile in the rail
    RailThumbnail                  Safe thumbnail with gradient fallback on error
```

All sub-components are defined locally in `ProjectPortfolioSpotlight.tsx`. Nothing is exported beyond the main component and its props type.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `Partial<ProjectPortfolioSpotlightConfig>` | Fallback configuration (used when list unavailable) |
| `activeAudience` | `string` | Current audience filter for visibility rules |
| `isLoading` | `boolean` | Shows loading state when true |

## Config fields (section-level)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `heading` | `string?` | `"Project and Portfolio Spotlight"` | Section heading |
| `maxSecondaryItems` | `number?` | `3` | Rail item limit |
| `staleAfterHours` | `number?` | `168` (7 days) | Freshness threshold |
| `allProjectsLabel` | `string?` | `"View all projects"` | Section-level CTA label (independent of featured CTA) |
| `allProjectsUrl` | `string?` | `"/sites/hb-central/portfolio"` | Section-level CTA URL |

## Selection logic

Items are sorted deterministically: `featured: true` first, then by `order`, then by recency (`freshness.updatedAt`), then alphabetically by title. The first item after sorting becomes the featured project. Stale items are demoted to the end of the supporting rail.

## Responsive behavior

Uses `useResponsiveTier()` from `homepage/shared/` to adapt across three tiers:

| Tier | Breakpoint | Layout |
|------|-----------|--------|
| Desktop | >= 1200px | Featured (68%) + rail (28%) side by side |
| Tablet | 768-1199px | Featured full-width on top, rail below |
| Mobile | <= 767px | Image stacks above content, rail below, team detail uses bottom-sheet |

## Media reliability

All images use safe rendering components with `onError` fallbacks:

- **Featured image:** Branded gradient placeholder always behind image; on error, img removed and placeholder remains.
- **Rail thumbnails:** On error, switches to branded gradient placeholder.
- **Avatars (strip + detail):** On error, falls back to initials badge.

## Ownership

- **Spotlight-local:** Component, team strip, supporting tile, safe media components, all styles and constants
- **Homepage data:** `spContext.ts`, `projectSpotlightListSource.ts`, `useProjectSpotlightData.ts`
- **Homepage shared:** `useResponsiveTier` hook, `usePrefersReducedMotion` hook
- **Homepage helpers:** `operationalAwarenessConfig.ts` (normalization), `authoringGovernance.ts` (empty/error state), `visibility.ts` (audience filtering)
- **Contracts:** `operationalAwarenessContracts.ts` (data types and defaults)

## Accessibility

- Semantic HTML: `section`, `h2`, `h3`, `ul`, `li`, `button`, `a`
- Team detail panel: `role="dialog"`, `aria-haspopup="dialog"`, Escape to close, focus return, outside-click dismissal
- Mobile bottom-sheet: backdrop overlay, motion animation respects `prefers-reduced-motion`
- All entry animations (featured reveal, rail reveal, bottom-sheet) suppressed when reduced motion preferred
- Touch targets: >= 44px on all interactive elements
- Focus-visible: `.teamStripButton` class in `homepage-interactive.module.css`
- Images: `decoding="async"`, `loading="lazy"`, explicit dimensions, `onError` fallbacks
- CLS prevention: `contain` on image zones and thumbnail wrappers
- No hover-only dependencies

## Related docs

- [Phase 02 Package README](../../../docs/architecture/plans/MASTER/spfx/homepage/projects/phase-02/00_README_Project_Spotlight_List_Integration_and_Polish_Package.md)
- [Phase 02 Summary](../../../docs/architecture/plans/MASTER/spfx/homepage/projects/phase-02/09_Project_Spotlight_List_Integration_and_Polish_Summary.md)
- [UI Doctrine SPFx Homepage Overlay](../../../docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md)
