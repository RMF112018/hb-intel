# Foleon Tenant Schema Audit - Content Registry 400

## Scope

This audit validates the HBCentral Foleon SharePoint lists at `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` after provisioning and isolates the hosted runtime failure:

```text
HB_FoleonContentRegistry request failed: 400
```

The reported failing runtime query used the content registry GUID `2e57615d-457e-49b8-aef3-038e85cbe068` with:

```text
IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1
```

## Tenant Findings

- The provided GUID resolves to `Foleon Content Registry`.
- The list root is `/sites/HBCentral/Lists/HB_FoleonContentRegistry`.
- The list currently has `0` items.
- All four Foleon lists are provisioned with display titles from `elements.xml`, not with `HB_`-prefixed display titles.
- Custom fields, required flags, index flags, and `FoleonDocId` uniqueness match the Feature Framework XML assets for all four lists.

## Query Findings

The combined public filter is not the root cause. The following probes succeeded against the content registry GUID:

- `$select=Id,Title`
- `$select=Id,Title,FoleonDocId`
- `$select=Id,Title,FoleonDocId,IsVisible,PublishStatus,IsHomepageEligible`
- `$filter=IsVisible eq 1`
- `$filter=PublishStatus eq 'Published'`
- `$filter=IsHomepageEligible eq 1`
- `$filter=IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1`

The failure starts when the full runtime `$select` derived from `FOLEON_CONTENT_REGISTRY_SCHEMA` is added.

## Root Cause

`FoleonContentService.ts` derives `$select` from every field in `FOLEON_CONTENT_REGISTRY_SCHEMA`. That includes SharePoint person fields:

- `MarketingOwner`
- `AudienceGroups`

SharePoint REST list item queries cannot directly select person fields as scalar fields. The tenant returns:

```text
The query to field 'MarketingOwner' is not valid. The $select query string must specify the target fields and the $expand query string must contains MarketingOwner.
```

Because `MarketingOwner` appears before `AudienceGroups` in the runtime select list, it is the first rejected projection. The empty list still fails because SharePoint validates `$select` before returning rows.

## Recommended Fix

Narrow the public content read model to scalar fields actually consumed by `toFoleonContentRecord()`. Do not select unused governance/admin fields on public routes. If person metadata is needed later, add an explicit expanded projection such as `MarketingOwner/Title` with `$expand=MarketingOwner` in a manager-specific service path.

## Artifacts

- `exports/tenant-list-inventory.json`
- `exports/HB_FoleonContentRegistry.list.json`
- `exports/HB_FoleonContentRegistry.fields.json`
- `exports/HB_FoleonHomepagePlacements.list.json`
- `exports/HB_FoleonHomepagePlacements.fields.json`
- `exports/HB_FoleonInteractionEvents.list.json`
- `exports/HB_FoleonInteractionEvents.fields.json`
- `exports/HB_FoleonSyncRuns.list.json`
- `exports/HB_FoleonSyncRuns.fields.json`
- `exports/query-probe-results.json`
- `exports/repo-tenant-schema-comparison.json`
- `repo-tenant-schema-comparison.md`
- `root-cause-and-remediation.md`
- `follow-up-implementation-prompt.md`
