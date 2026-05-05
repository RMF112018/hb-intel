# PCC Project Source References

## 1. Objective
- Planned PCC schema/reference file for `PCC Project Source References`.
- Category: `Project Identity / Site Profile`.
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
- Description: `Project Identity / Site Profile / Project site`
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
| Source Reference ID | SourceReferenceId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Module Key | ModuleKey | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Source System | SourceSystem | Choice | Yes | No | No | No |  |
| Source Entity Type | SourceEntityType | Choice | Yes | No | No | No |  |
| Source Record ID | SourceRecordId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Url | SourceUrl | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Source Item Version | SourceItemVersion | Text | Yes | No | No | No | MaxLength=255 |
| Captured At UTC | CapturedAtUtc | DateTime | Yes | No | No | No |  |
| Captured By UPN | CapturedByUpn | Text | Yes | No | No | No | MaxLength=255 |
| Source Status | SourceStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Freshness Band | FreshnessBand | Choice | Yes | No | No | No |  |
| Is Stale | IsStale | Boolean | Yes | No | No | No |  |
| Source Snapshot JSON | SourceSnapshotJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Redaction Level | RedactionLevel | Choice | Yes | No | No | No |  |
| Security Classification | SecurityClassification | Choice | Yes | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Project Identity / Site Profile operational record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `5`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
