# P04 — Implementation Note: Runtime Hardening, Build, and Tenant Validation

**Date:** 2026-04-07
**Phase:** 12 / P04 — Runtime Hardening, Build, Package, and Tenant Validation
**Version:** 0.0.24

---

## Summary

Completed the People & Culture live-list remediation by verifying all runtime hardening requirements, producing a fresh `hb-webparts.sppkg`, and updating release manifests. The webpart is now list-backed with defensive fallback to manifest props.

---

## Runtime Hardening Checklist

| Requirement | Status | Evidence |
|------------|--------|----------|
| Loading state works | Pass | `isLoading \|\| listLoading` gate in `PeopleCultureMerged.tsx` returns `HomepageLoadingState` |
| Fallback to manifest props when list fetch fails | Pass | `effectiveConfig = listConfig ?? config` — hook returns `undefined` on fetch error |
| No-SPFx-context local/dev rendering works | Pass | Hook returns `{ listConfig: undefined, isLoading: false }` immediately when `getSiteUrl()` is undefined |
| Unsupported celebration types do not crash | Pass | `VALID_CELEBRATION_TYPES` set filters to `birthday`/`anniversary` only; others silently dropped |
| Missing people/taxonomy/image fields safe | Pass | `resolvePersonName()`, `extractPersonArray()`, `parseTaxonomyLabels()`, `extractImageSrc()` all handle null/undefined defensively |
| Pending kudos excluded | Pass | `synthesizeStatus()` returns `'pending'` → `isKudosHomepageVisible()` in normalizer filters them out |
| Malformed internal name assumptions eliminated | Pass | `resolvePublishDateField()` does runtime field metadata resolution via SharePoint REST API, caches result |
| No stale placeholder behavior when lists reachable | Pass | `listConfig ?? config` ensures list data takes precedence when available |

---

## Files Changed Across Phase 12

### New files (P02)
| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts` | SharePoint list data source — fetches and maps 3 lists into `PeopleCultureMergedConfig` |
| `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` | React data hook — loading/error/cache lifecycle |

### Modified files (P03)
| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Wired `usePeopleCultureData()` hook; list config primary, manifest fallback |
| `apps/hb-webparts/package.json` | Version bumped through 0.0.22 → 0.0.24 |

### Build artifacts (P04)
| File | Change |
|------|--------|
| `dist/sppkg/hb-webparts.sppkg` | Fresh package (2.9 MB) |
| `tools/spfx-shell/release/assets/*` | Updated content-hashed bundles |
| `tools/spfx-shell/release/manifests/*.manifest.json` | Updated module references |

### Documentation (P01–P04)
| File | Purpose |
|------|---------|
| `P01-Implementation-Note.md` | Repo-truth confirmation and field resolution map |
| `P02-Implementation-Note.md` | List source and data hook implementation record |
| `P03-Implementation-Note.md` | Webpart wiring and UI preservation record |
| `P04-Implementation-Note.md` | This document — hardening, build, and validation record |

---

## Final List Titles

| List | Title used in adapter | Resolution method |
|------|----------------------|-------------------|
| Announcements | `People Culture Announcements1` | Confirmed from user-provided URL and CSV |
| Kudos | `People Culture Kudos` | Confirmed from user-provided URL and CSV |
| Celebrations | Runtime-resolved | Adapter probes `People Culture Celebrations` then `People Culture Celebrations1`; falls back to empty |

---

## Final Field Mappings

### Announcements → `AnnouncementEntry`
`AnnouncementId`, `AnnouncementPerson` (expand), `PersonDisplayName`, `AnnouncementType`, `Headline`, `Summary` (strip HTML), `PublishDate` (runtime-resolved internal name), `StartDisplayDate`, `EndDisplayDate`, `IsPinned`, `PriorityOverride`, `HomepageEnabled`, `AudienceTags` (taxonomy), `CtaLabel`, `CtaUrl`, `OpenInNewTab`, `PrimaryImage`, `ImageAltText`

### Kudos → `KudosEntry`
`KudosId`, `Headline`, `Excerpt` (strip HTML), `SubmittedBy` (expand), `SubmittedDate`, `ApprovedBy` (expand), `ApprovedDate`, `IndividualRecipients` (expand multi), `TeamRecipients` (taxonomy), `DepartmentRecipients` (taxonomy), `ProjectGroupRecipients` (taxonomy), `IsPinned`, `HomepageEnabled`, `PublishStartDate`, `PublishEndDate`, `CelebrateCount`, `PrimaryImage`, `ImageAltText`

### Celebrations → `WeeklyCelebrationEntry`
`AnnouncementId`, `PersonName` (expand multi → row explosion), `PersonDisplayName`, `CelebrationType` (normalize lowercase, filter to contract set), `CelebrationDate`, `AnniversaryYears`, `HomepageEnabled` (fallback to enabled if missing), `AudienceTags` (taxonomy), `PrimaryImage`, `ImageAltText`

---

## Fallback Behavior

```
1. usePeopleCultureData() → listConfig (live SharePoint lists, 5-min cache)
2. config prop (manifest seed data from PeopleCultureWebPart.manifest.json)
3. normalizePeopleCultureMergedConfig() → empty-state handling
```

Per-list failures are caught independently — if one list fails, the other two still return data. Only when all sources are empty does the component render the empty-state governance surface.

---

## Schema Inconsistencies Discovered

| Issue | Resolution |
|-------|-----------|
| `PublishDate` internal name suspect | Runtime field metadata resolution via `/_api/web/lists/.../fields?$filter=Title eq 'PublishDate'` |
| Kudos has no `Status` column | Synthesized from approval state: `approved` if `ApprovedDate` or `ApprovedBy` present, else `pending` |
| Celebrations list title inconsistent | Runtime candidate probing (`People Culture Celebrations`, then `People Culture Celebrations1`) |
| Celebrations `HomepageEnabled` possibly malformed | Treated as enabled when field is missing or null |
| Celebrations `CelebrationType` has 6 values, contract accepts 2 | Adapter filters to `birthday`/`anniversary` only |
| Celebrations `PersonName` is `UserMulti` | Adapter explodes multi-person rows into individual entries with stable composite IDs |
| Celebrations ID column named `AnnouncementId` | Carried forward as-is — misleading but functional |

---

## Build / Package Status

- **Vite build**: Pass (556.88 kB JS, 31.32 kB CSS)
- **SPFx bundle**: Pass (gulp bundle --ship)
- **SPFx package**: Pass (gulp package-solution --ship)
- **Output**: `dist/sppkg/hb-webparts.sppkg` (2.9 MB)
- **Manifests**: 11 webpart manifests compiled
- **Shell entries**: 11 per-webpart shell entry modules generated
- **Content hash**: `hb-webparts-app-e6115b7a.js`
- **People & Culture manifest**: `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`

---

## SharePoint Tenant Validation

Tenant validation requires deploying `hb-webparts.sppkg` to the HBCentral app catalog and loading the homepage at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`. This step requires authenticated tenant access and must be performed by the site administrator.

**What to verify on-tenant:**
- People & Culture webpart renders on the homepage
- Live list content appears (not manifest seed data)
- Announcements show real person names and headlines from `People Culture Announcements1`
- Kudos show real recognition entries from `People Culture Kudos`
- Celebrations show real birthday/anniversary entries from the resolved celebrations list
- Premium warm gradient styling is visually intact
- Sparse or partial list scenarios render intentionally (no broken layouts)

---

## Verification

- `check-types`: Pass (clean)
- `lint`: Pass (clean, 0 errors, 0 warnings)
- `build`: Pass (556.88 kB JS, 31.32 kB CSS)
- `test`: 13 failures, all pre-existing
- `build-spfx-package`: Pass — `hb-webparts.sppkg` produced (2.9 MB)
