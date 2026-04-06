# Phase 02 Deliverable — Featured Spotlight Anatomy and Desktop Composition

> **Phase:** 02 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Featured spotlight shell — image-led editorial composition, desktop-first
> **Governing docs:** Phase 01 deliverable (ownership map, anatomy freeze), UI Doctrine SPFx Governing Standard, SPFx Homepage Overlay

---

## A. Implementation Summary

### What was built

The Project Spotlight webpart has been structurally rebuilt from a dashboard-adjacent `HbcOperationalSurface` into a premium, image-led editorial composition. The featured spotlight now renders as a side-by-side layout:

- **Image zone** (48% width): project photography with `object-fit: cover`, center crop, and a subtle bottom-to-top readability scrim. Graceful placeholder when no image is configured.
- **Content zone** (52% width): editorial hierarchy following the required reading order — eyebrow (sector/location), project title, highlight headline, milestone/freshness metadata row, summary (3-line clamp), restrained badge row, team strip placeholder, and primary CTA.

The warm accent styling system is aligned with `HbcEditorialSurface`: 3px warm left border (`rgba(229, 126, 70, 0.40)`), warm gradient separator, white background with editorial box shadow.

### What was intentionally deferred

| Concern | Deferred to | Reason |
|---------|-------------|--------|
| Supporting rail | Phase 03 | Featured surface must prove hierarchy first |
| Project team avatar strip | Phase 05 | Team strip slot is reserved (`data-slot="team-strip"`) |
| Team detail layer | Phase 05 | Interaction choreography deferred |
| Responsive adaptation | Phase 06 | Desktop-first composition established first |
| Stale badge display | Phase 07 | Ranking/freshness refinement phase |
| Image aspect ratio enforcement | Phase 06 | Responsive behavior phase |

### Contract extensions

`ProjectPortfolioSpotlightItem` now includes:
- `image?: HomepageMediaSlot` — project photography
- `highlightHeadline?: string` — editorial headline distinct from title
- `location?: string` — project location
- `sector?: string` — project sector/market

### Normalization extensions

`normalizeProjectPortfolioSpotlightConfig()` now validates and trims the new fields. `HomepageMediaSlot` is validated for non-empty `src`. All new fields are optional — the component degrades gracefully when any are missing.

---

## B. Reuse vs New Build Summary

### Reused from ui-kit (`@hbc/ui-kit/homepage`)

| Primitive | Usage |
|-----------|-------|
| `HbcPremiumCta` | Featured CTA (secondary variant, sm, arrow) + header "View all projects" (ghost) |
| `HbcPremiumBadge` | Status badge + strategic badge (sm, restrained to 2 max) |
| `HbcHomepageEyebrow` | Sector/location eyebrow above project title |
| `HbcHomepageMetadataRow` | Milestone progress + freshness label (separated) |
| `motion` | Featured reveal animation (opacity + y translate, 0.3s) |
| `Calendar`, `CheckCircle2` | Metadata row icon accents (11px) |

### Reused from homepage helpers

| Asset | Usage |
|-------|-------|
| `normalizeProjectPortfolioSpotlightConfig()` | Core normalization — extended, not replaced |
| `byPriority()` | Ranking sort — reused as-is |
| `resolveFreshness()` | Staleness computation — reused as-is |
| `resolveAuthoringMessage()` | Empty/invalid state messages — reused as-is |
| `HomepageEmptyState` | Empty state rendering — reused as-is |
| `HomepageLoadingState` | Loading state rendering — reused as-is |
| `HomepageMediaSlot` | Image type from content models — reused as-is |

### Built new (Spotlight-local)

| New code | Location | Why local |
|----------|----------|-----------|
| Warm accent palette (`WARM` constants) | `ProjectPortfolioSpotlight.tsx` | Aligned with HbcEditorialSurface but Spotlight-specific composition |
| Side-by-side featured layout | `ProjectPortfolioSpotlight.tsx` | Image + content composition is Spotlight-specific |
| Image zone with scrim | `ProjectPortfolioSpotlight.tsx` | Project photography treatment is Spotlight-specific |
| Image placeholder | `ProjectPortfolioSpotlight.tsx` | Graceful fallback for unconfigured images |
| Content hierarchy styles | `ProjectPortfolioSpotlight.tsx` | Editorial typography tuned for this surface |
| Team strip placeholder slot | `ProjectPortfolioSpotlight.tsx` | Reserved for Phase 05 |

All new code remains local to `src/webparts/projectPortfolioSpotlight/` — no premature promotions to shared or ui-kit.

---

## C. Hierarchy Rationale

The featured spotlight now reads as the dominant story surface because:

1. **Image leads.** The 48% image zone creates immediate visual weight. The subtle bottom-to-top scrim preserves impact without flattening the photograph.

2. **Title dominates content.** At `1.375rem` / `700` weight with tight letter-spacing (`-0.02em`), the project name is the strongest text element and reads immediately after the image.

3. **Highlight headline bridges.** The `0.9375rem` / `500` weight headline provides editorial context between the title and metadata without competing for hierarchy.

4. **Metadata is subordinate.** Milestone progress and freshness are rendered via `HbcHomepageMetadataRow` at label scale with icon accents at 50% opacity — informative but not dominant.

5. **Summary is contained.** 3-line clamp at `0.8125rem` / 60% opacity prevents text sprawl while preserving enough editorial excerpt.

6. **Badges are restrained.** Maximum 2 badges (status + strategic), `sm` size, placed below summary — not competing with the title or headline.

7. **CTA is terminal.** `HbcPremiumCta` in `secondary` variant at the bottom of the content zone — clearly the action destination after the reader has absorbed the story.

8. **Chrome is minimal.** No additional dividers, card frames, or icon containers within the featured content. The warm left accent border and gradient separator provide surface identity without noise.

### What was removed vs Phase 17

| Removed | Reason |
|---------|--------|
| `HbcOperationalSurface` wrapper | Wrong surface family — dashboard, not editorial |
| `BarChart3` header icon | Dashboard metaphor, not editorial |
| `Briefcase` signal icons | Operational signal pattern removed |
| Severity-colored signal rows | Dashboard pattern incompatible with editorial direction |
| Stale badge on featured | Deferred to Phase 07 (ranking/freshness refinement) |
| Secondary items rendering | Deferred to Phase 03 (supporting rail) |

---

## D. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (457 KB bundle, 2.16s) |
| Featured is premium editorial | Yes — image-led, warm accent, editorial hierarchy |
| Does not read as dashboard card | Confirmed — no severity colors, no signal rows, no chart icons |
| Content hierarchy stable with realistic text | Confirmed — 3-line clamp on summary, constrained badge count |
| Missing data fails gracefully | Confirmed — image placeholder, optional headline/location/sector, empty state for no items |
