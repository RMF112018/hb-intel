# Follow-Up Implementation Prompt

Implement the hosted SharePoint REST fix for the Foleon public content query.

## Context

Tenant audit `tenant-schema-audit-2026-04-25-content-registry-400` found that the configured content registry GUID is correct, the list is provisioned, and the public homepage filter succeeds when paired with a scalar-safe select. The hosted `400` starts when `FoleonContentService.ts` adds the full schema-derived `$select`.

SharePoint rejects the direct person-field projection:

```text
The query to field 'MarketingOwner' is not valid. The $select query string must specify the target fields and the $expand query string must contains MarketingOwner.
```

`MarketingOwner` and `AudienceGroups` are not consumed by `toFoleonContentRecord()` today.

## Required Change

Update `apps/hb-intel-foleon/src/services/FoleonContentService.ts` so public content reads use an explicit scalar-safe select list instead of `Id,${selectFieldsFor(FOLEON_CONTENT_REGISTRY_SCHEMA)}`.

The select list should include only fields consumed by `toFoleonContentRecord()`:

```text
Id,Title,FoleonDocId,FoleonDocUid,FoleonIdentifier,FoleonProjectId,FoleonProjectName,ContentTypeKey,PublishStatus,IsVisible,IsFeatured,IsHomepageEligible,PublishedUrl,PreviewUrl,EmbedUrl,ThumbnailUrl,HeroImageUrl,Summary,IssueDate,PublishedOn,DisplayFrom,DisplayThrough,SortRank,RelatedProjectNumber,RelatedProjectName,Region,Sector,OpenMode,AllowEmbed,RequiresExternalOpen,SyncSource
```

Do not include:

```text
MarketingOwner,AudienceGroups,Tags,FirstPublishedOn,FoleonModifiedOn,RelatedProjectSiteUrl,LastSynced,SyncHash,RawFoleonJson,AdminNotes
```

## Guardrails

- Keep GUID binding unchanged.
- Keep homepage/public filters unchanged:
  - `FoleonDocId`
  - `IsVisible`
  - `PublishStatus`
  - `IsHomepageEligible`
- Preserve `assertFiltersAreIndexed()`.
- Add a select-list assertion helper or test that verifies every public selected field is present in `FOLEON_CONTENT_REGISTRY_SCHEMA`, while allowing `Id`.
- Add a test proving `FOLEON_CONTENT_SELECT_FIELDS` does not contain `MarketingOwner` or `AudienceGroups`.
- Add a test proving `fetchFoleonContent()` still emits `$select`, `$filter`, and `$top` correctly for `publishedOnly + homepageEligibleOnly`.
- Do not add `$expand` for public routes in this fix.
- Do not change tenant provisioning XML unless a separate manager/person-field story requires it.

## Acceptance Checks

Run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon lint
```

If package proof is part of the branch closure, also run:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Expected Outcome

The hosted public Highlights/Hub query should return `200` with an empty row set on a newly provisioned list, allowing the preview fallback to render instead of surfacing `HB_FoleonContentRegistry request failed: 400`.
