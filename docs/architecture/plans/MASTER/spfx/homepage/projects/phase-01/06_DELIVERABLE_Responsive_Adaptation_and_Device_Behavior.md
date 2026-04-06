# Phase 06 Deliverable — Responsive Adaptation and Device Behavior

> **Phase:** 06 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Breakpoint-aware layout, responsive rail, touch-safe team detail, image/text adaptation
> **Governing docs:** UI Doctrine SPFx Governing Standard, UI Doctrine SPFx Homepage Overlay, Phase 01 anatomy freeze
> **Version:** 1.0.0.71

---

## A. Responsive Behavior Summary

### Desktop (>= 1200px)

- Featured spotlight (~62%) and supporting rail (~33%) render side by side
- Featured layout: image zone (48%) left, content zone (52%) right
- Team detail uses anchored popover positioned below the trigger
- Full editorial text widths with `ch`-unit max-width constraints

### Tablet (768-1199px)

- Featured spotlight takes full width on top
- Supporting rail stacks below with a top border separator (replaces left border)
- Featured layout stays horizontal: image zone narrows to 40%, content zone 60%
- Image zone minimum height reduces to 240px
- Team detail popover widens (minWidth: 280, maxWidth: 360)
- Header horizontal padding unchanged (24px)

### Mobile (<= 767px)

- Featured spotlight takes full width
- Featured layout becomes **vertical**: image stacks above content
- Image zone: bounded height (200-240px), full width
- Content zone: reduced padding (16px), title font size reduced to 1.25rem
- Text max-width constraints removed (full width available)
- Summary line clamp increased to 4 lines (compensates for narrower column)
- Supporting rail stacks below with tighter horizontal padding
- Header horizontal padding reduces to 16px

### Cross-cutting

- Featured project remains the clear primary story at all breakpoints
- Supporting items are always visually subordinate
- Layout uses `flexDirection: 'column'` for tablet/mobile (explicit stacking, not relying on flex-wrap reflow)

---

## B. Interaction Fallback Summary

### Team detail panel

| Tier | Presentation | Behavior |
|------|-------------|----------|
| Desktop | Anchored popover (absolute, below trigger) | Click to open, Escape/outside-click to close |
| Tablet | Anchored popover (wider: 280-360px) | Same as desktop |
| Mobile | Fixed bottom-sheet (pinned to viewport bottom) | Slide-up entrance via `motion.div`, semi-transparent backdrop overlay, tap backdrop to dismiss, Escape to close |

### Bottom-sheet specifics (mobile)

- `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`
- `borderRadius: '12px 12px 0 0'` for a native sheet appearance
- `maxHeight: 60vh` with `overflowY: auto` for long team lists
- Backdrop overlay (`rgba(0, 0, 0, 0.3)`) blocks interaction with content behind
- `motion.div` provides slide-up animation, respects `prefers-reduced-motion`
- Team strip wrapper uses `position: static` on mobile (panel is viewport-fixed, not trigger-relative)

### Touch target compliance

| Element | Before | After |
|---------|--------|-------|
| Team strip button | No explicit min-height | `minHeight: 44px`, `padding: 4px 8px` |
| Detail close button | `padding: 2px 6px` | `minWidth: 44px`, `minHeight: 44px`, flex-centered |
| Detail list items | `padding: 6px 14px` | Mobile: `padding: 10px 16px`, `minHeight: 44px` |
| Rail tiles | No explicit min-height | `minHeight: 44px` |

### Hover safety

- `SupportingTile` hover effect (`onMouseEnter`/`onMouseLeave`) is enhancement-only
- No functionality depends on hover state
- Touch devices simply never trigger hover — tiles remain fully functional

### Keyboard accessibility

- Team strip button gains `.teamStripButton` CSS class with `:focus-visible` outline treatment
- All existing keyboard interactions (Escape, focus return) preserved

---

## C. Residual Limitations

1. **Viewport vs container width.** `useResponsiveTier` reads `window.innerWidth`, not the webpart container width. In SPFx, the webpart may render in a narrower column than the full viewport. A future enhancement could use `ResizeObserver` on the webpart root element for true container-width adaptation. This matches the current approach used by other ui-kit hooks (`useAdaptiveDensity`, `useIsMobile`).

2. **No intermediate tablet breakpoint.** The tablet tier covers 768-1199px as a single range. A future refinement could distinguish narrow tablet (768-1023px) from wide tablet (1024-1199px) if needed.

3. **Bottom-sheet lacks drag-to-dismiss.** The mobile bottom-sheet closes via backdrop tap or Escape. A swipe-down gesture would improve the native mobile feel but requires additional touch event handling.

4. **No container queries.** CSS container queries would be the ideal long-term solution for component-level responsive adaptation in SPFx sections. Browser support is now broad enough, but this requires a CSS module rewrite that is better addressed in a future hardening pass.

---

## D. Reuse vs New Build Summary

### Reused

| Asset | Source | Notes |
|-------|--------|-------|
| `motion` | `@hbc/ui-kit/homepage` | Bottom-sheet entrance animation |
| `homepage-interactive.module.css` | `apps/hb-webparts/src/homepage/` | Extended with team strip focus and backdrop classes |
| Canonical breakpoint values | `packages/ui-kit/src/theme/breakpoints.ts` | Referenced (not imported) for threshold alignment |
| All existing featured/rail/team code | `ProjectPortfolioSpotlight.tsx` | Adapted with tier-aware style functions |

### Built new (homepage-local)

| New code | Location | Why local |
|----------|----------|-----------|
| `useResponsiveTier` hook | `apps/hb-webparts/src/homepage/shared/useResponsiveTier.ts` | Homepage-local, follows `useAdaptiveDensity` pattern |
| `ResponsiveTier` type | Same file | Exported for consumer use |
| `.teamStripButton` CSS class | `homepage-interactive.module.css` | Focus-visible treatment |
| `.teamDetailBackdrop` CSS class | `homepage-interactive.module.css` | Mobile bottom-sheet overlay |
| Tier-aware style functions | `ProjectPortfolioSpotlight.tsx` | `get*Style(tier)` pattern replaces static style objects |

### Promotion candidates (future)

| Candidate | Promotion trigger |
|-----------|-------------------|
| `useResponsiveTier` hook | If 2+ non-homepage consumers need tier detection |
| Bottom-sheet panel primitive | If the pattern proves reusable in other webparts |

---

## E. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (466 KB JS, 22.5 KB CSS) |
| `test` | 13 pre-existing failures, 0 new failures introduced |
| Featured dominant at all tiers | Yes — full-width featured always renders first |
| Supporting items subordinate | Yes — rail below with lighter visual weight |
| Team detail touch-safe | Yes — bottom-sheet on mobile, touch targets >= 44px |
| Text/imagery readable | Yes — scaled font sizes, bounded image heights, removed max-width constraints on mobile |
| Hover enhancement-only | Yes — no functionality gated on hover |
