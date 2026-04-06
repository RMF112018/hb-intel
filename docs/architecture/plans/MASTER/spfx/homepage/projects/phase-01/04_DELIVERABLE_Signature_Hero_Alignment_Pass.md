# Phase 04 Deliverable — Signature Hero Alignment Pass

> **Phase:** 04 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Quality-bar refinement — typography, spacing, image, chrome, motion alignment
> **Benchmark:** `HbHeroBanner.tsx` (Signature Hero standalone editorial surface)

---

## A. Hero Alignment Summary

Project Spotlight now belongs to the same premium homepage family as the Signature Hero through aligned design language, proportional to its role as a module-level surface (not a page-level hero).

### Typography alignment

| Property | Signature Hero | Project Spotlight | Alignment rationale |
|----------|---------------|-------------------|---------------------|
| **Title font-size** | 2.25rem (page hero) | 1.5rem (module headline) | Proportional authority: ~67% of hero scale |
| **Title letter-spacing** | -0.025em | -0.025em | **Matched** — same premium tracking |
| **Title line-height** | 1.12 | 1.15 | Near-match — slightly relaxed for multi-word project names |
| **Title max-width** | 22ch | 20ch | **Aligned** — constrained editorial text widths |
| **Body font-size** | 0.9375rem | 0.9375rem | **Matched** |
| **Body line-height** | 1.6 | 1.6 | **Matched** |
| **Body weight** | 400 | 400 | **Matched** (was 500, now aligned) |
| **Body max-width** | 48ch | 38ch (headline), 48ch (summary) | **Aligned** — editorial text constraints |
| **Body opacity** | 0.88 (on dark) | 0.78 (on light) | Proportional: equivalent legibility on respective backgrounds |
| **Metadata font-size** | 0.8125rem | 0.8125rem | **Matched** |
| **Metadata opacity** | 0.7 | 0.5 (icons), contextual text | Compatible — metadata is more subordinate in a module |

### Spacing alignment

| Property | Before | After | Hero reference |
|----------|--------|-------|----------------|
| Content padding | 20px / 16px | 24px uniform | Hero uses generous padding throughout |
| Content gap | 8px | 10px | Hero's inline gaps: 10px (brand), 16px (editorial) |
| Header padding | 20px / 16px | 20px / 24px | Consistent with content zone |
| Separator margin | 0 16px | 0 24px | Consistent with content zone |

### Image alignment

| Property | Before | After | Rationale |
|----------|--------|-------|-----------|
| Scrim gradient | 3-stop: 0.35 → 0.08 → transparent | 2-stop: 0.22 → transparent | Hero uses subtle scrim; less aggressive reads premium |
| Image zone bg | rgba(0,0,0,0.04) | rgba(0,0,0,0.025) | Lighter placeholder matches hero surface quality |
| Thumbnail bg | rgba(0,0,0,0.04) | rgba(0,0,0,0.025) | Consistent with featured zone |

### Chrome reduction

| Change | Before | After | Rationale |
|--------|--------|-------|-----------|
| Separator height | 2px | 1px | Hero has no visible separator; lighter feels premium |
| Separator opacity | 0.30 → 0.05 | 0.22 → 0.04 | Softer presence, less dashboard-like |
| Tile separator | rgba(229,126,70, 0.08) | rgba(229,126,70, 0.06) | Lighter borders, calmer surface |
| Team strip placeholder | 32px min-height | 16px min-height | Less wasted space before Phase 05 |

### Motion alignment

| Property | Before | After | Hero reference |
|----------|--------|-------|----------------|
| Featured y-translate | 8px | 6px | More restrained — hero uses choreographed surface |
| Featured duration | 0.3s | 0.35s | Slightly slower for premium feel |
| Rail timing | Unchanged | Unchanged | Already restrained (0.25s, 150ms delay) |

### CTA alignment

| Property | Before | After | Rationale |
|----------|--------|-------|-----------|
| Featured CTA size | sm | md | Hero uses lg; proportional module-level presence |

---

## B. Quality Bar Delta

### Changes from pre-alignment version

1. **Title gained authority.** `1.375rem` → `1.5rem` with tighter letter-spacing (`-0.025em` matching hero) and editorial max-width constraint (`20ch`). The project name now reads with the same deliberate typographic discipline as the hero headline.

2. **Headline weight softened.** `500` → `400` to match hero's body weight. The headline now feels like editorial body text rather than a semi-bold sub-header, creating cleaner hierarchy with the title.

3. **Summary text constrained.** Added `max-width: 48ch` (matching hero message width) and adjusted line-height to `1.6` (matching hero). Summary color opacity softened from `0.60` to `0.55` for less competition with headline.

4. **Image scrim softened.** Aggressive 3-stop gradient (35% → 8% → 0%) replaced with cleaner 2-stop (22% → 0%). The image reads richer and less processed — closer to the hero's photography-first approach.

5. **Spacing made generous and uniform.** Content zone padding unified to 24px and gap increased to 10px. The internal rhythm now feels deliberately spacious rather than tight and utility-like.

6. **Chrome reduced.** Separator thinned from 2px to 1px with lower opacity. Tile borders lightened. Team strip placeholder minimized. The surface overall feels calmer and less segmented.

7. **CTA given proportional presence.** `sm` → `md` gives the featured CTA enough visual weight to serve as the action destination without competing with the editorial content above it.

---

## C. Residual Gaps

| Gap | Target phase | Notes |
|-----|-------------|-------|
| Project team avatar strip | Phase 05 | Placeholder slot reserved; strip not yet implemented |
| Team detail layer interaction | Phase 05 | Anchored panel with @floating-ui/react |
| Responsive image treatment | Phase 06 | Featured image zone needs stacking behavior on narrow viewports |
| prefers-reduced-motion gate | Phase 06 | Motion tokens exist but not yet gated by media query |
| Stale badge display | Phase 07 | Staleness computed but badge display deferred |
| Accessibility audit | Phase 08 | Keyboard nav, focus management, screen reader testing |
| Performance validation | Phase 08 | Image loading, bundle impact, runtime profiling |

---

## D. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (459 KB bundle, 2.22s) |
| Compatible with Signature Hero | Yes — aligned typography, spacing, image, motion patterns |
| Does not duplicate hero | Confirmed — proportional treatment, not identical |
| Surface reads clearly with realistic data | Confirmed — text constraints prevent sprawl |
