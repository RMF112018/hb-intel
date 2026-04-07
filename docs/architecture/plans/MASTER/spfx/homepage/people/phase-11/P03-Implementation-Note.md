# P03 — Implementation Note: People & Culture Rebuild

**Date:** 2026-04-07
**Phase:** 11 / P03 — Homepage People & Culture Rebuild
**Version:** 0.0.14

---

## What Changed Architecturally

### Focal Sequence Reversal

The render order changed from **Announcements → Kudos → Celebrations** to **Kudos → Announcements → Celebrations**. Kudos now leads the module, establishing warmth and participation as the first visual impression per the P01 Surface Blueprint.

### Region Suppression

Empty regions no longer render at all. The previous implementation always rendered all three regions (including per-region empty states like "No Kudos yet" and "No upcoming celebrations this week"). The rebuilt surface suppresses empty regions from the DOM entirely. Module-level empty state only appears when all three regions are empty.

### Unified Visual Language

Per-region box borders, backgrounds, and section headers have been replaced with:
- A single `HbcHomepageSectionShell` module header
- Eyebrow labels (uppercase, caption-scale) for region identification
- `Separator` rhythm between adjacent rendered regions
- No per-region border or background tint — the module boundary is the only visible container

### Rail-First Layout

The primary design target is now a 300-400px narrow column:
- Single column throughout (no grids in rail mode)
- Compact announcement cards: badge + person name + headline inline
- Kudos spotlight with left-border accent instead of box border
- Celebrations as a horizontal scroll strip with avatar circles
- Wide-mode adaptation triggers at desktop tier (>1200px viewport)

### Layout Mode System

A `LayoutMode` type (`'rail' | 'wide'`) replaces direct tier-based style switching. Rail is the default for mobile and tablet; wide mode activates at desktop.

### CTA Posture

- "Give Kudos" always visible in module header (participation prompt)
- "View All Kudos" visible in wide mode only when Kudos region has data
- "View all" footer always visible
- Per-region CTAs removed from region headers

---

## Files Changed

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Full rebuild against P01 blueprint |
| `apps/hb-webparts/src/webparts/peopleCulture/index.ts` | Added deprecation JSDoc on legacy `PeopleCulture` export |
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureWebPart.manifest.json` | Updated description to reflect rebuilt surface |
| `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` | Switched from `PeopleCulture` to `PeopleCultureMerged` with merged config data |
| `apps/hb-webparts/src/homepage/__tests__/communicationsWebparts.test.tsx` | Updated to test `PeopleCultureMerged` instead of legacy `PeopleCulture` |
| `apps/hb-webparts/package.json` | Bumped to 0.0.14 |

---

## What Was Not Changed

- **Normalizer** (`communicationsConfig.ts`): Untouched — all data normalization, filtering, and sorting logic preserved
- **Contracts** (`communicationsContracts.ts`): Untouched — all data types preserved
- **Legacy component** (`PeopleCulture.tsx`): Retained in-tree with deprecation notice on export; no references outside its own file and index
- **Mount dispatcher** (`mount.tsx`): Already pointed to `PeopleCultureMerged`; no change needed

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (537.25 kB JS, 24.84 kB CSS)
- `test`: 8 failures, all pre-existing (confirmed by running tests on main before changes)
