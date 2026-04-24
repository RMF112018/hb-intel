# HB Foleon Homepage Placements

## 1. Objective
- Target-state schema for `HB_FoleonHomepagePlacements` at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- **Status: not yet provisioned on tenant.** Provision per `apps/hb-intel-foleon/docs/provisioning.md`.
- Code-level source of truth: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
  (`FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA`).

## 2. List-Level Metadata
- List ID: _assigned at provision time_
- Display Name: `Foleon Homepage Placements`
- Internal Name: `HB_FoleonHomepagePlacements`
- Template: Generic List (base template 100)
- Versioning: enabled (major only)
- Attachments: disabled
- Classification: business/custom
- Primary consumer: Foleon SPFx webpart (Highlights route)

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|---|
| Title | Title | Text | Yes | Yes | admin-facing placement label |
| Placement Key | PlacementKey | Choice | Yes | Yes | Hero, Primary Card, Secondary Card, Carousel, Archive Rail |
| Content Lookup | ContentLookup | Lookup | Yes | Yes | lookup target: `HB_FoleonContentRegistry` |
| Content ID Cache | ContentIdCache | Number | No | Yes | cached `FoleonDocId`; used by the webpart highlight query to resolve without expanding the lookup |
| Is Active | IsActive | Boolean | Yes | Yes | placement on/off |
| Display From | DisplayFrom | DateTime | No | Yes | |
| Display Through | DisplayThrough | DateTime | No | Yes | |
| Sort Rank | SortRank | Number | Yes | Yes | order within placement |
| Audience Groups | AudienceGroups | PersonMulti | No | No | optional placement-level targeting |
| Layout Variant | LayoutVariant | Choice | No | Yes | Large Feature, Compact Card, Square Tile, Text Rail |
| Admin Notes | AdminNotes | Note | No | No | |

## 4. Required Indexed Columns

```
PlacementKey
ContentIdCache
IsActive
DisplayFrom
DisplayThrough
SortRank
LayoutVariant
```

## 5. Lookup Binding

- `ContentLookup` → `HB_FoleonContentRegistry.Title` display field; `Id`
  is the REST join key.
- `ContentIdCache` is a **denormalized cache of FoleonDocId**, not the
  SharePoint `Id`. It exists so the Highlights query can resolve
  placements → content records without a second lookup expansion.
- Admin workflow: when a placement is created or its target content
  changes, the admin form must also update `ContentIdCache` to match
  the target row's `FoleonDocId`. The repo does not auto-synchronize
  this; a backend sync job may be added later (deferred).

## 6. Recommended Views

| View Name | Filter | Sort |
|---|---|---|
| Active Placements | `IsActive = Yes` | `SortRank asc` |

## 7. Service consumers

- `apps/hb-intel-foleon/src/services/FoleonPlacementService.ts`
  - `$select`: `Id, Title, PlacementKey, ContentIdCache,
    ContentLookupId, IsActive, DisplayFrom, DisplayThrough,
    SortRank, LayoutVariant`.
  - `$filter`: `IsActive eq 1` when `activeOnly=true` — indexed.
  - `$top` defaults to 50.
