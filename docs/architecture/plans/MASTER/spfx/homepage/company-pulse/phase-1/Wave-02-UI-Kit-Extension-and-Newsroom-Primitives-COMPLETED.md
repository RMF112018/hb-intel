# Wave 02 — UI Kit Extension and Newsroom Primitives (Completed)

> **Status:** Locked
> **Completed:** 2026-04-07
> **Source charter:** `Wave-02-UI-Kit-Extension-and-Newsroom-Primitives.md`

---

## 1. Primitive Inventory

All newsroom primitives are local to `apps/hb-webparts/src/homepage/shared/newsroom/` — they are not promoted to `@hbc/ui-kit` because they serve only the CompanyPulse newsroom surface. Promotion requires proven reuse by 2+ non-homepage consumers.

### NewsroomPalette.ts — editorial brand palette and motion tokens
- **NR / NR_PALETTE** — Blue-led authority palette tuned for newsroom content. Cooler than PeopleCulture's warm cream/orange palette. Includes root container styling, featured zone tint, image scrim, headline rail background, text hierarchy (text1–text4), separator gradients, and eyebrow/header icon colors.
- **NR_CATEGORY_COLORS** — Per-category color mapping (update→blue, safety→amber, recognition→emerald, milestone→orange) with bg/text/border triples for editorial chips.
- **getNrFeaturedMotion / getNrRailMotion** — Staggered entrance animations (featured first at 0.45s, rail with 0.15s delay at 0.3s) with reduced-motion sentinel.

### NewsroomFeaturedStory.tsx — premium lead article surface
- Image-led editorial composition with scrim overlay for headline readability.
- Desktop: side-by-side image (~55%) + content (~45%); tablet: same at 48%; mobile: stacked.
- Supports: category chip, headline, excerpt, byline attribution, publishDate with clock icon, CTA.
- Safe image fallback: `FileText` icon placeholder on load error or missing media.
- Modeled on ProjectPortfolioSpotlight's featured zone with newsroom retune.

### NewsroomHeadlineStack.tsx — subordinate headline rail
- Compact secondary story list with category chips, byline/date metadata.
- Each item: icon frame + title + metadata row (category chip, byline, date).
- Hover state transitions (150ms ease, cooler blue tint).
- Divider lines between items using newsroom palette.
- Optional section header ("More headlines" etc.).

### NewsroomCategoryChip.tsx — editorial category badge
- Compact chip with per-category color mapping from NR_CATEGORY_COLORS.
- Two sizes: sm (10px) and md (11px).
- Uppercase, weighted, letter-spaced — editorial scanning posture.
- Falls back to blue-authority styling for unknown categories.

### index.ts — barrel export
Exports all primitives and palette tokens for clean import by CompanyPulse in Wave 03.

---

## 2. Alignment with Spotlight-Family Quality

| Spotlight Trait | Newsroom Primitive Alignment |
|---|---|
| **Blue-authority root container** (4px left border, brand shadow) | `NR_PALETTE.rootBorder`, `NR_PALETTE.rootShadow` — same grammar, same weight |
| **Dominant featured zone** (~65% desktop) | `NewsroomFeaturedStory` at ~55% image + content — slightly more balanced for editorial scanning |
| **Image zone with scrim** | `NR_PALETTE.featuredScrim` — same gradient-to-top pattern, tuned for editorial readability |
| **Safe image fallback** | `FeaturedImage` with error state → `ImagePlaceholder` with branded icon |
| **Subordinate supporting rail** | `NewsroomHeadlineStack` with `NR_PALETTE.railBg` — same zone-separation tint strategy |
| **Hover states on rail items** | `railHover` tint + 150ms transition — same interaction quality as Spotlight tiles |
| **Staggered entrance motion** | `getNrFeaturedMotion` (0.45s) → `getNrRailMotion` (0.3s, 0.15s delay) — same pattern, slightly crisper |
| **Reduced-motion support** | `NR_NO_MOTION` sentinel — same approach as Spotlight |
| **Responsive tiers** | Desktop/tablet/mobile with flex-based layout adaptation — same breakpoint strategy |
| **Brand color hierarchy** | Blue-led text hierarchy (text1→text4) — same graduated opacity approach |

### What differs from People & Culture

| Trait | People & Culture | Newsroom |
|---|---|---|
| **Color temperature** | Warm cream + orange glow | Cool blue tint + blue shadow |
| **Eyebrow color** | Orange (`#E57E46`) | Blue (`#225391`) |
| **Featured accent** | Orange left border (5px) | Blue left border (4px, on root) |
| **Category chips** | HbcPremiumBadge (generic) | NewsroomCategoryChip (editorial colors) |
| **Rail mood** | Cool mist (celebration context) | Newsroom blue tint (editorial authority) |
| **Content model** | Person-centric (avatar, kudos) | Headline-centric (category, byline, date) |

---

## 3. Validation

### Primitive layer confirms support for:

- **Lead article materially more premium than current digest** ✓ — Image-led featured zone with scrim, category chip, byline, date, CTA replaces the flat `HbcEditorialSurface` delegation
- **Supporting content clearly subordinate** ✓ — Headline stack uses lighter rail background, smaller typography, compact item height
- **No fallback to generic white-card-grid** ✓ — Zone-separated composition with brand-colored container, tinted zones, and deliberate hierarchy

### Verification results

- **check-types:** pass
- **lint:** pass (0 errors, 0 warnings)
- **build:** pass (540.64 KB JS, 24.98 KB CSS — unchanged, primitives not yet consumed)
- **tests:** 19/19 pass on changed scope
