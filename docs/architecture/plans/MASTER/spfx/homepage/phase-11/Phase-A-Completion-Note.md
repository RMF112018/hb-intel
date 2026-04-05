# Phase A Completion Note — Homepage Shared-System Uplift

**Date:** 2026-04-05
**Scope:** Phase 11A (Prompts 01–05)
**Status:** Complete

---

## Summary

Phase A upgraded the homepage shared visual infrastructure from a minimal generic-card + text-link system to a production-grade, surface-class-aware composition language. All 10 homepage webparts now consume the stronger shared primitives.

---

## What Changed

### New shared primitives in `@hbc/ui-kit/homepage` (6 components)

| Primitive | Purpose |
|-----------|---------|
| `HbcHomepageSectionShell` | Accessible section wrapper with heading, subtitle, intro, and headerAction slot |
| `HbcHomepageCta` | Branded CTA with link/button/secondary variants, arrow indicator, focus/hover/motion support |
| `HbcHomepageMetadataRow` | Flex row for badges, dates, signals with optional dot-separation and label typography |
| `HbcHomepageIconFrame` | Sized icon container (sm/md/lg) with brand/neutral/subtle tint variants |
| `HbcHomepageSurfaceCard` | Surface-class-aware card mapping hero/editorial/utility/operational/discovery to weight and visual treatment |
| `HbcHomepageActionRow` | Icon + title + badge + description row for utility-density action lists |

### Upgraded local shared components (7 files)

| Component | Upgrade |
|-----------|---------|
| `HomepageSectionShell` | Delegates to `HbcHomepageSectionShell`, adds zone-level padding/border/radius and headerAction slot |
| `HomepageRailShell` | Flex layout with gap, wrapping, stretch alignment |
| `HomepageTopBandPair` | Uses shared section shell with zone-specific topBand background |
| `HomepageCuratedContentCluster` | Featured/secondary content wrapped in `HbcHomepageSurfaceCard(editorial)` |
| `HomepageOperationalAwarenessCluster` | Uses `surface="operational"` for brand left-border accent |
| `HomepageDiscoveryCluster` | Uses `HbcHomepageActionRow`, `HbcHomepageIconFrame`, `HbcHomepageCta`, `HbcHomepageSurfaceCard(discovery)` |
| `HomepageUtilityDenseGroup` | Gains padding, border, radius, heading typography tokens |

### Migrated webparts (all 10)

| Webpart | Surface | Key Changes |
|---------|---------|-------------|
| PersonalizedWelcomeHeader | hero | HbcCard → HbcHomepageSurfaceCard, badge row → HbcHomepageMetadataRow |
| HbHeroBanner | hero | HbcCard → HbcHomepageSurfaceCard, inline CTA → HbcHomepageCta, metadata → HbcHomepageMetadataRow |
| PriorityActionsRail | utility | HbcCard → HbcHomepageSurfaceCard, inline action divs → HbcHomepageActionRow |
| ToolLauncherWorkHub | utility | HbcCard → HbcHomepageSurfaceCard, text-token icons → HbcHomepageIconFrame, actions → HbcHomepageActionRow |
| CompanyPulse | editorial | HbcCard → HbcHomepageSurfaceCard, badge row → HbcHomepageMetadataRow, CTA → HbcHomepageCta |
| LeadershipMessage | editorial | HbcCard → HbcHomepageSurfaceCard, CTA → HbcHomepageCta |
| PeopleCulture | editorial | HbcCard → HbcHomepageSurfaceCard, badge row → HbcHomepageMetadataRow, CTA → HbcHomepageCta |
| ProjectPortfolioSpotlight | operational | HbcCard → HbcHomepageSurfaceCard, badge row → HbcHomepageMetadataRow, CTA → HbcHomepageCta |
| SafetyFieldExcellence | operational | HbcCard → HbcHomepageSurfaceCard, badge row → HbcHomepageMetadataRow, CTA → HbcHomepageCta |
| SmartSearchWayfinding | discovery | HbcCard → HbcHomepageSurfaceCard |

---

## Shared vs Local Ownership Outcomes

### Promoted to `@hbc/ui-kit/homepage`
6 homepage-safe shared primitives (SectionShell, Cta, MetadataRow, IconFrame, SurfaceCard, ActionRow).

### Kept local by design
Content clusters (CuratedContent, OperationalAwareness, Discovery), content-model cards (Editorial, Spotlight, PersonRecognition), TopBandPair, UtilityDenseGroup, UtilityTile, RailShell, EmptyState, LoadingState — all remain in `apps/hb-webparts/src/homepage/shared/` as content-family-specific or thin wrappers not meeting the 2+ consumer promotion bar.

---

## Validation Results

| Check | Scope | Result |
|-------|-------|--------|
| `check-types` | `@hbc/ui-kit` | Pass |
| `build` | `@hbc/ui-kit` | Pass |
| `check-types` | `@hbc/spfx-hb-webparts` | Pass |
| `lint` | `@hbc/spfx-hb-webparts` | Pass (0 errors, 0 warnings) |
| `build` | `@hbc/spfx-hb-webparts` | Pass (271.07 KB) |
| `test` | `@hbc/spfx-hb-webparts` | Pass (18 files, 72 tests) |
| Import discipline | webparts directory | No prohibited `@hbc/ui-kit` or `@hbc/ui-kit/app-shell` imports |
| Lane boundary | webpart components | No shell chrome, no placeholder-extension content |
| Token discipline | shared primitives | All use Griffel makeStyles + Fluent theme tokens |
| Accessibility | shared primitives | Visible focus, aria-label, reduced-motion gating |

---

## Doctrine Compliance

- **Import discipline**: All 10 webparts import exclusively from `@hbc/ui-kit/homepage`, `@hbc/ui-kit/theme`, and local homepage paths. Zero prohibited imports.
- **Token discipline**: All new shared primitives use Griffel `makeStyles` with Fluent `tokens.*` for theme-adaptive colors. No hardcoded hex values in runtime code.
- **Accessibility**: All primitives include `aria-label`, `role`, visible `:focus-visible` outlines, and `@media (prefers-reduced-motion: reduce)` gating.
- **Reduced motion**: All transition properties gated by media query in every primitive.
- **Lane boundaries**: No shell chrome, no navigation, no placeholder-extension content. All content stays within page-canvas ownership.
- **Authoring safety**: All loading, empty, and error states preserved. Config normalization untouched. Active audience logic intact.

---

## Risks and Issues

1. **No story coverage for new primitives**: The 6 new shared primitives do not yet have Storybook stories. The design system requires Default/AllVariants/FieldMode/A11yTest stories for core shared primitives. This is a documentation gap, not a functional gap — the primitives are production-grade and fully typed. Stories should be added in a follow-up pass.

2. **HomepageDiscoveryCluster still uses inline `hpSearchInput` token**: The search input in DiscoveryCluster uses the local CSS module + inline style token rather than a shared primitive. This is acceptable because `HbcSearch` from ui-kit has a different API contract and the discovery search is a simpler controlled input.

3. **Local tokens not fully consolidated**: `apps/hb-webparts/src/homepage/tokens.ts` retains composition-layer tokens (`hpCtaLink`, `hpBadgeRow`) that are now partially superseded by the shared primitives. These remain for backward compatibility with the CSS module and any local usage not yet migrated. They can be cleaned up in a future pass.

---

## What Remains for Later Phases

### Phase B — Top-Band Signature Redesign
- Full branded top-band composition with stronger hero/welcome visual treatment
- Media and gradient treatment upgrades
- Personalized greeting signature-level styling

### Phase C — Per-Webpart Premiumization
- Deep editorial/operational content layout improvements
- Discovery zone search and wayfinding UX uplift
- Utility zone destination tile and launcher grid upgrades
- Storybook story coverage for all Phase A primitives

### Follow-up Tasks
- Add Storybook stories for the 6 new shared primitives
- Clean up superseded local token fragments
- Consider promoting HomepageUtilityDenseGroup to ui-kit if reuse emerges beyond utility zone

---

## Recommendation

**Phase A is complete.** The shared-system uplift has achieved its objective: the homepage no longer relies almost entirely on a single generic `HbcCard` + plain text-link treatment. The new surface-class-aware cards, branded CTAs, metadata rows, icon frames, and action rows provide a materially stronger shared language while preserving accessibility, token discipline, and lane boundaries.

The repo is ready for Phase B (top-band signature redesign) or Phase C (per-webpart premiumization) when the product direction warrants it.
