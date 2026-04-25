# 04 — Data Model and SharePoint Contract

## Storage model

The connector writes to HBCentral SharePoint lists through backend Graph calls.

## Lists

### `HB_FoleonContentRegistry`

Primary content source of truth.

Owned by connector backend after launch.

User-managed through UI fields:

- Title
- Foleon Doc ID
- Content Type
- Publish Status
- Is Visible
- Is Featured
- Is Homepage Eligible
- Published URL
- Embed URL
- Thumbnail URL
- Hero Image URL
- Summary
- Marketing Owner
- Issue Date
- Published On
- Display From
- Display Through
- Sort Rank
- Related Project Number
- Related Project Name
- Region
- Sector
- Tags
- Open Mode
- Allow Embed
- Requires External Open
- Admin Notes

System-managed fields:

- Foleon Doc UID
- Foleon Identifier
- Foleon Project ID
- Foleon Project Name
- First Published On
- Foleon Modified On
- Last Synced
- Sync Source
- Sync Hash
- Raw Foleon JSON

### `HB_FoleonHomepagePlacements`

Editorial placement source for the Highlights/homepage route.

User-managed through connector:

- Title
- Placement Key
- Content selection
- Is Active
- Display From
- Display Through
- Sort Rank
- Layout Variant
- Admin Notes

System-managed:

- ContentLookup
- ContentIdCache
- Audience Groups, if later implemented

Important rule:

`ContentIdCache` must always equal the target registry row’s `FoleonDocId`, not the SharePoint item ID.

### `HB_FoleonInteractionEvents`

Telemetry list.

Users do not manage this list.

Writes should come from the display app or future backend telemetry endpoint.

### `HB_FoleonSyncRuns`

Operational backend sync log.

Users do not create these manually.

The connector reads this list through backend status routes.

## GUID behavior

Runtime display app should continue to bind by list GUID.

Provisioning/validation should output:

```json
{
  "contentRegistryListId": "...",
  "placementsListId": "...",
  "eventsListId": "...",
  "syncRunsListId": "..."
}
```

## Provisioning strategy

Do not rely on fragile SPFx Feature Framework custom schema provisioning for these complex lists.

Preferred strategy:

- backend/admin provisioning command creates lists;
- fields are added one-by-one;
- indexes are applied after fields exist;
- lookup fields are added after target lists exist;
- `RenderListDataAsStream` validation proves each list can render;
- Graph/REST read validation proves each list can be queried.

## Mutation ownership

| List | Create | Update | Delete / Suppress |
|---|---|---|---|
| Content Registry | Backend | Backend | Backend; prefer suppress/archive over delete |
| Homepage Placements | Backend | Backend | Backend; prefer deactivate over delete |
| Interaction Events | Display app/backend | Append-only | Retention job only |
| Sync Runs | Backend | Backend | Retention/admin only |

## Field-level safety

The connector must prevent invalid combinations:

- `PublishStatus=Published` without `PublishedUrl` or `EmbedUrl`.
- `AllowEmbed=true` with disallowed origin.
- `RequiresExternalOpen=true` with `OpenMode=Inline Reader` unless UI clearly treats it as fallback.
- active homepage placement pointing to draft/suppressed content without explicit scheduling exception.
- placement `ContentIdCache` not matching selected content record.
- expired content with active placement unless intentionally preserved for history.

## Record lifecycle

```text
Draft
→ Validated
→ Published
→ Featured / Placed
→ Archived or Suppressed
```

Suggested status mapping:

- Draft: editable, not displayed.
- Preview: internal review only, not public display.
- Published: displayable if `IsVisible=true`.
- Archived: retained but not in active discovery unless archive filter is enabled.
- Offline: known Foleon-side unavailable.
- Suppressed: intentionally blocked in HB Central.
