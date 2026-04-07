# Phase 11C — Presentation Model and Data Hardening Summary

## Purpose

Phase 11C hardened the Tool Launcher data-to-UI contract so the rebuilt launcher is driven by curated product logic instead of thin normalization, mechanical ordering, and ambiguous data seams.

## Contract changes

### `toolLauncherContracts.ts`

**New fields on `LauncherPlatformRecord`:**
- `audienceRulesRaw?: string` — Raw AudienceRulesJSON string stored for future rule-based evaluation. Resolves the ambiguous half-state where the field was fetched but never stored or used.
- `hasSupportCoverage: boolean` — Derived flag indicating whether the platform has at least a help URL or support owner. Used for governance summary and future support-quality weighting.

**New presentation types:**
- `LauncherGovernanceSummary` — Dataset health metrics: `totalPlatforms`, `requiresReviewCount`, `neverReviewedCount`, `noSupportCoverageCount`, `uncategorizedCount`, `unshelvedCount`. Not rendered directly — available for future admin/freshness UX.
- `LauncherDiscoveryHints` — Discovery-readiness metadata: `availableCategories`, `availableShelves`, `favoriteEligibleCount`, `hasSupportOwners`. Enables future filter/favorite/recommendation UX without blocking data pipeline changes.

**New fields on `LauncherPresentationModel`:**
- `governanceSummary: LauncherGovernanceSummary`
- `discoveryHints: LauncherDiscoveryHints`

### `toolLauncherNormalization.ts`

**Derivation changes:**
- `deriveWorkflowShelves()` — Shelves now ordered by minimum platform sortOrder (priority-weighted) then alphabetical, instead of purely alphabetical. Shelves containing higher-priority platforms appear first.
- `derivePlatformIndex()` — Categories now ordered featured-weighted: categories containing featured platforms appear before categories without, then alphabetical within each tier.
- `filterByAudience()` — Audience matching is now case-insensitive (`.toLowerCase()` on both sides).
- New `deriveGovernanceSummary()` — Computes dataset health metrics from visible platforms.
- New `deriveDiscoveryHints()` — Computes discovery-readiness metadata from visible platforms.
- `normalizeToolLauncherItem()` — Now stores `audienceRulesRaw` and `hasSupportCoverage`.

### `toolLauncherListSource.ts`

- `$top` increased from 100 to 500 — supports growing lists without requiring paging. 500 is well within SharePoint REST API limits and far exceeds expected platform count.

## Data seams preserved

- Live SharePoint list-driven model — unchanged
- Normalized contract boundary — additive only (new fields, backward-compatible)
- Mount/runtime seam — unchanged
- Fetch/cache/abort pattern in `useToolLauncherData` — unchanged
- Search contract (`launcherSearch.ts`) — unchanged
- Icon/asset resolution — unchanged
- All Phase 11B composition components — unchanged (consume `LauncherPresentationModel` which was extended, not modified)

## Ambiguous data seams resolved

### AudienceRulesJSON
**Before:** Fetched from SharePoint, included in `SP_FIELDS` and `$select`, but never stored on `LauncherPlatformRecord` or consumed anywhere in the pipeline. Ambiguous: was it planned, forgotten, or deliberately skipped?

**After:** Stored as `audienceRulesRaw` on the normalized record with clear documentation that it is not evaluated at runtime. Audience filtering continues to use the simpler `AudienceVisibility` field. The raw JSON is available for future rule-based evaluation without another schema change.

### RequiresReview / LastReviewedOn
**Before:** Stored on the normalized record but never influenced any presentation logic. Available but invisible.

**After:** Now consumed by `deriveGovernanceSummary()` which computes `requiresReviewCount` and `neverReviewedCount`. The governance summary is available on the presentation model for future admin/freshness UX. No visual surfacing in this phase — that belongs to Phase 11F.

### Support coverage quality
**Before:** Support metadata was stored but there was no aggregate indicator of data quality or coverage gaps.

**After:** `hasSupportCoverage` flag on each record + `noSupportCoverageCount` in governance summary. Future phases can use these for support-quality weighting and admin dashboards.

## Later phases now unblocked

| Phase | What's unblocked |
|-------|-----------------|
| 11D | Premium primitives can consume `governanceSummary` and `discoveryHints` for admin badges and filter UI |
| 11E | Search/discovery can use `availableCategories`, `availableShelves`, and `favoriteEligibleCount` for filter/facet UX |
| 11F | Support rebuild can use `hasSupportCoverage`, `noSupportCoverageCount`, and support-owner quality signals |
| 11G | Authoring hardening can validate governance summary as a data-completeness check |
