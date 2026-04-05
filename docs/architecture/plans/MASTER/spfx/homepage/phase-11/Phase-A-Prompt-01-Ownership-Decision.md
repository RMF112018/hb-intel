# Phase A Prompt 01 — Shared/Local Ownership Decision

## Decision Date

2026-04-05

## Context

Phase A requires upgrading the homepage shared visual infrastructure before webpart-level premiumization. This decision establishes which primitives are promoted to `@hbc/ui-kit/homepage` versus kept local in `apps/hb-webparts/src/homepage/shared/`.

## Promoted to `@hbc/ui-kit/homepage`

| Primitive | Rationale |
|-----------|-----------|
| `HbcHomepageSectionShell` | Used by all 5 homepage zones. The foundational section wrapper with accessible heading, subtitle, and intro support. |
| `HbcHomepageCta` | CTA links appear across editorial, utility, discovery, and operational surfaces. Replaces scattered inline `hpCtaLink` style usage with a governed, accessible component. |
| `HbcHomepageMetadataRow` | Badge/date/signal rows appear in 6+ webparts. Provides consistent flex layout, spacing, and label typography for metadata presentation. |
| `HbcHomepageIconFrame` | Icon containers needed in launcher tiles, discovery quick-paths, and utility destinations. Replaces the placeholder `iconToken()` hack with a proper sized, branded frame. |
| `HbcHomepageSurfaceCard` | Homepage needs surface-class-aware card variants beyond the generic `HbcCard`. Maps surface classes (hero, editorial, utility, operational, discovery) to appropriate weight and density. |

## Kept local in `apps/hb-webparts/src/homepage/shared/`

| Primitive | Rationale |
|-----------|-----------|
| `HomepageCuratedContentCluster` | One-off editorial choreography (featured/secondary grid) specific to content families. |
| `HomepageOperationalAwarenessCluster` | Same featured/secondary pattern — content-family-specific layout. |
| `HomepageDiscoveryCluster` | Complex interactive component with search, quick-paths, resources — too content-specific for shared. |
| `HomepageEditorialCard` | Thin content-model wrapper over HbcCard — not a reusable visual primitive. |
| `HomepageSpotlightCard` | Content-model wrapper with spotlight-specific fields. |
| `HomepagePersonRecognitionCard` | Content-model wrapper with person-specific fields. |
| `HomepageTopBandPair` | Specialized top-band flex layout — zone-specific composition. |
| `HomepageUtilityDenseGroup` | Utility-zone density wrapper — candidate for later promotion if reuse emerges. |
| `HomepageUtilityTile` | Utility-zone tile — candidate for later promotion. |
| `HomepageRailShell` | Thin `role="region"` wrapper — too minimal for shared until it gains visual substance. |
| `HomepageEmptyState` | Thin wrapper around `HbcEmptyState` with homepage padding. |
| `HomepageLoadingState` | Thin wrapper around `HbcSpinner` with homepage layout. |

## Why This Split Is Correct

1. **Promotion rule**: Only primitives with 3+ zone consumers or clear multi-surface reuse are promoted. Content-family-specific compositions stay local.
2. **Doctrine compliance**: The UI Doctrine SPFx Homepage Overlay (section 6) requires promotion only when "2+ meaningful consumers outside homepage AND visually aligned with HB design language." The promoted primitives meet this bar within the homepage surface class taxonomy.
3. **No over-promotion**: Content clusters, content-model cards, and zone-specific layouts remain local. These are editorial choreography, not reusable visual primitives.
4. **Token discipline**: Promoted primitives use existing ui-kit tokens (grid, radii, typography, elevation). The local `HP_SPACE`/`HP_CTA`/`HP_ZONE` tokens remain in `apps/hb-webparts/src/homepage/tokens.ts` — they are composition-layer tokens, not primitive tokens.

## Assumptions Carried Into Prompt 02

- Prompt 02 will implement the full visual treatment for each promoted primitive.
- The local shared shells/clusters will be upgraded in Prompt 03 to consume the new shared primitives.
- Webpart migration to the new shared language happens in Prompt 04.
- No consumer migration was done in this prompt beyond scaffolding.
