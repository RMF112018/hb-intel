# Homepage Anti-Pattern Register — HB Central

## Purpose

This register catalogs every visual behavior in the current homepage implementation that must be eliminated during the Phase 15 redesign. Each entry identifies the anti-pattern, where it exists in code, and why it fails the premium standard.

This register is binding. If a listed anti-pattern survives into the final implementation, the work is incomplete.

---

## AP-01: White-Card Sameness

**What it is:** Nearly all 10 homepage webparts render through `HbcHomepageSurfaceCard`, which maps to `HbcCard` with only three weight tiers (`primary`, `standard`, `supporting`). The visual difference between tiers is minimal — slightly different shadow depth and background shade. The result is a page of near-identical white rectangles.

**Where it appears:**
- `packages/ui-kit/src/HbcHomepageSurfaceCard/index.tsx` — surface-to-weight mapping
- `packages/ui-kit/src/HbcCard/index.tsx` — weight-based styling with `elevationLevel0`/`1`/`2`
- Every webpart in `apps/hb-webparts/src/webparts/` consumes `HbcHomepageSurfaceCard`

**Why it fails:** A page of visually identical containers destroys hierarchy. The user cannot distinguish zone purpose from visual treatment alone. Premium products differentiate surfaces by purpose, not by shadow depth alone.

---

## AP-02: Invisible Zone Differentiation

**What it is:** Zone backgrounds use rgba tints at 0.02–0.03 opacity (e.g., `rgba(34,83,145,0.03)` for top band, `rgba(229,126,70,0.02)` for communications). These tints are imperceptible on most displays.

**Where it appears:**
- `apps/hb-webparts/src/homepage/tokens.ts` — `zoneBackgrounds` object

**Why it fails:** Zone differentiation that is invisible is not differentiation. Premium pages use meaningful background shifts, surface treatment changes, or compositional breaks to signal zone transitions.

---

## AP-03: Placeholder-Grade Iconography

**What it is:** `HbcHomepageIconFrame` renders small icon containers (20px/28px) with muted tints (`rgba(0,0,0,0.04)` for subtle, `rgba(34,83,145,0.08)` for brand). Icons are generic Fluent UI icons at small sizes with low visual impact.

**Where it appears:**
- `packages/ui-kit/src/HbcHomepageIconFrame/index.tsx`
- Used in `PriorityActionsRail`, `ToolLauncherWorkHub`, `SmartSearchWayfinding`

**Why it fails:** Small, muted icons in barely-visible frames read as placeholder content. Premium utility surfaces use larger, more confident icon treatments with distinct visual weight per context.

---

## AP-04: Low-Tension Grid Composition

**What it is:** All zones use the same flex-wrap layout with a uniform 12px gap (`hpZoneFlexLayout`). Featured and secondary items sit in the same flow with minimal size differentiation. There is no compositional tension between zones.

**Where it appears:**
- `apps/hb-webparts/src/homepage/tokens.ts` — `hpZoneFlexLayout` helper
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` — every zone uses the same layout pattern

**Why it fails:** Uniform grid composition makes the page feel like a single repeated module. Premium pages create visual tension through varied column widths, asymmetric layouts, and deliberate breaks in the grid rhythm.

---

## AP-05: Overuse of Thin Borders and Light Shadows

**What it is:** Cards rely on `1px solid colorNeutralStroke1` borders and Fluent `elevationLevel0`/`elevationLevel1` shadows for definition. Both are nearly invisible, creating surfaces that blur together.

**Where it appears:**
- `packages/ui-kit/src/HbcCard/index.tsx` — border and shadow application
- `apps/hb-webparts/src/homepage/tokens.ts` — `borderStrength` tokens (`rgba(0,0,0,0.08)` for subtle, `rgba(0,0,0,0.12)` for standard)

**Why it fails:** When borders and shadows are the primary means of surface definition and both are barely visible, surfaces lose their edges. Premium surfaces are defined by background contrast, spacing, and compositional position — not by faint borders.

---

## AP-06: List-Like Launcher Behavior

**What it is:** `ToolLauncherWorkHub` renders grouped tiles as flat text links with small icons. The only visual distinction is that the first item in each group gets a slightly larger icon and a bottom separator. The result reads as a categorized link list.

**Where it appears:**
- `apps/hb-webparts/src/webparts/ToolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- Tile rendering with `launcherTilePrimary` CSS class for first-item emphasis

**Why it fails:** A link list is the lowest-effort launcher pattern. Premium launcher surfaces use tile grids, icon-forward layouts, or card-based groupings that give each tool a visual identity and make the launcher feel like a command surface.

---

## AP-07: Generic Search Treatment

**What it is:** `SmartSearchWayfinding` renders a plain `<input type="text">` inside a box with `rgba(0,0,0,0.015)` background and `8px` border-radius. The search feels like a form field, not a discovery entry point.

**Where it appears:**
- `apps/hb-webparts/src/webparts/SmartSearchWayfinding/SmartSearchWayfinding.tsx`
- `apps/hb-webparts/src/homepage/homepage-interactive.module.css` — `.searchInput` class

**Why it fails:** Search is one of the most-used homepage interactions. A plain text input with minimal styling communicates "we added search" rather than "we built a discovery product." Premium search treatments use prominent sizing, visual weight, iconography, suggested queries, and category-aware presentation.

---

## AP-08: Timid Top-Band Treatment

**What it is:** The top band renders `PersonalizedWelcomeHeader` and `HbHeroBanner` as two side-by-side flex items (`flex: 1 1 280px` and `flex: 2 1 440px`) inside a flex-wrap container. They read as two separate cards placed next to each other, not as an integrated opening sequence.

**Where it appears:**
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` — top band zone
- Welcome header renders in a `primary` weight card with a 4px blue left border
- Hero renders with a gradient background but sits beside the welcome as a peer, not as part of a unified composition

**Why it fails:** The top band is the homepage's first impression. Two cards sitting side by side is not a signature moment. Premium homepages use a single, commanding top-band composition that integrates greeting, hero content, and brand presence into one seamless visual statement.

---

## AP-09: Surface Interchangeability

**What it is:** Editorial surfaces (Company Pulse, Leadership Message, People & Culture), operational surfaces (Project Spotlight, Safety), and discovery surfaces all use the same card structure with the same internal layout: heading, metadata row, paragraph, CTA link. The only visual difference is a left-border accent color on operational cards.

**Where it appears:**
- All webparts in `apps/hb-webparts/src/webparts/` use `HbcHomepageSurfaceCard` → `HbcCard`
- Internal layout follows the same pattern: `<h3>` + `HbcHomepageMetadataRow` + `<p>` + `HbcHomepageCta`

**Why it fails:** When editorial, operational, and discovery surfaces look the same, the page loses functional legibility. Users cannot tell at a glance whether they are looking at a news item, a project status update, or a resource directory. Premium pages give each content type a distinct visual treatment.

---

## AP-10: Uniform Padding, Radius, and Spacing

**What it is:** All zones use `16px` section padding, `8px` border-radius, and `12px` gap. Card internal padding varies only slightly by weight tier (8–20px). The result is a page where every surface feels the same size and shape.

**Where it appears:**
- `apps/hb-webparts/src/homepage/tokens.ts` — `hpZoneSection()`, spacing scale, border radius tokens
- Applied uniformly across all zones in `ReferenceHomepageComposition.tsx`

**Why it fails:** Uniform metrics erase compositional hierarchy. Premium pages use deliberate variation — tighter spacing for utility surfaces, more generous spacing for editorial surfaces, larger radius for hero elements, tighter radius for data-dense modules.

---

## AP-11: Weak CTA Treatment

**What it is:** CTAs across the homepage use a single link style (`#225391`, `fontWeight: 600`, arrow indicator) or a small button variant. There is no visual distinction between a primary page-level CTA and a secondary card-level link.

**Where it appears:**
- `packages/ui-kit/src/HbcHomepageCta/index.tsx` — link, button, and secondary variants
- Used identically across hero, editorial, and operational cards

**Why it fails:** When all CTAs look the same, none feel important. Premium pages use a clear CTA hierarchy: prominent primary actions, distinct secondary actions, and subtle tertiary links.

---

## AP-12: Flat Metadata Presentation

**What it is:** `HbcHomepageMetadataRow` renders horizontal rows of small badges and text with optional separators. The metadata is present but visually flat — small type, low contrast, and uniform treatment regardless of context.

**Where it appears:**
- `packages/ui-kit/src/HbcHomepageMetadataRow/index.tsx`
- Used in hero, editorial, operational, and discovery surfaces identically

**Why it fails:** Metadata should reinforce content hierarchy, not flatten it. Premium editorial surfaces use metadata to create visual rhythm (dates, categories, authors), while operational surfaces use metadata to communicate status and urgency. One-size-fits-all metadata treatment misses both opportunities.

---

## Summary

The current homepage is technically competent but visually generic. It uses a small set of shared primitives applied uniformly across all zones, creating a page that reads as "organized scaffolding" rather than "premium product." The Phase 15 redesign must eliminate every pattern listed above and replace each with a purpose-built treatment that serves the specific zone's function and emotional register.
