# Phase 01 — Hardening Notes

## 1. Hardened Scenarios

### No data
- List returns zero active items → `listEmpty` authoring message via `HomepageEmptyState`
- List not found (404) → fetch error caught by hook → silent fallback to config props
- Network failure → fetch error caught by hook → silent fallback to config props
- Malformed JSON response → caught at list source boundary → error propagated to hook → config fallback

### Partial record
- Missing `Title` → record skipped entirely by normalization
- Missing `LaunchURL` → record skipped entirely by normalization
- Missing `PlatformKey` → falls back to `slugify(Title)` for dedup and asset-manifest matching
- Missing `ShortDescriptor` → tile renders without subtitle (descriptor is optional)
- All other fields have explicit defaults documented in the normalization layer

### Logo degradation
- Missing `OfficialLogoAssetReference` → `logoAssetRef` is undefined; component falls through to icon resolution
- Missing `DarkLogoAssetReference` → `darkLogoAssetRef` is undefined; light logo used
- Missing `PreferredLogoType` → defaults to `'official-wordmark'`
- Icon fallback chain: platform-specific icon from asset manifest (`PLATFORM_FALLBACK_ICON` keyed by platformKey) → category-based icon (`TOOL_ICON_MAP`) → default `Settings` icon

### Grouping / shelf degradation
- Missing `WorkflowShelf` → platform excluded from workflow shelves, appears in "Other Platforms" catch-all group
- Missing `Category` → platform grouped under "Other" in the all-platforms index
- Missing `Featured` → defaults to `false` (not in featured stage)
- Missing `FeaturedSortOrder` → defaults to `999` (sorts to end of featured group)
- Missing `SortOrder` → defaults to `999` (sorts to end, alphabetical tiebreaker)
- No featured platforms at all → "Featured Platforms" group simply not rendered
- No workflow shelves at all → all platforms appear in "Other Platforms" catch-all

### Support / utility degradation
- Missing `HelpLink` → help action hidden for this platform
- Missing `SupportOwner` → support info omitted
- Missing `SupportOwnerReference` → support navigation omitted
- Missing `AccessRequestDestination` → access request action hidden
- All four missing → `support` object has all undefined values; no support UI rendered

### Notice / status degradation
- Missing `NoticeStatus` → defaults to `'none'`; no badge rendered
- `NoticeStatus` present but `NoticeBadgeText` missing → badge label falls back to status name (e.g., "outage")
- `NoticeStatus` present but `StatusBadgeTone` malformed → defaults to `'info'` tone
- Missing `NoticeDetails` → badge rendered without detail tooltip
- `NoticeExpiresOn` in the past → notice auto-expired; badge not rendered
- `NoticeExpiresOn` malformed (unparseable date) → treated as no expiry; notice persists
- Partial notice fields (some present, some missing) → renders what is available, falls back on missing

### Authoring / host safety
- No SPFx context (local dev / demo) → hook returns `undefined`, component renders from config props
- Fetch error (list missing, permission denied, network) → hook captures error string, component falls through to config fallback silently
- Raw array contains null or non-object entries → normalization guard skips them
- Response body `value` is not an array → treated as empty array
- Response body is not valid JSON → error thrown at parse boundary, caught by hook

## 2. Fallback Rules by Scenario

| Scenario | Fallback rule |
|----------|--------------|
| **No SPFx context** | Use manifest config props (local grouped config) |
| **Fetch error** | Fall through to config props; no error UI shown to end users |
| **Empty list** | Show `listEmpty` authoring message via `HomepageEmptyState` |
| **Partial record (missing Title or LaunchURL)** | Skip record entirely; other records still render |
| **Missing optional text** | Render without that text (descriptor, notes, etc.) |
| **Missing boolean** | Apply explicit default: IsActive=true, Featured=false, OpenInNewTab=true, FavoriteEligible=true, RequiresReview=false |
| **Missing number** | Apply default 999 (sorts to end) |
| **Missing enum/choice** | Apply safe default: LogoPreference='official-wordmark', NoticeStatus='none', BadgeTone='info' |
| **Unrecognized enum value** | Apply safe default (same as missing) |
| **Missing logo assets** | Platform-specific fallback icon → category icon → Settings default |
| **Missing shelf/category** | Excluded from shelves/categories; appears in catch-all group |
| **Missing support fields** | Support actions hidden for that platform |
| **Expired notice** | Notice suppressed; platform still renders normally |
| **Malformed date** | Treated as undefined (no expiry / no staleness check) |
| **Duplicate platformKey** | Second occurrence skipped |
| **Non-object in raw array** | Skipped by normalization guard |

## 3. User-Facing Outcome for Each Scenario

| Scenario | What the user sees |
|----------|-------------------|
| Healthy live list data | Grouped platform tiles with featured platforms first, workflow shelves, catch-all |
| List loading | Professional loading skeleton ("Loading tool launchers") |
| Empty list | "No platforms available" with authoring guidance to add platforms |
| Fetch error in SPFx | Config-based fallback rendering (sample data from manifest) |
| No SPFx context | Config-based fallback rendering (sample data from manifest) |
| Platform with missing descriptor | Tile renders with name only, no subtitle — still clickable and functional |
| Platform with missing shelf | Tile appears in "Other Platforms" group instead of a named shelf |
| Platform with missing logo refs | Lucide fallback icon (platform-specific or category-based) — always a meaningful icon |
| Platform with active notice | Badge rendered on tile with status label and tone |
| Platform with expired notice | No badge — tile renders normally |
| Platform with missing support | No help/support actions for that platform — other platforms unaffected |
| Malformed raw item in response | Silently skipped — other valid items render normally |

## 4. Authoring / Edit-Mode Notes

### Authoring messages

The tool launcher now has three authoring message states:

| State | Trigger | Message |
|-------|---------|---------|
| `noData` | Config fallback path: no groups configured in manifest | "No tool launchers configured" — guidance to add groups in property pane |
| `invalid` | Config fallback path: groups configured but all filtered out | "Tool launcher configuration is invalid" — guidance to review config |
| `listEmpty` | Live-list path: list has no active platform entries | "No platforms available" — guidance to add platforms with IsActive=Yes |

### SPFx property pane

The webpart's `preconfiguredEntries` in the manifest still contain sample grouped config. This serves as:
- development fallback when running without SPFx context
- demo content for packaging/deployment testing
- safety net if the live list fetch fails

Page authors do not need to configure the property pane for the live-list path. Content is governed through the `Tool Launcher Contents` list on HBCentral.

### Edit mode behavior

The webpart behaves identically in edit mode and read mode. It does not detect SharePoint edit mode to show additional authoring chrome. This is intentional — the content is list-governed, not property-pane-governed.

## 5. Remaining Deferred Work for Later Phases

| Work item | Phase |
|-----------|-------|
| Logo-led brand treatment (official platform logos from `@hbc/ui-kit` brand asset system) | Phase 02+ |
| 3-zone composition (command band, flagship stage, utility rail, workflow shelves, all-platforms overlay) | Phase 02+ |
| Audience-aware filtering at the component level (audiences are normalized but not yet filtered in the component bridge) | Phase 02+ |
| Search / command entry across platform names, aliases, keywords | Phase 08 |
| Favorites and recently-used utility rail | Phase 04 |
| Responsive breakpoint strategy (desktop → tablet → mobile adaptation) | Phase 07 |
| Stale-content detection using `LastReviewedOn` governance field | Future governance phase |
| Platform notice rendering in the UI (notices are normalized but not yet surfaced as visible badges in the bridge) | Phase 02+ |
| Field-discovery validation endpoint to confirm actual internal names at runtime | Deferred; adapter degrades gracefully for unknown fields |
