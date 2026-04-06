# Phase 01 — Binding and Adapter Proof

## 1. Files Changed

### Created

| File | Purpose |
|------|---------|
| `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts` | SharePoint REST data source: SP_FIELDS constant (30 field internal names), SELECT_FIELDS query, `fetchToolLauncherListItems()` with `$filter=IsActive eq 1` and `$top=100`, returns `LauncherPlatformRecord[]` |
| `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts` | React data hook: module-level cache with 5-minute TTL, `useToolLauncherData()` returns `{ platforms, isLoading, error }`, SPFx context detection via `getSiteUrl()`, AbortController cleanup |

### Modified

| File | Change |
|------|--------|
| `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx` | Rewired to use `useToolLauncherData()` as primary data source with manifest config as fallback. Added `bridgeLiveDataToGroups()` to map `LauncherPlatformRecord[]` → `LauncherGroup[]` for `HbcLauncherSurface`. Featured platforms form the first group; workflow shelves form subsequent groups; unshelved/unfeatured platforms form a catch-all group. |

## 2. Data Flow from SharePoint to Webpart Render

```
SharePoint REST API
  /_api/web/lists/getbytitle('Tool Launcher Contents')/items
  ?$select=Title,PlatformKey,LaunchURL,...(30 fields)
  &$filter=IsActive eq 1
  &$top=100
        ↓
fetchToolLauncherListItems(siteUrl)
  → RawToolLauncherListItem[]
        ↓
normalizeToolLauncherItems(rawItems)
  → validate required fields (Title, LaunchURL)
  → suppress inactive records
  → normalize all SP-specific shapes (Hyperlink objects, nullable booleans, etc.)
  → deduplicate by platformKey
  → sort by sortOrder then name
  → LauncherPlatformRecord[]
        ↓
useToolLauncherData() hook
  → manages fetch lifecycle, 5-min cache, loading/error state
  → returns { platforms, isLoading, error }
        ↓
ToolLauncherWorkHub component
  → if listLoading: render HomepageLoadingState
  → if listPlatforms available: bridge to groups via deriveToolLauncherPresentation()
  → if listPlatforms unavailable: fall back to old normalizeToolLauncherWorkHubConfig(config) path
        ↓
bridgeLiveDataToGroups(platforms)
  → deriveToolLauncherPresentation() produces featured stage + workflow shelves
  → featured platforms → first LauncherGroup ("Featured Platforms")
  → each workflow shelf → subsequent LauncherGroup
  → unshelved, unfeatured platforms → "Other Platforms" catch-all group
        ↓
HbcLauncherSurface
  → renders groups with tiles in grid layout
```

## 3. Transitional Compatibility Notes

| Concern | Status | Detail |
|---------|--------|--------|
| **Local config fallback** | Preserved | When `getSiteUrl()` returns undefined (no SPFx context — local dev, demo, packaging), the component falls back to the old `normalizeToolLauncherWorkHubConfig(config)` path. This keeps the existing manifest `preconfiguredEntries` functional. |
| **Icon resolution** | Transitional | Live-data tiles use category-based icon hints resolved through the existing `TOOL_ICON_MAP` / `TOOL_TINT_MAP`. This is a temporary bridge until logo assets are available (Phase 02+). |
| **HbcLauncherSurface rendering** | Bridge | Live data is mapped into the existing `LauncherGroup[]` structure rather than a new 3-zone composition. The prompt explicitly allows this. |
| **Old contract types** | Retained | `ToolLauncherWorkHubConfig`, `ToolLauncherGroup`, `ToolLauncherItem` in `utilityContracts.ts` remain for the fallback path. They are not the primary contract. |
| **Old normalizer** | Retained | `normalizeToolLauncherWorkHubConfig()` in `utilityConfig.ts` remains for the fallback path only. |

## 4. Known Limitations Intentionally Deferred to Later Phases

| Limitation | Deferred to |
|-----------|-------------|
| 3-zone composition (command band, flagship stage with 8/4 split, workflow shelves, all-platforms overlay) | Phase 02+ (UI composition rebuild) |
| Logo-led brand treatment (official platform logos from asset manifest) | Phase 02+ (requires `@hbc/ui-kit` brand asset system) |
| Search / command entry across platform names, aliases, keywords | Phase 08 (search contract) |
| Favorites and recently-used rail | Phase 04 (utility rail) |
| Responsive breakpoint strategy (desktop/tablet/mobile) | Phase 07 (responsive contract) |
| Audience filtering on live data (audience-aware rendering) | Normalization layer supports it; component-level filtering deferred until audience context is wired |
| Field-discovery validation endpoint | Deferred; the adapter uses expected PascalCase internal names. SharePoint REST gracefully omits unknown fields rather than erroring. |

## 5. Runtime Proof Steps

### SPFx environment (SharePoint)

1. Deploy the `hb-webparts.sppkg` package to the SharePoint app catalog
2. Place the Tool Launcher webpart on a page hosted on the HBCentral site
3. The webpart should:
   - Show loading skeleton briefly while fetching
   - Render platform tiles grouped by featured status and workflow shelf
   - Featured platforms appear in the first group
   - Workflow shelves appear as subsequent groups
   - Unfeatured, unshelved platforms appear in "Other Platforms"
4. Verify: adding a platform to the `Tool Launcher Contents` list with `IsActive = Yes` causes it to appear after cache expiry (5 minutes)
5. Verify: setting `IsActive = No` on a platform causes it to disappear after cache expiry
6. Verify: setting `Featured = Yes` on a platform moves it to the "Featured Platforms" group

### Local dev / demo

1. Run the app locally without SPFx context
2. The webpart should fall back to manifest config props (grouped config from `preconfiguredEntries`)
3. Rendering should match the pre-existing local-config behavior

### Error / empty states

1. If the list is empty or all items are inactive: HomepageEmptyState with authoring guidance
2. If the REST request fails (network error, list not found): component falls back to prop config with no visible error to end users

## 6. Risks Remaining

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Field internal name mismatch** | Medium | Expected PascalCase names follow the tenant convention proven by Project Spotlight. If a column was added with spaces, SharePoint may use `_x0020_` encoding. The normalization layer treats all fields as optional, so missing fields degrade gracefully rather than crashing. A runtime check against `/_api/web/lists/getbytitle('Tool Launcher Contents')/fields` can validate names if needed. |
| **List not found on non-HBCentral sites** | Low | The fetch targets the site URL stored by SPFx context. If the webpart runs on a site without the list, the REST call returns 404, the hook falls back to prop config. |
| **Cache staleness** | Low | 5-minute TTL matches the Project Spotlight pattern. Acceptable for a launcher surface that changes infrequently. |
| **Bundle size increase** | Low | The new code adds ~7.6 KB to the bundle (483 KB vs 475 KB). Acceptable for the data adapter and normalization layer. |
| **HbcLauncherSurface bridging** | Transitional | The flat grouped rendering does not yet express the target 3-tier card hierarchy. This is intentional and will be resolved in Phase 02+. |
