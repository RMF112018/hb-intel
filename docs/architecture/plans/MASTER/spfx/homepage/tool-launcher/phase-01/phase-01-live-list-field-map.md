# Phase 01 — Live List Field Audit and Mapping

## 1. List Access Method Used

**List title:** `Tool Launcher Contents`
**Site:** HBCentral

**Inspection method:** The list was created and seeded directly in the SharePoint tenant. No provisioning script, PnP template, or site-script artifact exists in the repository. The field contract was derived from:

1. The architecture brief field contract (`Tool_Launcher_Work_Hub_Webpart_Architecture_and_Layout.md` §"Recommended live-field contract to normalize") — the authoritative planned schema
2. The reference implementation pattern (`apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`) — proves the SharePoint REST API field-naming convention used in this repo
3. The asset manifest (`tool-launcher-asset-manifest.ts`) — confirms the 9 seeded platform records and their identity/URL/logo metadata

**Expected API access pattern:** SharePoint REST API via `/_api/web/lists/getbytitle('Tool Launcher Contents')/items` with `$select`, `$filter`, and `odata=nometadata`, following the proven pattern from `projectSpotlightListSource.ts`.

**Wire-testing requirement:** The internal names below follow SharePoint's standard column creation convention (display name → PascalCase internal name, spaces removed). The Project Spotlight list confirms this convention holds for lists created on this tenant. However, **actual internal names must be validated at runtime** during the adapter implementation in Prompt 03. SharePoint may encode special characters (e.g., `_x0020_` for spaces) or truncate long names depending on how columns were added. The adapter must include a field-discovery validation step.

## 2. Verified Field Map

### Core identity fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Title | `Title` | Single line of text | `string` | All surfaces (platform name) | **Required** — no fallback; skip record if missing |
| Platform Key | `PlatformKey` | Single line of text | `string` | Asset manifest lookup, dedup | **Required** — fallback to slugified Title |
| Launch URL | `LaunchURL` | Hyperlink | `string \| { Url, Description }` | All surfaces (navigation) | **Required** — skip record if missing |

### Logo and brand treatment fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Official Logo Asset Reference | `OfficialLogoAssetReference` | Single line of text | `string` (asset path) | Flagship stage, workflow shelves | Optional — fallback to asset manifest then Lucide icon |
| Dark Logo Asset Reference | `DarkLogoAssetReference` | Single line of text | `string` (asset path) | Dark-surface rendering | Optional — fallback to light logo variant |
| Preferred Logo Type | `PreferredLogoType` | Choice | `string` (e.g., `'official-wordmark'`, `'official-symbol'`, `'tenant-wordmark'`, `'text-fallback'`) | Logo rendering decision | Optional — fallback to `'official-wordmark'` |

### Content and description fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Short Descriptor | `ShortDescriptor` | Single line of text | `string` | All card types | Optional — render without subtitle if empty |
| Category | `Category` | Choice or single line | `string` | All-platforms grouping, search | Optional — ungrouped if empty |
| Workflow Shelf | `WorkflowShelf` | Choice | `string` (e.g., `'People & Payroll'`, `'Field & Operations'`, `'Training & Compliance'`, `'Finance & Admin'`) | Workflow shelf assignment | Optional — excluded from shelves if empty |
| Aliases / Keywords | `AliasesKeywords` | Multiple lines of text | `string` (comma or semicolon separated) | Search matching | Optional — search by name/descriptor only |
| Notes | `Notes` | Multiple lines of text | `string` | Governance reference | Optional — not rendered in UI |

### Visibility and featured fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Is Active | `IsActive` | Yes/No | `boolean` | All surfaces (filter gate) | Optional — default `true` if missing |
| Featured | `Featured` | Yes/No | `boolean` | Flagship stage selection | Optional — default `false` |
| Featured Sort Order | `FeaturedSortOrder` | Number | `number` | Flagship stage ordering | Optional — default `999`; only meaningful when Featured is true |
| Sort Order | `SortOrder` | Number | `number` | General ordering in shelves and index | Optional — default `999`; alphabetical tiebreaker |
| Audience Visibility | `AudienceVisibility` | Choice (multi) or single line | `string` or `string[]` | Role-based filtering | Optional — visible to all if empty |
| Audience Rules JSON | `AudienceRulesJSON` | Multiple lines of text | `string` (JSON) | Advanced audience logic | Optional — ignored if empty; falls back to simple AudienceVisibility |
| Open in New Tab | `OpenInNewTab` | Yes/No | `boolean` | Launch behavior | Optional — default `true` for external URLs |
| Favorite Eligible | `FavoriteEligible` | Yes/No | `boolean` | Favorites rail | Optional — default `true` |

### Support and help fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Help Link | `HelpLink` | Hyperlink | `string \| { Url, Description }` | Help/access actions | Optional — hide help action if empty |
| Support Owner | `SupportOwner` | Single line of text | `string` | Support routing display | Optional — hide support info if empty |
| Support Owner Reference | `SupportOwnerReference` | Person or Hyperlink | `string \| { Url, Description } \| SpPersonValue` | Support routing navigation | Optional — fall back to SupportOwner text |
| Access Request Destination | `AccessRequestDestination` | Hyperlink | `string \| { Url, Description }` | Access request CTA | Optional — hide request-access action if empty |

### Notice and status fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Notice Status | `NoticeStatus` | Choice | `string` (e.g., `'none'`, `'outage'`, `'maintenance'`, `'info'`) | Notice badge rendering | Optional — no badge if empty or `'none'` |
| Notice Badge Text | `NoticeBadgeText` | Single line of text | `string` | Badge label | Optional — derive from NoticeStatus if empty |
| Notice Details | `NoticeDetails` | Multiple lines of text | `string` | Notice tooltip/detail | Optional — badge only if empty |
| Notice Expires On | `NoticeExpiresOn` | Date | `string` (ISO 8601) | Auto-expiry of notices | Optional — notice persists until manually cleared |
| Status Badge Tone | `StatusBadgeTone` | Choice | `string` (e.g., `'neutral'`, `'info'`, `'warning'`, `'critical'`, `'success'`) | Badge variant styling | Optional — default `'info'` |

### Governance and metadata fields

| Display name | Expected internal name | SP field type | Runtime value shape | Required for | Optional / fallback |
|---|---|---|---|---|---|
| Vendor / Product Family | `VendorProductFamily` | Single line of text | `string` | Governance grouping | Optional — informational only |
| Tenant / Environment Label | `TenantEnvironmentLabel` | Single line of text | `string` | Environment disambiguation | Optional — informational only |
| Requires Review | `RequiresReview` | Yes/No | `boolean` | Governance flag | Optional — default `false` |
| Last Reviewed On | `LastReviewedOn` | Date | `string` (ISO 8601) | Staleness detection | Optional — no staleness check if empty |

## 3. Mismatches and Normalization Needs

### Internal name uncertainty

| Concern | Detail | Adapter action |
|---------|--------|----------------|
| Space encoding | SharePoint may encode spaces as `_x0020_` in internal names if columns were added after list creation (e.g., `Short_x0020_Descriptor` instead of `ShortDescriptor`) | The adapter must include a field-discovery step using `/_api/web/lists/getbytitle('Tool Launcher Contents')/fields?$select=Title,InternalName,TypeAsString` to resolve actual internal names before building the `$select` list |
| Name truncation | SharePoint truncates internal names beyond ~32 characters. Fields like `AccessRequestDestination` or `OfficialLogoAssetReference` may be truncated | Field-discovery validation will catch truncation; the `SP_FIELDS` constant map must use validated internal names |
| Person field shape | `SupportOwnerReference` may be a Person field requiring `$expand` or may be a Hyperlink. The type determines the query shape | Detect type via field metadata; if Person, add to `$expand`; if Hyperlink, use `extractUrl()` |
| Multi-value choice | `AudienceVisibility` may be Choice (multi-select) returning `{ results: string[] }` instead of a plain string | Normalize to `string[]` regardless of whether the API returns a flat string or a results array |

### Hyperlink field normalization

All Hyperlink fields (`LaunchURL`, `HelpLink`, `SupportOwnerReference` if Hyperlink, `AccessRequestDestination`) may return either a plain string or `{ Url, Description }` depending on odata verbosity. The adapter must use the `extractUrl()` pattern proven in `projectSpotlightListSource.ts`.

### Choice field value alignment

Choice fields (`PreferredLogoType`, `WorkflowShelf`, `Category`, `NoticeStatus`, `StatusBadgeTone`) return the selected label as a string. The adapter must validate values against expected enums and fall back to defaults for unrecognized values.

### JSON field parsing

`AudienceRulesJSON` is stored as plain text. The adapter must:
1. Attempt `JSON.parse()`
2. Validate the parsed shape against the expected audience-rules contract
3. Fall back to ignoring the field if parsing fails or shape is unexpected

### Boolean field defaults

SharePoint Yes/No fields may return `null` for items created before the column was added. The adapter must apply explicit defaults:
- `IsActive` → `true`
- `Featured` → `false`
- `OpenInNewTab` → `true`
- `FavoriteEligible` → `true`
- `RequiresReview` → `false`

### Date field format

Date fields (`NoticeExpiresOn`, `LastReviewedOn`) return ISO 8601 strings. The adapter must handle `null`, empty string, and invalid date values gracefully using the `Date.parse()` guard pattern from `projectSpotlightListSource.ts`.

## 4. Critical Fields vs Optional Fields

### Critical — record is skipped without these

| Field | Reason |
|-------|--------|
| `Title` | Platform identity; cannot render a card without a name |
| `LaunchURL` | Navigation target; a launcher item without a destination is useless |

### High importance — degraded but functional without these

| Field | Degradation |
|-------|-------------|
| `PlatformKey` | Cannot match asset manifest; fall back to slugified Title |
| `IsActive` | Cannot filter deactivated platforms; assume all active |
| `Featured` | Cannot populate flagship stage; all items treated as non-featured |
| `WorkflowShelf` | Cannot assign to workflow shelves; item appears only in all-platforms |
| `SortOrder` | Cannot order items; alphabetical fallback |
| `ShortDescriptor` | Cards render without subtitle line |

### Medium importance — feature-specific

| Field | Feature affected |
|-------|-----------------|
| `OfficialLogoAssetReference`, `DarkLogoAssetReference`, `PreferredLogoType` | Logo-led brand treatment; Lucide icon fallback |
| `FeaturedSortOrder` | Flagship stage ordering; fallback to SortOrder |
| `AudienceVisibility`, `AudienceRulesJSON` | Role-based filtering; show to all if missing |
| `Category` | All-platforms grouping; ungrouped fallback |
| `AliasesKeywords` | Search scope reduced to name + descriptor |
| `NoticeStatus`, `NoticeBadgeText`, `StatusBadgeTone` | Badge rendering; no badge shown |

### Low importance — governance or future features

| Field | Notes |
|-------|-------|
| `HelpLink`, `SupportOwner`, `SupportOwnerReference`, `AccessRequestDestination` | Utility rail actions hidden if empty |
| `NoticeDetails`, `NoticeExpiresOn` | Notice detail and auto-expiry |
| `OpenInNewTab`, `FavoriteEligible` | Behavioral flags with sensible defaults |
| `VendorProductFamily`, `TenantEnvironmentLabel` | Informational metadata |
| `RequiresReview`, `LastReviewedOn`, `Notes` | Governance-only; not rendered in UI |

## 5. Immediate Coding Implications

### 1. Field-discovery step is required before building the adapter

The adapter must **not** hard-code internal names based on planning assumptions alone. Before constructing the `$select` query, the adapter must validate actual internal names by querying the list's field metadata endpoint:

```
/_api/web/lists/getbytitle('Tool Launcher Contents')/fields
  ?$select=Title,InternalName,TypeAsString
  &$filter=Hidden eq false
```

This produces a map of `{ displayName → internalName }` that the adapter uses to build type-safe field references. The field map should be cached per session (it does not change at runtime).

### 2. SP_FIELDS constant must use validated internal names

Following the `projectSpotlightListSource.ts` pattern, define an `SP_FIELDS` constant object mapping logical names to validated SharePoint internal names. The constant must be populated from the field-discovery result or, as a pragmatic starting point, from the expected internal names documented above — with a runtime validation fallback.

### 3. Hyperlink fields need extractUrl()

Reuse or replicate the `extractUrl()` helper from `projectSpotlightListSource.ts` for: `LaunchURL`, `HelpLink`, `SupportOwnerReference` (if Hyperlink), `AccessRequestDestination`.

### 4. The raw item interface must be fully optional

Every field in the `RawToolLauncherListItem` interface must be optional (`?`) because:
- Items created before a column was added will have `null`/`undefined` for that column
- The list may be partially seeded
- SharePoint may omit fields from the response if they have no value

### 5. Normalization must happen at the list-source boundary

All SharePoint-specific value shapes (Hyperlink objects, Choice results arrays, HTML entities, JSON-encoded strings, Person field shapes) must be normalized to clean TypeScript types at the mapping boundary — before the data reaches the domain model or the component layer. Downstream code must never handle raw SharePoint shapes.

### 6. The adapter must not regress the current local-config path

The local grouped-config seam in `ToolLauncherWorkHubWebPart.manifest.json` must remain functional as a development fallback until the live adapter is proven. The component should accept either source through a discriminated data-source pattern (e.g., `{ source: 'list', items: ... } | { source: 'config', config: ... }`).

### 7. SupportOwnerReference type must be detected at field-discovery time

If `SupportOwnerReference` is a Person field, it requires `$expand` in the REST query (same pattern as `ProjectTeamMembers` in the spotlight adapter). If it is a Hyperlink, it uses `extractUrl()`. The adapter must branch on the detected field type.
