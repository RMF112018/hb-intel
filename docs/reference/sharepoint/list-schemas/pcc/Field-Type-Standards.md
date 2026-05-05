# PCC Field Type and Storage Standards

## Web-Informed SharePoint Constraints

- SharePoint lists can technically contain up to 30 million items, but list views are constrained by threshold behavior and must be planned around indexed fields and filtered views.
- A site collection has a combined limit of 2,000 lists and libraries.
- List-item attachments have a 250 MB limit; PCC should avoid attachments for evidence and use document/library references.
- Unique permission scopes are supported up to 50,000 per list/library, but the general recommended limit is 5,000; PCC should avoid item-level unique permissions by default.
- Microsoft Graph represents SharePoint list items as `listItem` resources and stores column values through `fieldValueSet`.
- Microsoft Graph `columnDefinition` supports typed columns such as text, choice, number, dateTime, lookup, personOrGroup, hyperlinkOrPicture, boolean, and others. Hidden columns require explicit selection in Graph responses.
- PnP provisioning schema supports site fields, content types, and lists; PCC list package should be compatible with future provisioning-template generation.

## PCC Rules

1. Use site columns/content types for repeated global fields where provisioning architecture supports it.
2. Use list columns for specialized per-list fields.
3. Do not use multi-value lookup/person fields for high-volume operational joins.
4. Prefer stable text keys for cross-site joins: `ProjectId`, `SystemKey`, `ModuleKey`, `SourceRecordId`, `ExternalObjectId`.
5. Use Person fields only for display/UX convenience; keep UPN text fields as operational keys.
6. Store JSON only for payload detail, not for filtering or primary joins.
7. Attachments are disabled by default.
8. Approval, review, and workflow state must be explicit fields, not inferred from SharePoint moderation alone.
9. Default views must filter first by an indexed field.
10. Lists expected to grow quickly must be indexed before volume builds.

## Default Indexed Field Candidates

- Primary record ID fields
- `ProjectId`
- `ProjectNumber`
- `SystemKey`
- `ModuleKey`
- `SourceKey`
- `SourceRecordId`
- `ExternalObjectId`
- `Status` / `State`
- `IsActive`
- `DueAtUtc` / due-date variants
- `CreatedAtUtc`, `UpdatedAtUtc`, `OccurredAtUtc`
- `CorrelationId`
- `DedupeKey`
