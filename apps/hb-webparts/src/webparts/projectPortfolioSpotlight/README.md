# Project / Portfolio Spotlight

Thin SPFx integration consumer for the **Project / Portfolio Spotlight**
homepage section. The authored presentation grammar (featured hero,
image-led composition, team strip + detail panel, supporting rail) lives
in the shared `HbcProjectSpotlightSurface` family in `@hbc/ui-kit/homepage`.
This webpart owns only data fetch, normalization, and view-model mapping.

## Manifest

- **ID:** `8370ab0c-b6df-4db0-82f1-24b54750f508`
- **Zone:** Operational Awareness
- **Alias:** `ProjectPortfolioSpotlightWebPart`
- **Version:** `0.0.22.0`

## Data source

**Primary:** SharePoint list `Homepage Project Spotlights` via REST API.
**Fallback:** Manifest `preconfiguredEntries` seed data (local dev / demo only).

The list is fetched when SPFx context provides a site URL. Items are
filtered server-side by `HomepageEnabled eq 1` and client-side by publish
window (`PublishStart`/`PublishEnd`). Audience filtering, stale detection,
and featured-vs-secondary partitioning happen during normalization.

Field mapping, fetch logic, and raw-to-contract mapping live in
`homepage/data/projectSpotlightListSource.ts`. The fetch hook with
5-minute cache is in `homepage/data/useProjectSpotlightData.ts`. Site URL
storage is in `homepage/data/spContext.ts`.

## Ownership boundary

| Layer | What lives there |
|-------|------------------|
| **Shared UI (`@hbc/ui-kit/homepage`)** | `HbcProjectSpotlightSurface` — the full authored surface family: root shell, header, separator, featured composition, image-safe rendering, team strip + detail panel, supporting rail, hover/focus states, responsive CSS, reduced-motion handling. Reuses `HbcAvatarStack` for the project team visual. |
| **Webpart (local)** | This file — calls `useProjectSpotlightData()`, normalizes via `normalizeProjectPortfolioSpotlightConfig`, resolves empty/loading/authoring states, and maps the normalized collection into a `ProjectSpotlightSurfaceModel` before passing it to `HbcProjectSpotlightSurface`. |
| **Homepage data/helpers (local)** | `spContext.ts`, `projectSpotlightListSource.ts`, `useProjectSpotlightData.ts`, `operationalAwarenessConfig.ts` (normalization), `operationalAwarenessContracts.ts` (business contracts), `authoringGovernance.ts`, `visibility.ts`. |
| **Homepage shared loading/empty (local)** | `HomepageLoadingState`, `HomepageEmptyState`. |

No presentation grammar remains local to the webpart: all featured-image
rendering, avatar strip behavior, popover/bottom-sheet detail panel,
rail tiles, and tier-aware layout are now governed by the shared surface
family and its CSS module.

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

Items are sorted deterministically: `featured: true` first, then by
`order`, then by recency (`freshness.updatedAt`), then alphabetically by
title. The first item after sorting becomes the featured project. Stale
items are demoted to the end of the supporting rail.

## Responsive behavior

Responsive layout is now handled entirely by the shared surface family's
CSS module via viewport media queries. No `useResponsiveTier` hook is
used by the consumer.

| Breakpoint | Layout |
|-----------|--------|
| `< 768px` (mobile) | Featured image stacks above content; rail below featured; team detail panel becomes a fixed bottom sheet. |
| `768–1199px` (tablet) | Featured image + content side-by-side; rail stacks below featured. |
| `>= 1200px` (desktop) | Featured (~70%) and rail (~30%) side-by-side; team detail panel becomes a popover. |

## Media reliability

Media safety, image fallbacks, and avatar initials fallbacks are
implemented inside `HbcProjectSpotlightSurface` — no local safe-media
components in this webpart. The surface renders a branded gradient
placeholder behind every featured image, swaps to a gradient placeholder
on rail-thumbnail error, and delegates avatar fallbacks to `HbcAvatarStack`.

## Accessibility

All accessibility guarantees now live in the shared surface:

- Semantic HTML: `section`, `h2`, `h3`, `ul`, `li`, `button`, `a`
- Team detail panel: `role="dialog"`, `aria-haspopup="dialog"`, Escape to
  close, focus return, outside-click dismissal
- Mobile bottom-sheet: backdrop overlay, motion animation respects
  `prefers-reduced-motion`
- Touch targets: >= 44px on all interactive elements
- Focus-visible outlines on the team strip button and rail tiles
- Images: `decoding="async"`, `loading="lazy"`, explicit dimensions,
  `onError` fallbacks
- CLS prevention: `contain` on image zones and thumbnail wrappers

## Migration status

Cleanly migrated to shared presentation-lane ownership. The full
authored spotlight grammar moved into `@hbc/ui-kit/homepage` under
`HbcProjectSpotlightSurface`. Only data/business-logic plumbing,
normalization, authoring-state resolution, and view-model mapping remain
local.

## Related docs

- [UI-Kit Project Spotlight completion report](../../../../docs/architecture/reviews/project-spotlight-ui-kit-migration-completion.md)
- [People & Culture precedent](../../../../docs/architecture/reviews/people-culture-ui-kit-migration-completion.md)
- [UI System Layer Model](../../../../docs/reference/ui-kit/UI-System-Layer-Model.md)
