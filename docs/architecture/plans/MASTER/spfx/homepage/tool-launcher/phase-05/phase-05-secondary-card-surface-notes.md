# Phase 05 — Secondary Card Surface Notes

## 1. Shelf Surface Anatomy

Each workflow shelf renders as:

```
<div data-launcher-shelf="{shelfId}">         [shelf container, grid gap 10px]
  <div>                                        [heading row, flex, subtle bottom border]
    <span>{shelfName}</span>                   [uppercase 0.78rem, muted]
    <span>{platformCount}</span>               [count badge, gray]
  </div>
  <div>                                        [card grid, auto-fill minmax(180px, 1fr)]
    <LauncherShelfCard platform={p} />         [per platform]
    ...
  </div>
</div>
```

### Shelf grid

- `gridTemplateColumns: repeat(auto-fill, minmax(180px, 1fr))`
- Gap: 8px (`HP_SPACE.md`)
- Narrower min-width than flagship grid (180px vs 240px) — more cards per row at equal width
- Cards fill available space responsively

### Heading row

- Flex row with shelf name + count badge
- Subtle bottom border separator (`HP_BORDER.subtle`)
- Count badge shows `platformCount` from enriched contract

## 2. Secondary Card Anatomy

### What a shelf card contains

| Element | Treatment | Size/Style |
|---------|-----------|------------|
| **Logo container** | 40px square, rounded corners, subtle blue background | Smaller than flagship (56px) |
| **Logo content** | Image via `resolveLogoAsset()`, or Lucide icon fallback, or monogram | Same 5-step resolution chain as flagship |
| **Platform name** | 0.8rem, weight 600, single-line with ellipsis overflow | Smaller than flagship (0.92rem) |
| **Descriptor** | 0.68rem, muted, single-line with ellipsis overflow | Optional — card renders without it |
| **Click target** | Whole-card `<a>` element | Same pattern as flagship |

### What a shelf card intentionally excludes

| Excluded | Why |
|----------|-----|
| **CTA row** ("Launch" + ExternalLink icon) | Only flagship cards have explicit CTA rows — shelf cards use whole-card click |
| **Notice badge** | Notices render in the utility rail, not on secondary cards |
| **Spring motion** (hover scale, tap compression) | Only flagship cards get `motion.a` — shelf cards use CSS transition only |
| **Column layout** | Shelf cards use horizontal row layout; flagship uses vertical column |

### Layout comparison

| Property | Flagship card | Shelf card |
|----------|--------------|------------|
| Layout | Column (vertical) | Row (horizontal) |
| Logo container | 56px | 40px |
| Logo icon size | 26px | 20px |
| Name font | 0.92rem / 650 | 0.8rem / 600 |
| Descriptor font | 0.78rem | 0.68rem |
| Grid min-width | 240px | 180px |
| Grid gap | 16px | 8px |
| CTA row | Yes ("Launch" + ExternalLink) | No |
| Notice badge | Yes | No |
| Motion | Spring (motion.a) | CSS transition (background only) |
| Border | `HP_BORDER.standard` | `HP_BORDER.subtle` |
| Padding | 16px | 8px × 10px |
| Min height | — | 44px (touch target) |

## 3. Hierarchy Protection

### Structural differentiation

The shelf card is structurally different from the flagship card at every level:

1. **Layout direction** — horizontal vs vertical prevents visual confusion
2. **Logo size** — 40px vs 56px creates immediate size-based hierarchy
3. **Typography** — smaller name and descriptor prevent shelf cards from matching flagship visual weight
4. **Border strength** — subtle vs standard border reduces shelf card prominence
5. **Padding** — tighter padding makes shelf cards compact vs flagship's generous spacing
6. **Motion** — no spring animation (only CSS background transition) keeps shelf cards flat
7. **CTA** — no explicit CTA row makes shelf cards simpler and quieter
8. **Grid density** — 180px min-width packs more cards per row, creating a denser secondary grid vs flagship's spacious 240px

### What prevents regression

If someone changes the shelf card to match the flagship card (column layout, 56px logo, CTA row, motion), it would require changing multiple independent properties. The differentiation is structural, not just stylistic.

## 4. Degraded States

### Missing logo asset

Same 5-step resolution chain as flagship:
1. Record `logoAssetRef` → `<img>`
2. Asset manifest governed logo → `<img>`
3. Manifest fallback Lucide icon → 20px icon
4. Monogram → 0.9rem letter
5. Platform/category icon → 20px icon

`onError` handler on `<img>` falls back to Lucide icon without layout shift (40px container preserved).

### Missing descriptor

Card renders name only. The horizontal layout still reads well — logo + name is sufficient.

### Missing category

Icon resolution falls through to platform-specific or default icon. Card structure unchanged.

### Partial shelf (few platforms)

Grid auto-fill naturally handles shelves with 1–3 platforms. Cards stretch to fill available columns. No empty-slot placeholders.

## 5. Promotion Guidance

### Should remain local

| Component | Why local |
|-----------|----------|
| `LauncherShelfCard` | Launcher-specific medium-weight card with launcher domain data (`LauncherPlatformRecord`). No second consumer exists. |
| `LauncherWorkflowShelves` | Launcher-specific shelf grouping and rendering. Shelf contract is domain-specific. |
| `launcherAssetResolution.ts` | Uses inline manifest data specific to the launcher's platform set. |
| `launcherIconResolution.ts` | Platform-specific and category-specific icon maps. |

### Might later deserve shared extraction

| Element | Condition for promotion |
|---------|----------------------|
| The 40px logo container pattern | If other homepage webparts need a compact logo-aware container (e.g., a people/team directory card) |
| The `resolveLogoAsset()` pattern (not the data) | If brand-asset resolution becomes a cross-surface concern with 2+ consumers |
| The shelf heading row pattern (title + count badge) | If other webparts adopt categorized secondary groupings |

Promotion requires a real second consumer — do not promote speculatively.
