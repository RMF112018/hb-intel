# Project / Portfolio Spotlight

Premium editorial spotlight surface for the HB Central homepage. Renders one dominant featured project with a subordinate supporting rail of 3-5 secondary projects.

## Manifest

- **ID:** `8370ab0c-b6df-4db0-82f1-24b54750f508`
- **Zone:** Operational Awareness
- **Alias:** `ProjectPortfolioSpotlightWebPart`

## Component structure

```
ProjectPortfolioSpotlight          Main component, responsive layout orchestration
  ProjectTeamStrip                 Avatar strip + detail panel (popover or mobile bottom-sheet)
  SupportingTile                   Secondary project tile in the rail
```

All sub-components are defined locally in `ProjectPortfolioSpotlight.tsx`. Nothing is exported beyond the main component and its props type.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `Partial<ProjectPortfolioSpotlightConfig>` | Webpart property pane configuration |
| `activeAudience` | `string` | Current audience filter for visibility rules |
| `isLoading` | `boolean` | Shows loading state when true |

## Selection logic

Items are sorted deterministically: `featured: true` first, then by `order`, then by recency (`freshness.updatedAt`), then alphabetically by title. The first item after sorting becomes the featured project. Stale items are demoted to the end of the supporting rail.

## Responsive behavior

Uses `useResponsiveTier()` from `homepage/shared/` to adapt across three tiers:

| Tier | Breakpoint | Layout |
|------|-----------|--------|
| Desktop | >= 1200px | Featured (62%) + rail (33%) side by side |
| Tablet | 768-1199px | Featured full-width on top, rail below |
| Mobile | <= 767px | Image stacks above content, rail below, team detail uses bottom-sheet |

## Ownership

- **Spotlight-local:** Component, team strip, supporting tile, all styles and constants
- **Homepage-local shared:** `useResponsiveTier` hook
- **Homepage helpers:** `operationalAwarenessConfig.ts` (normalization), `authoringGovernance.ts` (empty/error state)
- **Contracts:** `operationalAwarenessContracts.ts` (data types and defaults)

## Accessibility

- Semantic HTML: `section`, `h2`, `h3`, `ul`, `li`, `button`, `a`
- Team detail panel: `role="dialog"`, Escape to close, focus return, outside-click dismissal
- Mobile bottom-sheet: backdrop overlay, `motion.div` animation respects `prefers-reduced-motion`
- Touch targets: >= 44px on all interactive elements
- Focus-visible: `.teamStripButton` class in `homepage-interactive.module.css`
- Images: `decoding="async"`, `loading="lazy"`, explicit `width`/`height` on avatars and thumbnails
- No hover-only dependencies

## Related docs

- [Phase Implementation Summary](../../../docs/architecture/plans/MASTER/spfx/homepage/projects/phase-01/09_Project_Spotlight_Phase_Implementation_Summary.md)
- [UI Doctrine SPFx Homepage Overlay](../../../docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md)
