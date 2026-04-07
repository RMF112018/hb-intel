# P02 — Implementation Note: List Source and Data Hook

**Date:** 2026-04-07
**Phase:** 12 / P02 — List Source and Data Hook Implementation
**Version:** 0.0.23

---

## What Changed

### New files

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts` | SharePoint list data source — fetches and maps Announcements, Kudos, and Celebrations lists into `PeopleCultureMergedConfig` contract |
| `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` | React hook — provides list-backed config with loading/error/cache lifecycle, matching `useProjectSpotlightData` pattern |

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/package.json` | Version bump 0.0.22 → 0.0.23 |

---

## Architecture Decisions

### Pattern: follows Project Spotlight exactly

Both new files follow the established list-source pattern (`projectSpotlightListSource.ts` + `useProjectSpotlightData.ts`). No new data-access architecture was introduced.

### Three-list concurrent fetch

`fetchPeopleCultureListData()` fetches all three lists and resolves the `PublishDate` field name concurrently via `Promise.all`. Individual list failures are caught and result in empty arrays — the component falls back gracefully per band.

### Celebrations list title resolution

The celebrations list title is uncertain from CSV exports. The adapter tries `People Culture Celebrations` then `People Culture Celebrations1` via a lightweight list-existence probe before fetching items. If neither resolves, celebrations returns empty.

### PublishDate field metadata resolution

The `PublishDate` internal name is suspect per P01 findings. The adapter resolves the actual internal name from SharePoint field metadata on first fetch, caches the result, and remaps the raw item property if the resolved name differs.

### Kudos status synthesis

No dedicated `Status` field exists in the live list. Status is synthesized from approval state:
- `'approved'` when `ApprovedDate` is non-null or `ApprovedBy` has an ID
- `'pending'` otherwise

The existing normalizer's `isKudosHomepageVisible()` filters out non-approved items.

### Celebrations multi-person explosion

`PersonName` is `UserMulti`. When multiple users are present, the mapper emits one `WeeklyCelebrationEntry` per person with stable IDs (`<baseId>:<index>`). Celebration types are normalized to lowercase and filtered to the contract set (`birthday`, `anniversary`).

### Taxonomy recipient parsing

Managed metadata fields (`TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients`) are parsed from the pipe-delimited `WssId;#Label` format used by SharePoint's hidden note companion fields.

---

## What Was Not Changed

- `spContext.ts` — no changes needed
- `mount.tsx` — no changes needed
- `communicationsContracts.ts` — all existing types compatible
- `communicationsConfig.ts` — normalizer pipeline unchanged
- `PeopleCultureMerged.tsx` — not wired yet (P03 scope)

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (547.54 kB JS, 31.32 kB CSS)
- `test`: 13 failures, all pre-existing (bundle budget, composition preview, discovery, operational awareness, utility — none related to People & Culture data layer)
