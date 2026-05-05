# PCC Document References

## 1. Objective
- Planned PCC schema/reference file for `PCC Document References`.
- Category: `Document Control`.
- Storage posture: `Project site`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Document Control / Project site`
- Hidden: `false`
- Item Count: ``
- Content Types Enabled: ``
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `false`

## 3. Field Schema

| Display Name | Internal Name | Type | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
|---|---|---|---|---|---|---|---|
| Title | Title | Text | Yes | No | No | No | MaxLength=255 |
| Document Reference ID | DocumentReferenceId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Key | SourceKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Document Control Source ID | DocumentControlSourceId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| File Name | FileName | Text | Yes | No | No | No | MaxLength=255 |
| File Extension | FileExtension | Text | Yes | No | No | No | MaxLength=255 |
| Drive ID | DriveId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| List ID | ListId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Drive Item ID | DriveItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Share Point Item ID | SharePointItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Folder Path | FolderPath | Text | Yes | No | No | No | MaxLength=255 |
| Web Url | WebUrl | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Document Category | DocumentCategory | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Review State | ReviewState | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Review Type | ReviewType | Choice | Yes | No | No | No |  |
| Assigned Role Code | AssignedRoleCode | Text | Yes | No | No | No | MaxLength=255 |
| Current Version Label | CurrentVersionLabel | Text | Yes | No | No | No | MaxLength=255 |
| Last Observed At UTC | LastObservedAtUtc | DateTime | Yes | No | No | No |  |
| Source Status | SourceStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Security Classification | SecurityClassification | Choice | Yes | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `document control reference / action register`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Evidence/document references should resolve through Document Control rather than list-item attachments.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `21`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `11`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
