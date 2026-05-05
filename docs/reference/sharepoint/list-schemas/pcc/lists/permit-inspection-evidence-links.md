# PCC Permit Inspection Evidence Links

## 1. Objective
- Planned PCC schema/reference file for `PCC Permit Inspection Evidence Links`.
- Category: `Permit & Inspection Control Center`.
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
- Description: `Permit & Inspection Control Center / Project site`
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
| Evidence Link ID | EvidenceLinkId | Text | No | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Family | SourceFamily | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Source Record ID | SourceRecordId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Label | Label | Text | Yes | No | No | No | MaxLength=255 |
| Evidence Status | EvidenceStatus | Choice | No | No | No | Yes | Indexed for query/view performance |
| External Ref | ExternalRef | Text | No | No | No | No | MaxLength=255 |
| Owned By Document Control | OwnedByDocumentControl | Text | Yes | No | No | No | MaxLength=255 |
| Document Reference ID | DocumentReferenceId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Verified At UTC | VerifiedAtUtc | DateTime | Yes | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Permit & Inspection Control Center operational record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Evidence/document references should resolve through Document Control rather than list-item attachments.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `11`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `6`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
