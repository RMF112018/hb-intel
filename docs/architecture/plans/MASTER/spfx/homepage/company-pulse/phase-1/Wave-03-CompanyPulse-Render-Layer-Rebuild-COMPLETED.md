# Wave 03 — CompanyPulse Render-Layer Rebuild (Completed)

> **Status:** Locked
> **Completed:** 2026-04-07
> **Source charter:** `Wave-03-CompanyPulse-Render-Layer-Rebuild.md`

---

## 1. What Changed

Replaced the `HbcEditorialSurface` delegation with a custom premium newsroom composition that directly consumes the Wave 02 newsroom primitives. The component now follows the same composition pattern as `ProjectPortfolioSpotlight` — inline-styled responsive composition with brand palette, staggered motion, and zone-separated hierarchy.

### Before (Wave 01)
- Delegated to generic `HbcEditorialSurface`
- Flat featured + secondary list
- No responsive tiers
- No motion
- No image zone with scrim
- No custom brand palette
- No sparse-state handling beyond empty state

### After (Wave 03)
- Custom premium newsroom composition with `NewsroomFeaturedStory` + `NewsroomHeadlineStack`
- Three-tier hierarchy: lead story → headline stack → tertiary zone
- Responsive tiers (desktop: 65/35 flex split, tablet: stacked, mobile: compact)
- Staggered entrance motion with reduced-motion support
- Image-led featured zone with scrim overlay and safe fallback
- Blue-authority brand palette from `NR_PALETTE`
- Three layout modes: rich (lead + secondary), sparse (lead only), headline-only (no lead)
- Tertiary zone with category chips and archive CTA
- Premium root container (blue left accent, brand shadow, 12px radius)

---

## 2. Compositional Hierarchy

| Zone | Component | Width (desktop) | Purpose |
|------|-----------|-----------------|---------|
| **Header** | Inline styled | Full | Brand icon + title + "See all" CTA |
| **Separator** | `<hr>` gradient | Full | Blue-to-orange brand gradient |
| **Lead story** | `NewsroomFeaturedStory` | ~65% | Image zone + scrim + headline + byline + date + category chip + CTA |
| **Headline stack** | `NewsroomHeadlineStack` | ~35% | Subordinate rail with icon + title + metadata per item |
| **Tertiary zone** | `TertiaryZone` | Full | Category chips + "View all news" archive CTA |

### Layout modes

1. **Rich layout** — Lead + secondary exist: side-by-side on desktop, stacked on tablet/mobile, tertiary zone below
2. **Sparse layout** — Lead only: featured story fills width, archive CTA below
3. **Headline-only** — No lead, secondary only: full-width headline stack with tertiary zone

---

## 3. People & Culture Benchmark Alignment

| P&C Benchmark Trait | CompanyPulse Implementation |
|---|---|
| **One premium surface, not multiple weak boxes** | Single root container with blue-authority left accent, brand shadow, internal zone separation |
| **Strong dominant-vs-supporting hierarchy** | Lead story at 65% vs headline stack at 35%, visually decisive asymmetry |
| **Sparse-state resilience** | Dedicated `SparseLayout` — lead story fills full width with archive CTA, no blank-space failure |
| **No flat separator-only layouts** | Gradient separator, zone-tinted backgrounds, image scrim — rhythm from composition not dividers |
| **Better zoomed-out legibility** | Larger headline font (1.1875rem desktop), image zone prominence, category chips for scanning |

### Newsroom tuning (not P&C celebration)

- **Blue-led** palette instead of warm cream/orange
- **Headline-driven** hierarchy instead of person-centric
- **Navigation CTAs** ("Read story", "View all news") instead of action CTAs ("Celebrate", "Give Kudos")
- **Editorial metadata** (byline, publishDate, category chip) instead of celebration metadata (recipients, celebrate count)
- **No avatars or person references** — newsroom content is article-centric

---

## 4. Verification Results

- **check-types:** pass
- **lint:** pass (0 errors, 0 warnings)
- **build:** pass (549.01 KB JS, 24.98 KB CSS — +8.4 KB from newsroom primitives now consumed)
- **tests:** 22/22 pass on changed scope; pre-existing failures in unrelated files unchanged
