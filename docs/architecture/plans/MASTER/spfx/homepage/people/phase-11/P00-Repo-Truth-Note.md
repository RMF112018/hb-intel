# P00 — Repo Truth Note: People & Culture Homepage Surface

**Date:** 2026-04-07
**Phase:** 11 / P00 — Repo Truth Freeze and Product Decision
**Repo version at freeze:** `@hbc/spfx-hb-webparts@0.0.13` (commit `b2e3a5f0`)

---

## Surviving Component

**Component:** `PeopleCultureMerged`
**File:** `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
**Manifest ID:** `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`
**Mount entry:** `apps/hb-webparts/src/mount.tsx` (line 34)

### Props Interface

```typescript
interface PeopleCultureMergedProps {
  config?: Partial<PeopleCultureMergedConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}
```

### Data Contracts

- `PeopleCultureMergedConfig` — top-level config with `announcements`, `kudos`, `celebrations` arrays and max-count defaults
- `AnnouncementEntry` — id, personName, announcementType, headline, summary, publishDate, persistence windows, audience filtering
- `KudosEntry` — id, headline, excerpt, submittedBy, recipients, status (approved-only visible), 14-day window
- `WeeklyCelebrationEntry` — id, personName, celebrationType, celebrationDate (current-week filter)
- **Contract file:** `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts`

### Normalizer

- `normalizePeopleCultureMergedConfig()` in `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts`
- Handles Band A visibility (display windows, persistence, audience), Kudos approval gating, Band B week filtering

### UI Kit Dependencies

| Import | Source |
|--------|--------|
| `HbcHomepageSectionShell` | `@hbc/ui-kit/homepage` |
| `HbcPremiumBadge` | `@hbc/ui-kit/homepage` |
| `HbcPremiumCta` | `@hbc/ui-kit/homepage` |
| `Users`, `CheckCircle2`, `Calendar` | `@hbc/ui-kit/homepage` (lucide re-exports) |
| `Separator` | `@radix-ui/react-separator` |
| `useResponsiveTier` | Internal responsive hook |

### Manifest Defaults

- Heading: "Celebrating Our People"
- Max announcements: 4, max Kudos headlines: 6, max celebrations: 8
- Demo data: one promotion announcement, one birthday celebration
- Hidden from toolbox: true

---

## Deprecated Component

**Component:** `PeopleCulture`
**File:** `apps/hb-webparts/src/webparts/peopleCulture/PeopleCulture.tsx`
**Status:** Formally deprecated as of P00 decision

### Why Deprecated

- Not mounted in the production dispatcher — only referenced in `ReferenceHomepageComposition.tsx` and tests
- Implements a simpler editorial surface (featured + secondary items via `HbcEditorialSurface`) incompatible with the approved three-region model
- Uses a narrower data contract (`PeopleCultureConfig`) that cannot express Kudos or Celebrations
- Separate normalizer (`normalizePeopleCultureConfig`) with different filtering logic

### Retention Plan

Retained in-tree as reference until P03 rebuild produces the replacement surface. Should be removed after P03 validation.

---

## Placement Assumptions

| Dimension | Current State | Target State |
|-----------|--------------|--------------|
| Layout mode | Wide responsive (mobile/tablet/desktop tiers) | Rail-first with wide adaptation |
| Region rendering | Three stacked sections with independent grids | Coherent rail composition with region suppression |
| Homepage zone | Awareness zone (Company Pulse, Zone C) | Same — no zone change |
| Authoring governance | People Operations owner, weekly cadence | Same — no governance change |

---

## Export Surface

`apps/hb-webparts/src/webparts/peopleCulture/index.ts` currently exports both `PeopleCulture` and `PeopleCultureMerged`. After the P03 rebuild, the deprecated export should be removed.

---

## Related Files

| Purpose | Path |
|---------|------|
| Mount dispatcher | `apps/hb-webparts/src/mount.tsx` |
| Reference composition | `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` |
| Authoring governance | `apps/hb-webparts/src/homepage/webparts/authoringGovernance.ts` |
| Shared empty/loading states | `apps/hb-webparts/src/homepage/shared/` |
| UI Kit homepage exports | `packages/ui-kit/src/homepage.ts` |
