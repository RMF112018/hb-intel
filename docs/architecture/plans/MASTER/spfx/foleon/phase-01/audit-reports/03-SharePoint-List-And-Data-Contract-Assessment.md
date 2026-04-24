# 03 — SharePoint List and Data-Contract Assessment

## Implemented Lists

The expected implemented lists are:

- `HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements`

Repo truth did not expose these list schemas, provisioning files, or implementation code. Therefore, list/data readiness is unproven.

## Required `HB_FoleonContentRegistry` Contract

Minimum recommended fields:

| Field | Type | Index | Notes |
|---|---|---:|---|
| `Title` | Text | Optional | Human-readable title |
| `FoleonDocId` | Number/Text | Yes | Stable source ID from Foleon |
| `FoleonProjectId` | Number/Text | Yes | Required for future project registry |
| `ContentTypeKey` | Choice/Text | Yes | Used for Content Hub filters |
| `PublishStatus` | Choice | Yes | `Draft`, `Published`, `Archived`, etc. |
| `IsVisible` | Boolean | Yes | Primary suppression gate |
| `AllowEmbed` | Boolean | Yes | Reader gate predicate |
| `RequiresExternalOpen` | Boolean | Yes | Reader gate predicate |
| `PublishedUrl` | Hyperlink/Text | No | Must be parseable and normalized |
| `PreviewUrl` | Hyperlink/Text | No | Must be disabled by default |
| `EmbedUrl` | Hyperlink/Text | No | If different from published URL |
| `Origin` | Text | Yes | Normalized exact origin for policy checks |
| `DisplayStartUtc` | DateTime | Yes | Display window start |
| `DisplayEndUtc` | DateTime | Yes | Display window end |
| `Summary` | Multiple lines text | No | Render as text unless sanitized |
| `AudienceGroupIds` | Text/Lookup | Yes if used | Must be explicit if audience targeting is required |
| `ManualOverrideStatus` | Choice | Yes | Must not overwrite source sync accidentally |
| `LastSyncedUtc` | DateTime | Yes | Sync health |

## Required `HB_FoleonHomepagePlacements` Contract

Minimum recommended fields:

| Field | Type | Index | Notes |
|---|---|---:|---|
| `PlacementKey` | Text | Yes | Deterministic homepage slot key |
| `ContentRegistryItemId` | Lookup | Yes | Lookup into content registry |
| `IsActive` | Boolean | Yes | Placement suppression |
| `SortOrder` | Number | Yes | Query/order stability |
| `DisplayStartUtc` | DateTime | Yes | Placement window |
| `DisplayEndUtc` | DateTime | Yes | Placement window |
| `AudienceGroupIds` | Text/Lookup | Yes if used | If targeting differs from content item |
| `ManualPin` | Boolean | Yes | Editorial override semantics |
| `LastReviewedUtc` | DateTime | Optional | Governance/support |

## Query Safety

Production-safe SharePoint list usage requires:

- Server-side filters on indexed columns for homepage and Reader lookups.
- `$select` / `$expand` discipline to avoid heavy payloads.
- Deterministic `$top` limits.
- Avoiding client-side filtering over unbounded registry lists.
- Provisioning proof that required columns exist with correct internal names and indexes.
- A threshold test plan that proves queries remain safe past 5,000 items.

## Deferred Lists

### `HB_FoleonProjectsRegistry`

Decision: **production blocker if project-level filtering, ownership, or analytics drilldown is in scope for launch.** Otherwise, wave-two.

### `HB_FoleonAnalyticsSnapshots`

Decision: **production blocker if leadership expects analytics at launch.** Otherwise, wave-two with a backend sync prerequisite.

### `HB_FoleonSyncRuns`

Decision: **production blocker for any automated sync.** Without it, support cannot distinguish stale content, API failure, manual override, and partial sync.

## Data-Contract Risk

If the app launches against manually maintained lists without schema proof, index proof, and ownership rules, the system will appear functional while being operationally fragile. That is unacceptable for a governed HB Central production integration.
