# Phase 02 — Flagship Stage and Utility Rail Notes

## 1. Flagship Stage Skeleton

### What was built

`LauncherFlagshipStage.tsx` — a dedicated component rendering featured platforms at primary visual weight in a responsive auto-fill grid (`minmax(240px, 1fr)`).

### Card structure

Each flagship card includes:
- **Logo container** (56px × 56px) — ready for real brand asset images via `logoAssetRef`. When a logo reference exists, renders an `<img>` with `object-fit: contain` and 8px internal padding. When absent, renders the platform's fallback Lucide icon at 26px with brand-blue tinting.
- **Platform name** — 0.92rem, weight 650, high-contrast
- **Short descriptor** — 0.78rem, muted, 1.4 line-height for multi-line readability
- **Launch CTA row** — "Launch" label with ExternalLink icon (brand blue), positioned at the card bottom via `margin-top: auto`
- **Notice badge** — optional, inline with the CTA row, tone-colored (info/warning/critical/success/neutral) with matching background

### Hierarchy

Cards use `flexDirection: column` for vertical layout, stronger border treatment (`HP_BORDER.standard`), 16px padding, and semi-transparent white background — visually heavier than workflow shelf tiles. The grid gap is 16px (`HP_SPACE['2xl']`) vs 12px for shelves.

### Whole-card click target

Each card is an `<a>` element with `aria-label="Launch {name}"`. The entire card is the click target, following the architecture brief's flagship card CTA pattern.

## 2. Utility Rail Skeleton

### What was built

`LauncherUtilityRail.tsx` — a dedicated component rendering support/utility content in independently suppressible sections.

### Section structure

| Section | Icon | Data source | Suppression rule |
|---------|------|------------|------------------|
| **Platform Notices** | AlertCircle | `presentation.noticesSummary.activeNotices` | Hidden when no active notices |
| **Need Help** | Info | Platforms with `support.helpUrl` | Hidden when no platforms have help links |
| **Request Access** | Link2 | Platforms with `support.accessRequestUrl` | Hidden when no platforms have access-request URLs |

### Visual treatment

Each section uses the same quiet card treatment: subtle border, card radius, 10px padding, near-white background (`rgba(0,0,0,0.015)`). Section headings are 0.72rem uppercase with icon + label.

### Notices rendering

Each notice shows:
- **Platform name** (bold) + **notice label** as an inline badge with tone-appropriate coloring
- **Details** line below in smaller muted text (only when details field exists)
- Tone color map: info=brand blue, warning=warm orange, critical=red, success=green, neutral=gray

### Help links

Each help entry shows the platform name as a link to `support.helpUrl`, with the support owner name as a secondary label when available. Capped at 5 entries to prevent visual overflow.

### Access request links

Each access entry shows the platform name as a link to `support.accessRequestUrl`. Capped at 5 entries.

### Entire rail suppression

The rail returns `null` when all three sections have no data. The composition shell's body grid collapses from `2fr 1fr` to `1fr` automatically.

## 3. Data Dependencies

### Flagship stage

| Field | Required | Fallback |
|-------|----------|----------|
| `platformKey` | Yes | Dedup key |
| `name` | Yes | Card title |
| `launchUrl` | Yes | Navigation target |
| `isFeatured` | Yes (must be true) | Only featured platforms appear |
| `featuredSortOrder` | No | Default 999 — sorts to end |
| `descriptor` | No | Card renders without subtitle |
| `logoAssetRef` | No | Lucide fallback icon |
| `openInNewTab` | No | Default true |
| `notice.label`, `notice.tone` | No | Badge omitted if no notice |
| `category` | No | Used for fallback icon resolution |

### Utility rail — notices

| Field | Required | Fallback |
|-------|----------|----------|
| `notice.status` (≠ 'none') | Yes | Notice section hidden |
| `notice.label` | No | Falls back to status string |
| `notice.tone` | No | Default 'info' |
| `notice.details` | No | Details line omitted |

### Utility rail — help / access

| Field | Required | Fallback |
|-------|----------|----------|
| `support.helpUrl` | Yes for help section | Section hidden if no platforms have it |
| `support.supportOwnerName` | No | Owner label omitted |
| `support.accessRequestUrl` | Yes for access section | Section hidden if no platforms have it |

## 4. Fallback Behavior

### Logo degradation chain

1. `logoAssetRef` exists → render `<img>` in 56px container
2. `logoAssetRef` missing → check `PLATFORM_FALLBACK_ICON` by `platformKey` (9 known platforms from asset manifest)
3. Not in manifest → check `CATEGORY_ICON_MAP` by category
4. No category match → default `Settings` icon

### Missing descriptor

Card renders with name + CTA only. The `margin-top: auto` on the CTA row pushes it to the bottom regardless.

### Missing notice

Badge area in the CTA row is simply empty. No placeholder rendered.

### All support metadata missing

Each rail section independently evaluates its data. When all three sections (notices, help, access) have no data, the entire rail is suppressed and the body grid collapses.

### No featured platforms

`LauncherFlagshipStage` returns `null`. The composition shell's body region only renders the utility rail (if it has content) or is entirely absent.

## 5. Deferred Visual Deepening

| What | Phase | Description |
|------|-------|-------------|
| Real brand logo assets | Phase 03 | Replace fallback icons with actual vendor logos from the `@hbc/ui-kit` brand asset system via `logoAssetRef` |
| Flagship card hover/tap motion | Phase 03 | Add `motion.div` with scale and shadow transitions using the premium stack |
| Dark logo variant support | Phase 03 | Use `darkLogoAssetRef` for dark surface contexts |
| Favorites section in rail | Phase 04 | Add favorites toggle and persistence |
| Recently-used section in rail | Phase 04 | Track and display recent platform launches |
| Notice badge tone-to-icon mapping | Future | Add status-specific icons (outage → AlertTriangle, maintenance → Clock) |
| Platform notice detail overlay | Future | Expand notice details on click instead of inline text |
| Support owner profile link | Future | Link support owner name to profile/directory when `support.supportOwnerUrl` is available |
| Icon resolution consolidation | Phase 03 | Deduplicate icon maps currently duplicated between flagship stage and main component |
