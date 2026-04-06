# Project Spotlight — SharePoint List Data Source Wiring Output

**Phase:** P06-02 — SharePoint list data source wiring
**Date:** 2026-04-06
**Status:** Complete

---

## 1. Files changed

| File | Action | Purpose |
|------|--------|---------|
| `apps/hb-webparts/src/homepage/data/spContext.ts` | **Created** | Module-level singleton to store the SharePoint site URL extracted from SPFx context. Used by data-fetching hooks. |
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | **Created** | SP list field constants, raw item type (`RawSpotlightListItem`), field-to-prop mapping function (`mapListItemToSpotlight`), and fetch function (`fetchSpotlightListItems`) using SharePoint REST API. |
| `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts` | **Created** | React hook (`useProjectSpotlightData`) that fetches list data when SPFx context is available, with 5-minute client-side cache. Returns `undefined` listConfig when running outside SPFx to trigger prop fallback. |
| `apps/hb-webparts/src/mount.tsx` | **Modified** | Replaced `void spfxContext` with `storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl)` to make site URL available to data-fetching hooks. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | **Modified** | Added `useProjectSpotlightData()` hook. List-sourced config is primary; manifest config props are the narrow fallback. Loading state shown during list fetch. |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | **Modified** | Version bumped to `0.0.2.0`. |

---

## 2. Data-flow summary

```
SPFx host page
  → mount(el, spfxContext, config)
    → storeSiteUrl(spfxContext.pageContext.web.absoluteUrl)

ProjectPortfolioSpotlight component
  → useProjectSpotlightData()
    → getSiteUrl()  // retrieve stored site URL
    → fetchSpotlightListItems(siteUrl)
      → fetch("{siteUrl}/_api/web/lists/getbytitle('Homepage Project Spotlights')/items?...")
      → filter: HomepageEnabled eq 1 (server-side)
      → filter: publish window (client-side)
      → mapListItemToSpotlight() per item  →  ProjectPortfolioSpotlightItem[]
    → return { listConfig, isLoading }

  → effectiveConfig = listConfig ?? config  // list primary, manifest fallback
  → normalizeProjectPortfolioSpotlightConfig(effectiveConfig, activeAudience)
    → [existing pipeline: validate, audience filter, sort, split featured/secondary]
  → render
```

When running locally (no SPFx context), `getSiteUrl()` returns `undefined`, the hook returns `{ listConfig: undefined, isLoading: false }`, and the component uses the manifest prop config as fallback.

---

## 3. Mapping table

| SharePoint Field | → | Spotlight Contract Field | Notes |
|---|---|---|---|
| `Title` | → | `title` | Trimmed |
| `ProjectId` | → | `id` | Falls back to `Title` if empty |
| `ProjectUrl` | → | `cta.href` (fallback) | Used when `CtaUrl` is absent |
| `HomepageEnabled` | → | Server-side filter | `eq 1` in REST query |
| `IsFeatured` | → | `featured` | Boolean |
| `DisplayOrder` | → | `order` | Number |
| `Headline` | → | `highlightHeadline` | Trimmed |
| `Summary` | → | `summary` | Trimmed |
| `LocationText` | → | `location` | Trimmed |
| `Sector` | → | `sector` | Trimmed |
| `PrimaryImage` | → | `image.src` | Handles string URL or SP Image column JSON |
| `PrimaryImageAltText` | → | `image.alt` | Trimmed |
| `StatusLabel` | → | `status.label` | Trimmed |
| `StatusVariant` | → | `status.variant` | Validated against `OperationalStatusVariant` union |
| `StrategicEmphasis` | → | `strategicEmphasis` | Boolean |
| `FreshnessDate` | → | `freshness.updatedAt` | ISO date string |
| `FreshnessSource` | → | `freshness.source` | Validated against `'curated' \| 'live'` |
| `MilestonesCompleted` + `MilestonesTotal` + `MilestoneSummary` | → | `milestones[]` | Synthetic array: N completed + M incomplete entries |
| `CtaLabel` + `CtaUrl` | → | `cta.label` + `cta.href` | Falls back to `ProjectUrl` for href |
| `ProjectTeamMembers` | → | `teamMembers[]` | Person/Group multi-select → `{ id, displayName, photoUrl }`. Photo URL from `/_layouts/15/userphoto.aspx` |
| `Audience` | → | `audiences[]` | Single value wrapped in array for existing `isVisibleForAudience()` |
| `StaleAfterDays` | → | `staleAfterHours` | Converted: `days × 24` |
| `PublishStart` / `PublishEnd` | → | Client-side filter | Items outside publish window excluded before mapping |

---

## 4. Validation

| Check | Result |
|-------|--------|
| `pnpm check-types` | Pass — no type errors |
| `pnpm lint` | Pass — no errors or warnings |
| `pnpm build` | Pass — 4351 modules, 472.61 kB bundle |
| Mapping correctness | All 25 SP fields mapped to existing contract fields |
| No-data handling | Hook returns `undefined` listConfig → prop fallback → existing empty state |
| Invalid-data handling | Existing normalization pipeline filters items missing required fields |
| List-backed source is primary | `effectiveConfig = listConfig ?? config` — list wins when available |
| Manifest fallback is narrow | Only activates when `getSiteUrl()` returns `undefined` (local dev) or list fetch fails |
| No new dependencies added | Uses `fetch` (browser-native) and `useState`/`useEffect` (React) |
| No unrelated webparts touched | Changes scoped to Project Spotlight and the shared mount entry point |
