# HB Foleon Homepage Placements

## 1. Objective
- Target-state schema for `HB_FoleonHomepagePlacements` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- **Status: provisioned and tenant-validated (2026-04-25).**
- Code-level source of truth: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
  (`FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA`).

## 2. List-Level Metadata
- List ID: `5b4754b6-9411-453d-8e16-1247ec5b476a`
- Display Name: `Foleon Homepage Placements`
- Internal Name: `HB_FoleonHomepagePlacements`
- Root URL: `/sites/HBCentral/Lists/HB_FoleonHomepagePlacements`
- Template: Generic List (base template 100)
- Hidden: `false`
- Item count at audit: `0`
- Versioning: enabled (major only)
- Attachments: disabled
- Classification: business/custom
- Primary consumer: Foleon SPFx webpart (Highlights route)

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | admin-facing placement label; built-in field not provisioned as a custom launch index |
| Placement Key | PlacementKey | Choice | Yes | Yes | Hero, Primary Card, Secondary Card, Carousel, Archive Rail, Project Spotlight Active, Company Pulse Active |
| Content Lookup | ContentLookup | Lookup | No | Yes | optional during Feature Framework launch; lookup target: `HB_FoleonContentRegistry` |
| Content ID Cache | ContentIdCache | Number | No | Yes | cached `FoleonDocId`; used by the webpart highlight query to resolve without expanding the lookup |
| Is Active | IsActive | Boolean | Yes | Yes | placement on/off |
| Display From | DisplayFrom | DateTime | No | Yes | |
| Display Through | DisplayThrough | DateTime | No | Yes | |
| Sort Rank | SortRank | Number | Yes | Yes | order within placement |
| Audience Groups | AudienceGroups | PersonMulti | No | No | optional placement-level targeting |
| Layout Variant | LayoutVariant | Choice | No | Yes | Large Feature, Compact Card, Square Tile, Text Rail |
| Admin Notes | AdminNotes | Note | No | No | |

## 4. Launch Provisioned Indexed Columns

Feature Framework launch provisioning intentionally avoids over-indexing.
Additional indexes must be created through controlled post-provisioning
and validated before service code treats them as filter-safe.

```
PlacementKey
ContentIdCache
IsActive
DisplayFrom
DisplayThrough
SortRank
LayoutVariant
```

## 5. Recommended Future Indexed Columns

None currently identified for launch-critical runtime paths.

## 6. Lookup Binding

- `ContentLookup` → `HB_FoleonContentRegistry.Title` display field; `Id`
  is the REST join key.
- `ContentLookup` remains in the initial schema because the runtime
  service selects `ContentLookupId`; tenant audit confirms lookup field
  provisioning resolved correctly.
- `ContentIdCache` is a **denormalized cache of FoleonDocId**, not the
  SharePoint `Id`. It exists so the Highlights query can resolve
  placements → content records without a second lookup expansion.
- Admin workflow: when a placement is created or its target content
  changes, the admin form must also update `ContentIdCache` to match
  the target row's `FoleonDocId`. The repo does not auto-synchronize
  this; a backend sync job may be added later (deferred).

## 7. Feature Framework Views

Initial Feature Framework provisioning creates only the minimal default
`All Items` view. Filtered and sorted operational views are intentionally
deferred to controlled post-provision creation after clean-site list
rendering is proven.

## 8. Recommended Post-Provision Views

| View Name | Filter | Sort |
|---|---|---|
| Active Placements | `IsActive = Yes` | `SortRank asc` |

## 9. Service consumers

- `apps/hb-intel-foleon/src/services/FoleonPlacementService.ts`
  - `$select`: `Id, Title, PlacementKey, ContentIdCache,
    ContentLookupId, IsActive, DisplayFrom, DisplayThrough,
    SortRank, LayoutVariant`.
  - `$filter`: `IsActive eq 1` when `activeOnly=true` — indexed.
  - `$top` defaults to 50.
