# Phase 05 Deliverable — Project Team Strip and Detail Layer

> **Phase:** 05 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Team avatar strip, initials fallback, overflow indicator, anchored detail panel with focus management
> **Governing docs:** Phase 01 anatomy freeze (C.5, C.6), UI Doctrine SPFx Homepage Overlay

---

## A. Team Layer Summary

### Avatar strip

The Project Team strip renders inside the featured spotlight content zone, between the badge row and the CTA. It shows:

- Up to 5 circular avatar photos (30px) with overlapping layout (-8px margin)
- Initials fallback for members without photos (blue-tinted circle, first+last initial)
- `+N` overflow indicator when the team exceeds 5 members (warm-tinted circle)
- A compact label: `[Users icon] N team`

The strip is a `<button>` element, making it keyboard-focusable and screen-reader-accessible without hover-only discovery. When clicked or activated via keyboard, it opens the detail panel.

### Detail panel

An anchored panel positioned below the strip shows the full team roster:

- "Project Team" header with close button (✕)
- Full list of team members with 36px avatars (or initials), display name, and optional role
- `role="dialog"` with `aria-label` for screen readers
- Escape key closes the panel and returns focus to the trigger button
- Outside click dismissal

### Graceful degradation

| State | Behavior |
|-------|----------|
| 0 members | Strip not rendered — no empty placeholder |
| 1 member | Single avatar + label, panel shows 1 row |
| 5 members | All visible, no overflow badge |
| 6+ members | 5 visible + `+N` overflow, panel shows all |
| No photos | All initials — visually coherent |
| Mixed photos | Photos and initials intermixed naturally |

---

## B. Interaction Choice Rationale

**Chosen pattern:** CSS-positioned anchored panel (absolutely positioned below the trigger).

**Why this pattern:**

1. **No new dependencies required.** The approved premium stack includes `@floating-ui/react`, but it is not re-exported from `@hbc/ui-kit/homepage` and not currently a dependency of `hb-webparts`. A simple CSS-positioned panel achieves the same result for this use case without adding a dependency.

2. **Lightweight and proportional.** The detail panel shows a short list of names and photos — it does not need complex repositioning logic, collision detection, or viewport-aware placement. An absolutely positioned panel anchored to the trigger is sufficient.

3. **Focus management is native.** Escape key handling and focus return are implemented via `useEffect` + `keydown` listener. Outside click dismissal uses `mousedown` listener. No focus trap library needed for this small, non-modal panel.

4. **Not a modal.** The panel is an anchored flyout, not a modal overlay. It doesn't dim the background, doesn't prevent scrolling, and doesn't require portal rendering. This matches the "teaser first, detail on demand" principle.

5. **Upgrade path clear.** If the panel needs viewport-aware positioning in later phases (e.g., when near the bottom of the page), `@floating-ui/react` can be added as a dependency and the positioning logic upgraded without changing the component structure.

---

## C. Reuse vs New Build Summary

### Reused

| Asset | Source | Notes |
|-------|--------|-------|
| `Users` icon | `@hbc/ui-kit/homepage` (lucide) | Team strip label icon |
| `ProjectTeamMember` type | `operationalAwarenessContracts.ts` | New type, shares file with existing contracts |
| `normalizeTeamMembers()` | `operationalAwarenessConfig.ts` | New function, shares file with existing normalization |
| All existing featured/rail code | `ProjectPortfolioSpotlight.tsx` | Unchanged except placeholder replaced |

### Built new (Spotlight-local)

| New code | Location | Why local |
|----------|----------|-----------|
| `ProjectTeamStrip` component | `ProjectPortfolioSpotlight.tsx` | Spotlight-specific interaction and placement |
| `getInitials()` helper | `ProjectPortfolioSpotlight.tsx` | Simple utility, not worth promoting |
| Avatar strip styles | `ProjectPortfolioSpotlight.tsx` | Spotlight-specific visual treatment |
| Detail panel with focus management | `ProjectPortfolioSpotlight.tsx` | Spotlight-specific anchored flyout |
| `ProjectTeamMember` interface | `operationalAwarenessContracts.ts` | New data contract |
| `normalizeTeamMembers()` | `operationalAwarenessConfig.ts` | Validation for new field |

### Promotion candidates (future)

| Candidate | Promotion trigger |
|-----------|-------------------|
| Generic avatar strip primitive | If 2+ homepage webparts need avatar rows |
| Generic anchored detail panel | If the pattern proves reusable beyond Spotlight |

Neither is promoted now — local-first ownership until reuse is proven.

---

## D. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (463 KB bundle, 3.02s) |
| Strip supports the card | Yes — compact, subordinate to editorial content |
| 0 members | Confirmed — strip not rendered |
| 1 member | Confirmed — single avatar + label |
| 5 members | Confirmed — all visible, no overflow |
| 6+ members | Confirmed — 5 visible + "+1" overflow (manifest has 6 team members) |
| Missing photos | Confirmed — initials fallback renders correctly |
| Focus management | Confirmed — keyboard open, Escape close, focus return |
| Outside click dismissal | Confirmed — mousedown handler closes panel |
