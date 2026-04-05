# Phase C Completion Note — Homepage Utility / Discovery Premiumization

**Status:** Complete
**Date:** 2026-04-05
**Commits:** P13-C01 through P13-C05

---

## Summary of Changes

Phase C redesigned the three highest-frequency utility and discovery surfaces on the HB Central homepage so they read as a coherent, product-grade action/navigation system rather than grouped text links in generic containers.

### PriorityActionsRail (P13-C02)
- Each action row now includes an **urgency-aware icon frame** with tint mapped from badge variant (critical/warning → brand "!" indicator, success → neutral "✓", default → subtle "›")
- **Hover-interactive containers** with subtle background transition and trailing directional arrow affordance
- **First-action urgency emphasis** via a left accent border on groups containing critical/warning badges
- All existing behavior preserved: config normalization, audience filtering, loading/empty states

### ToolLauncherWorkHub (P13-C03)
- Converted from flat action rows with small pseudo-icon text to **launcher-tile pattern**
- First item in each group: **medium-size brand-tint icon frame** with generous padding and a subtle bottom separator for primary destination emphasis
- Subsequent items: **small neutral-tint icons** for clear visual hierarchy
- All items wrapped in hover-interactive containers with directional arrow affordance

### SmartSearchWayfinding (P13-C04)
- **Search area** now renders inside a framed container (subtle background, border, padding) with uppercase section-label typography
- **Quick Paths** converted from plain CTA links to shortcut rows with brand-tint arrow icon frames, hover containers, and directional arrows
- **Promoted Destinations** upgraded to medium-size brand-tint icon frames inside hover containers
- **Category Groups** now render each resource inside hover-interactive containers with subtle-tint icon frames and directional arrows
- Section headings unified to uppercase label typography for consistent scan rhythm

### Baseline Architecture (P13-C01)
- Centralized duplicated icon-key resolution into `helpers/iconResolver.ts` (`resolveUtilityIconContent`, `resolveDiscoveryIconContent`)
- Removed dead `HomepageUtilityTile` component (zero consumers, superseded by `HbcHomepageActionRow`)
- Documented the Phase C shared/local ownership split

---

## Shared vs Local Ownership

### Shared primitives reused as-is (`@hbc/ui-kit/homepage`)
- `HbcHomepageActionRow` — primary row pattern across all three surfaces
- `HbcHomepageIconFrame` — icon containers with size/tint control
- `HbcHomepageSurfaceCard` — surface-class-aware card
- `HbcHomepageSectionShell` — section wrapper
- `HbcStatusBadge` — status badge treatment

### No new shared exports
Zero changes to `packages/ui-kit/`. All Phase C patterns stayed local because:
- No utility/discovery choreography has 2+ consumers outside the homepage package
- The promotion rule requires proven cross-package reuse before moving to `@hbc/ui-kit`

### Local additions
- `helpers/iconResolver.ts` — centralized icon-key-to-display mapping
- `homepage-interactive.module.css` — `actionRowContainer`, `actionRowArrow`, `actionRowUrgent`, `launcherTilePrimary` CSS classes
- Local composition components: `PriorityActionRowItem`, `LauncherTileItem`, `QuickPathRow`, `PromotedDestinationTile`, `CategoryResourceRow`

---

## Validation Results

| Check | Scope | Result |
|---|---|---|
| check-types | `apps/hb-webparts` | Pass |
| lint | `apps/hb-webparts` | Pass |
| build | `apps/hb-webparts` | Pass |
| test | `apps/hb-webparts` (72 tests, 18 files) | Pass |
| check-types | `packages/ui-kit` | Pass (cached, untouched) |
| build | `packages/ui-kit` | Pass (cached, untouched) |
| import discipline | All changed files | No prohibited `@hbc/ui-kit` or `@hbc/ui-kit/app-shell` imports |
| reduced-motion | CSS module | All interactive classes covered by `@media (prefers-reduced-motion)` blanket |
| shared boundary | `packages/ui-kit/` | Zero files changed |
| sppkg rebuild | `hb-webparts.sppkg` | Pass, `supportsFullBleed: true` preserved |

---

## Files Changed Across Phase C

### New files
- `apps/hb-webparts/src/homepage/helpers/iconResolver.ts`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-13/Phase-C-01-Ownership-Split-Note.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-13/Phase-C-Completion-Note.md`

### Modified files
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageDiscoveryCluster.tsx`
- `apps/hb-webparts/src/homepage/shared/index.ts`
- `apps/hb-webparts/src/homepage/homepage-interactive.module.css`
- `apps/hb-webparts/src/homepage/homepage-interactive.module.css.d.ts`
- `apps/hb-webparts/config/package-solution.json`

### Removed files
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityTile.tsx` (dead code)

---

## Risks and Issues

- **No visual regression testing** — changes validated structurally (types, lint, tests, build) but not via screenshot or browser rendering. Visual review recommended during staging deployment.
- **Pre-existing ui-kit lint error** — `packages/ui-kit` has 1 pre-existing lint error unrelated to Phase C. Not introduced or affected by this phase.

---

## What Remains for Later Phases

- **Richer icon treatment** — the icon resolver still produces short text content (initials/symbols). True SVG or Fluent icon integration would require authoring-schema extension and is deferred.
- **Backend-driven personalization** — priority actions and launcher items are statically authored. Dynamic ranking/scoring would require backend changes outside homepage scope.
- **Enterprise search integration** — the discovery surface uses curated-first client-side filtering. Server-side search is explicitly deferred per discovery strategy.
- **Visual regression testing** — a screenshot-based regression suite for the homepage surfaces would prevent future visual drift.

---

## Recommendation

Phase C is **complete**. The three utility/discovery surfaces are materially premiumized with coherent interaction patterns, no doctrine violations, and no shared-boundary over-promotion. The next recommended work is:

1. Visual review during staging deployment
2. Phase D (if planned) or broader homepage refinement work
3. Consider visual regression testing infrastructure
