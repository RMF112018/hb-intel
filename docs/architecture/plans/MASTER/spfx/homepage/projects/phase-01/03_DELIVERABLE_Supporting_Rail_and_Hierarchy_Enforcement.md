# Phase 03 Deliverable — Supporting Rail and Hierarchy Enforcement

> **Phase:** 03 of 08
> **Status:** Complete
> **Date:** 2026-04-06
> **Scope:** Supporting rail tiles, desktop featured+rail composition, hierarchy enforcement
> **Governing docs:** Phase 01 ownership map, Phase 02 featured anatomy, UI Doctrine SPFx Homepage Overlay

---

## A. Desktop Composition Summary

The Project Spotlight now renders as a two-zone desktop composition:

### Layout structure
```
┌─────────────────────────────────────────────────────────────────┐
│  Project Spotlight                          [View all projects →]│
├─────────────────────────────────────────────────────────────────┤
│                                    │                            │
│  ┌────────────┐ ┌───────────────┐  │  ALSO IN PROGRESS          │
│  │            │ │ Eyebrow       │  │                            │
│  │  Featured  │ │ TITLE         │  │  ┌────┐ Project Name      │
│  │  Image     │ │ Headline      │  │  │img │ Location · Sector  │
│  │  (48%)     │ │ Milestones    │  │  └────┘ [Status Badge]    │
│  │            │ │ Summary       │  │  ─────────────────────     │
│  │            │ │ Badges        │  │  ┌────┐ Project Name      │
│  │            │ │ [Team strip]  │  │  │img │ Location · Sector  │
│  │            │ │ [CTA →]       │  │  └────┘ [Status Badge]    │
│  └────────────┘ └───────────────┘  │  ─────────────────────     │
│         ~65% featured              │  ┌────┐ Project Name      │
│                                    │  │img │ Location · Sector  │
│                                    │  └────┘ [Status Badge]    │
│                                    │        ~35% rail           │
└─────────────────────────────────────────────────────────────────┘
```

### Featured zone (~65%)
- Side-by-side image (48%) + content (52%) layout
- Minimum width: 400px (triggers vertical stack when viewport narrows)
- Full editorial hierarchy from Phase 02 preserved

### Supporting rail (~35%)
- Vertical stack of 3–5 compact tiles separated by warm-accent borders
- "Also in progress" label header in muted uppercase
- Left border separator between featured and rail zones
- Minimum width: 240px
- Flex-wrap fallback: stacks below featured when space is insufficient

### Narrow-width behavior
The composition uses `flex-wrap: wrap` with minimum widths. When the container cannot fit both zones side by side:
- Featured wraps to full width
- Rail stacks below as a full-width column
- No explicit breakpoint needed — flexbox handles the transition

---

## B. Hierarchy Enforcement Summary

The featured spotlight remains the undeniable primary story through these deliberate design decisions:

| Decision | Featured | Supporting rail |
|----------|----------|-----------------|
| **Image size** | 48% of featured zone, min 280px height | 72×54px thumbnail |
| **Title font** | 1.375rem, weight 700 | 0.8125rem, weight 600, single-line ellipsis |
| **Content depth** | Eyebrow + title + headline + metadata + summary + badges + CTA | Title + metadata line + optional badge |
| **Flex allocation** | 62% flex basis | 33% flex basis |
| **Animation** | 0.3s reveal with y-translate | 0.25s fade, 150ms delay (enters after featured) |
| **Interactivity** | Dedicated CTA button (secondary variant) | Whole-tile clickable (no button CTA) |
| **Badge count** | Up to 2 (status + strategic) | Maximum 1 (status only) |
| **Summary text** | 3-line clamp excerpt | None — title + meta only |
| **Headline** | Highlight headline paragraph | None |
| **Team strip slot** | Reserved (Phase 05) | None |

### What prevents equal-weight reading
1. **Scale ratio** — featured image is ~15x the area of a rail thumbnail
2. **Content asymmetry** — featured has 7 content slots; rail tiles have 3
3. **Staggered reveal** — rail fades in 150ms after featured finishes animating
4. **Visual weight** — featured zone takes ~2/3 of horizontal space
5. **No CTA competition** — rail tiles use whole-tile click, no button elements

---

## C. Reuse vs New Build Summary

### Reused from Phase 02 (unchanged)

| Asset | Notes |
|-------|-------|
| Featured spotlight composition | Entire featured zone preserved from Phase 02 |
| Warm accent palette (`WARM`) | Extended with `tileHover` and `tileSeparator` values |
| All ui-kit primitives | `HbcPremiumCta`, `HbcPremiumBadge`, `HbcHomepageEyebrow`, `HbcHomepageMetadataRow`, `motion`, icons |
| Normalization pipeline | `normalizeProjectPortfolioSpotlightConfig()` already produces `secondary[]` |
| Empty/loading states | Unchanged |
| Design tokens | `HP_SPACE`, `HP_RADIUS`, `HP_IMAGE` |

### Built new (Spotlight-local)

| New code | Purpose | Why local |
|----------|---------|-----------|
| `SupportingTile` component | Compact image-led tile for secondary projects | Spotlight-specific tile anatomy |
| Rail wrapper + header | Vertical tile stack with "Also in progress" label | Spotlight-specific rail layout |
| Desktop composition wrapper | Flex container enforcing 65/35 featured/rail split | Spotlight-specific layout |
| `railMotion` constants | Staggered fade for rail (after featured) | Spotlight-specific choreography |
| Whole-tile click logic | `<a>` or `<div>` based on CTA presence | Spotlight-specific interaction |
| Hover state management | Warm accent hover on tiles | Spotlight-specific visual feedback |

### Manifest updates
- Added 2 additional secondary items (Boca Raton Corporate Campus, Jupiter Inlet Marina Renovation) with image, location, sector, and freshness data
- Renamed existing secondary item ID for consistency (`project-secondary` → `project-secondary-1`)
- Total preconfigured items: 1 featured + 3 secondary (validates 3-item rail)

---

## D. Validation Results

| Check | Result |
|-------|--------|
| `check-types` | Pass (0 errors) |
| `lint` | Pass (0 errors, 0 warnings) |
| `build` | Pass (459 KB bundle, 2.20s) |
| Featured visually dominant on first scan | Confirmed — 65% width, large image, strong typography |
| Supporting items scannable but secondary | Confirmed — compact tiles, muted metadata, no CTA buttons |
| Rail not cluttered | Confirmed — title + meta + optional badge per tile |
| Works with 3 items | Confirmed — manifest preconfigured with 3 secondary items |
| Works with 4–5 items | Structural support confirmed — `maxSecondaryItems` config governs |
| No equal-weight visual balance | Confirmed — deliberate asymmetry in all dimensions |
