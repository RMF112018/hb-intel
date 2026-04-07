# Phase 07 — Responsive Proof and Handoff

## 1. Responsive Proof Summary

### What was validated across width tiers

| Tier | Width | Shell | Body | Command band | Flagship grid | Shelves | Overlay |
|------|-------|-------|------|-------------|---------------|---------|---------|
| **Desktop** | ≥1200px | 16px gap/pad | 2fr/1fr side-by-side | 3-col (title, search, actions) | 240px min, 16px gap | 180px min auto-fill | Inline panel, 60vh |
| **Tablet** | 768–1199px | 16px gap/pad | 1fr stacked | 3-col (auto-wraps) | 240px min, 16px gap | 180px min auto-fill | Inline panel, 60vh |
| **Mobile** | ≤767px | 12px gap/pad | 1fr stacked | 2-col (search hidden, "Need Help" hidden) | 160px min, 12px gap | 180px min auto-fill | Inline panel, 60vh |

### Tier detection

Uses the existing `useResponsiveTier()` hook (`apps/hb-webparts/src/homepage/shared/useResponsiveTier.ts`) — proven in `ProjectPortfolioSpotlight` and other homepage webparts. Listens for `resize` and `orientationchange` events.

### Authoring context validation

| Context | Behavior |
|---------|----------|
| Read mode with data | Full 4-region composition |
| Read mode, empty list | `listEmpty` authoring message |
| Edit mode with data | Same as read mode (list-governed) |
| Edit mode, empty list | Same `listEmpty` authoring message |
| Config fallback (no SPFx) | Flat `HbcLauncherSurface` bridge |
| Fetch error | Silent fallback to config |

## 2. Composition Outcome

### How the launcher now behaves within the homepage Utility zone

The launcher is a responsive, 4-region premium marketplace surface:

1. **Command band** adapts from 3-column to 2-column at mobile, hiding the search placeholder (users access overlay search via "All Platforms" button) and "Need Help" button (help links remain in utility rail)
2. **Body grid** stacks flagship stage + utility rail from side-by-side (desktop) to vertical (tablet/mobile), preserving flagship-first hierarchy through stacking order
3. **Flagship cards** grid reduces min-width from 240px to 160px at mobile, allowing 1–2 cards per row on narrow screens
4. **Utility rail** receives full width when stacked, with all 4 sections (notices, help, access, contacts) independently suppressible
5. **Workflow shelves** auto-fill grid reflows naturally at all widths — no tier-specific override needed
6. **All-platforms overlay** renders as inline panel at all tiers with live search, category grouping, and 3 dismissal methods

### Hierarchy survival at reduced widths

The 3-tier card hierarchy (flagship 56px/column → shelf 40px/row → index 32px/row) is structurally intact at all tiers. Responsive changes adjust density and layout direction, not visual weight or component structure.

### Component inventory (Phase 07 state)

| # | Component | Tier-aware | How |
|---|-----------|-----------|-----|
| 1 | `LauncherCompositionShell` | Yes | `tier` prop → body stacking, compact padding |
| 2 | `LauncherCommandBand` | Yes | `tier` prop → 2-col mobile, search/help hidden |
| 3 | `LauncherFlagshipStage` | Yes | `tier` prop → reduced grid min-width at mobile |
| 4 | `LauncherFlagshipCard` | No | Column layout adapts via CSS |
| 5 | `LauncherUtilityRail` | No | Section cards are width-agnostic |
| 6 | `LauncherWorkflowShelves` | No | Auto-fill grid reflows |
| 7 | `LauncherShelfCard` | No | Row layout with ellipsis |
| 8 | `LauncherAllPlatformsOverlay` | No | Single-column list, inherently narrow-safe |
| 9 | `LauncherIndexRow` | No | Row layout with flex/ellipsis |

3 of 9 components are explicitly tier-aware. The other 6 are inherently responsive via CSS auto-fill grids, flexible layouts, and ellipsis overflow.

## 3. Remaining Debt

### Deferred to later phases

| Debt | Owner | Description |
|------|-------|-------------|
| **Logo asset deployment** | Ops | All cards use Lucide fallback icons until SVG logos deployed to HBCentral |
| **Command band search wiring** | Phase 08 | Read-only placeholder on desktop; hidden on mobile. Needs live search behavior. |
| **Audience context from SPFx** | Runtime | `activeAudience` prop exists but SPFx mount doesn't extract audience from user profile |
| **Overlay mobile sheet** | Future | Overlay uses inline panel at all tiers; full-screen sheet on mobile could improve usability |
| **Flagship card compact mode** | Future | Cards maintain full 56px/column layout on mobile; horizontal compact variant possible |
| **Touch target validation** | Future | All interactive elements ≥44px min-height but untested on real touch devices |
| **SharePoint narrow web part zone** | Future | Behavior in <600px SP column contexts untested |
| **Stale-content detection** | Future | No staleness indicator using `LastReviewedOn` field |
| **Favorites / recently-used** | Future | No persistence model |
| **Real device testing** | Future | Requires SPFx deployment; structural validation only so far |

### NOT deferred (resolved in this phase)

| Item | Resolution |
|------|-----------|
| Body stacking at tablet/mobile | P07-01: `getBodyStyle(tier, hasRail)` |
| Compact shell padding at mobile | P07-01: `getShellStyle(tier)` |
| Command band search/button suppression | P07-02: `tier` prop with conditional rendering |
| Flagship grid density at mobile | P07-02: `getGridStyle(tier)` with 160px min |
| Authoring and degraded-state documentation | P07-03: comprehensive per-region analysis |

## 4. Handoff Recommendation

### Next recommended phase

**Phase 08 — Search Contract and Discovery Model** remains the recommended next phase per the original phase plan.

### Entry conditions for Phase 08

1. Phase 07 validation checklist complete (all items checked)
2. `apps/hb-webparts` builds cleanly — typecheck, lint, and build all pass
3. Responsive contract locked with 3 named tiers and documented regional behavior
4. Tier-aware adaptation implemented in composition shell, command band, and flagship stage
5. Authoring and degraded-state behavior documented across all launcher regions
6. All-platforms overlay search already functional (Phase 06) — Phase 08 should wire the command band search to the same or compatible logic

### What Phase 08 should focus on

- Wire the command band search input to live search behavior (currently read-only placeholder on desktop, hidden on mobile)
- Evaluate whether command band search should open the overlay or perform inline filtering
- Consider search scope: within featured/shelved platforms or across the full inventory
- Consider search result formatting: inline results vs overlay activation
- Preserve the responsive contract — search UX must work across all tiers
