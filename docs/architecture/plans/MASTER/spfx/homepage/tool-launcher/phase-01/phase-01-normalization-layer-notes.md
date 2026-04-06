# Phase 01 — Normalization Layer Notes

## 1. Files Created or Updated

### Created

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts` | Three-layer type system: raw SP item shape, normalized domain model (`LauncherPlatformRecord`), and presentation-oriented derived structures |
| `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts` | Normalization layer converting raw SP items to domain records, plus presentation model derivation (featured stage, workflow shelves, platform index, notices summary) |

### Unchanged (existing, preserved as transitional seam)

| File | Status |
|------|--------|
| `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts` | Old `ToolLauncherWorkHubConfig` / `ToolLauncherGroup` / `ToolLauncherItem` types remain for the existing local-config component path. They are now explicitly transitional. |
| `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts` | Old `normalizeToolLauncherWorkHubConfig()` remains for the existing component. Will be replaced when the component is rebound in Prompt 03. |

## 2. Raw-to-Normalized Field Mapping Strategy

The normalization layer implements a **boundary mapping** pattern: all SharePoint-specific value shapes are absorbed at the data boundary so downstream code works with clean TypeScript types only.

| SharePoint concern | Normalization action |
|---|---|
| Hyperlink fields (`LaunchURL`, `HelpLink`, `SupportOwnerReference`, `AccessRequestDestination`) | `extractUrl()` handles plain strings and `{ Url, Description }` objects |
| Nullable booleans (`IsActive`, `Featured`, `OpenInNewTab`, `FavoriteEligible`, `RequiresReview`) | `normalizeBool()` applies explicit defaults per field |
| Nullable numbers (`FeaturedSortOrder`, `SortOrder`) | `normalizeNumber()` applies default of `999` |
| Multi-value Choice (`AudienceVisibility`) | `normalizeAudiences()` handles plain string (split on `;,`), `{ results: string[] }` array, and null |
| Semicolon-separated text (`AliasesKeywords`) | `normalizeAliases()` splits and trims |
| Choice enums (`PreferredLogoType`, `NoticeStatus`, `StatusBadgeTone`) | Validated against known value sets; falls back to safe defaults |
| Date strings (`NoticeExpiresOn`, `LastReviewedOn`) | `parseDate()` with `Date.parse()` guard; returns `undefined` for invalid/empty |
| Missing `PlatformKey` | Falls back to `slugify(name)` for asset-manifest matching |

## 3. Validation and Fallback Rules

### Record-level validation

| Rule | Behavior |
|------|----------|
| Missing `Title` | Record skipped entirely |
| Missing `LaunchURL` | Record skipped entirely |
| `IsActive` is `false` | Record suppressed |
| Expired notice (`NoticeExpiresOn` in the past) | Notice badge removed; record itself retained |
| Duplicate `platformKey` | Second occurrence skipped (dedup by key) |

### Field-level fallback defaults

| Field | Default when missing |
|-------|---------------------|
| `PlatformKey` | `slugify(Title)` |
| `IsActive` | `true` |
| `Featured` | `false` |
| `FeaturedSortOrder` | `999` |
| `SortOrder` | `999` |
| `OpenInNewTab` | `true` |
| `FavoriteEligible` | `true` |
| `RequiresReview` | `false` |
| `PreferredLogoType` | `'official-wordmark'` |
| `NoticeStatus` | `'none'` (no badge rendered) |
| `StatusBadgeTone` | `'info'` |
| `AudienceVisibility` | `[]` (visible to all) |
| `AliasesKeywords` | `[]` |

## 4. Why the Chosen File Locations Are Appropriate

| File | Location | Rationale |
|------|----------|-----------|
| `toolLauncherContracts.ts` | `homepage/webparts/` | Follows the existing convention where domain contracts live alongside webpart contracts (`utilityContracts.ts`, `operationalAwarenessContracts.ts`, `communicationsContracts.ts`). The Tool Launcher contracts are homepage-specific and should not be pushed into `@hbc/ui-kit`. |
| `toolLauncherNormalization.ts` | `homepage/data/` | Follows the existing convention where data-access and normalization code lives in the `data/` directory (`projectSpotlightListSource.ts`, `spContext.ts`). SharePoint list semantics stay local to the homepage data layer. |

Both locations keep business-specific list mapping logic local to the homepage lane, as required by the working rules. Shared UI-kit primitives are not forced to absorb SharePoint list semantics.

## 5. What Remains for Binding in Prompt 03

| Concern | Status | What Prompt 03 must do |
|---------|--------|------------------------|
| SharePoint list data-access service | **Not yet implemented** | Create `toolLauncherListSource.ts` in `homepage/data/` following the `projectSpotlightListSource.ts` pattern: SP_FIELDS constant, $select/$filter query, REST fetch, and raw-to-normalized mapping using `normalizeToolLauncherItems()` |
| Field-discovery validation | **Not yet implemented** | Implement the field-metadata query to validate actual internal names before building the $select list (documented in the field map as a required step) |
| React data hook | **Not yet implemented** | Create `useToolLauncherData.ts` hook following the `useProjectSpotlightData.ts` pattern to manage fetch lifecycle, caching, and error states |
| Component rebinding | **Not yet implemented** | Update `ToolLauncherWorkHub.tsx` to accept data from the live list adapter instead of (or alongside) the local grouped config |
| Presentation model consumption | **Not yet implemented** | Wire `deriveToolLauncherPresentation()` into the component to produce the featured stage, workflow shelves, and platform index from live data |
| Local-config fallback | **Transitional seam preserved** | The old `ToolLauncherWorkHubConfig` path remains functional. Prompt 03 should implement a discriminated source pattern so the component can accept either live-list or local-config data |
