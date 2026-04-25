# Root Cause and Remediation

## Executive Summary

The hosted `400` is caused by the runtime `$select`, not by missing lists, wrong GUIDs, missing fields, or the homepage filter.

The content registry is correctly provisioned and the configured GUID resolves to the intended list. The combined filter succeeds when paired with a scalar-safe select. The first failing segment is the full schema-derived select because it asks SharePoint REST for `MarketingOwner` as if it were a scalar field.

## Evidence

### GUID Resolution

```text
Provided GUID: 2e57615d-457e-49b8-aef3-038e85cbe068
Resolved title: Foleon Content Registry
Root folder: /sites/HBCentral/Lists/HB_FoleonContentRegistry
Item count: 0
```

### Successful Filter Probe

```text
/_api/web/lists(guid'2e57615d-457e-49b8-aef3-038e85cbe068')/items
  ?$select=Id,Title,FoleonDocId,IsVisible,PublishStatus,IsHomepageEligible
  &$filter=IsVisible eq 1 and PublishStatus eq 'Published' and IsHomepageEligible eq 1
  &$top=1
```

Result: `200` with an empty `value` array.

### Failing Projection Probe

```text
/_api/web/lists(guid'2e57615d-457e-49b8-aef3-038e85cbe068')/items
  ?$select=Id,Title,FoleonDocId,FoleonDocUid,FoleonIdentifier,FoleonProjectId,FoleonProjectName,ContentTypeKey,PublishStatus,IsVisible,IsFeatured,IsHomepageEligible,PublishedUrl,PreviewUrl,EmbedUrl,ThumbnailUrl,HeroImageUrl,Summary,MarketingOwner,...
  &$top=1
```

Result: SharePoint rejects the query before row materialization:

```text
The query to field 'MarketingOwner' is not valid. The $select query string must specify the target fields and the $expand query string must contains MarketingOwner.
```

## Why This Happens

`FoleonContentService.ts` builds the public content query from:

```text
Id,${selectFieldsFor(FOLEON_CONTENT_REGISTRY_SCHEMA)}
```

That design keeps the runtime query tied to the canonical schema, but it also pulls in fields that are not scalar-safe for SharePoint REST list item reads.

The first invalid projection is `MarketingOwner`, a person field provisioned as:

```text
Type="User" List="UserInfo" ShowField="ImnName"
```

`AudienceGroups` is also a person field, provisioned as:

```text
Type="UserMulti" List="UserInfo" Mult="TRUE" ShowField="ImnName"
```

Direct `$select=MarketingOwner` is invalid in SharePoint REST. A query must either omit the person field or select a target property with `$expand`, for example:

```text
$select=MarketingOwner/Title&$expand=MarketingOwner
```

## Schema Drift Assessment

No blocking tenant schema drift was found for provisioned custom fields:

- `HB_FoleonContentRegistry`: 39/39 expected custom fields present.
- `HB_FoleonHomepagePlacements`: 10/10 expected custom fields present.
- `HB_FoleonInteractionEvents`: 13/13 expected custom fields present.
- `HB_FoleonSyncRuns`: 12/12 expected custom fields present.

The display-title difference is expected: Feature Framework provisions `Title="Foleon Content Registry"` with `Url="Lists/HB_FoleonContentRegistry"`. Runtime code correctly binds by GUID, so title drift does not cause the hosted failure.

## Remediation Options

### Option A - Preferred Public Route Fix

Define an explicit scalar-safe public content select list in `FoleonContentService.ts` containing only fields consumed by `toFoleonContentRecord()`.

Benefits:

- Fixes hosted `400`.
- Keeps public routes fast and narrow.
- Avoids expanding person fields that are not currently used in the public display model.
- Preserves existing filter discipline.

### Option B - Add Expanded Person Projections

Support `MarketingOwner` and `AudienceGroups` with `$expand` and target properties.

Benefits:

- Preserves person metadata for future surfaces.

Risks:

- Requires mapping and tests for REST shapes.
- Multi-person fields add more parsing complexity.
- Public routes currently do not render this data, so this widens the query without immediate value.

### Option C - Split Public and Manager Query Shapes

Use a narrow scalar-safe public query for Highlights, Hub, and Reader. Add a richer manager-only query later if admin screens need person/audience details.

Benefits:

- Aligns query shape with route needs.
- Avoids public route regressions.
- Leaves room for manager-specific expansions.

Recommended path: implement Option A now, with a test proving person fields are excluded from public `$select` and the homepage filter still uses only indexed fields.
