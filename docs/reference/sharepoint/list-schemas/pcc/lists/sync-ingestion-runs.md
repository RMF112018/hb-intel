# PCC Sync Ingestion Runs

## 1. Objective
- Planned PCC schema/reference file for `PCC Sync Ingestion Runs`.
- Category: `Workflow / Business Audit / Configuration`.
- Storage posture: `Global / HBCentral or project site depending on source`.
- Classification posture: `contract-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `contract-derived-required`
- Description: `Workflow / Business Audit / Configuration / Global / HBCentral or project site depending on source`
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
| Run ID | RunId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| System Key | SystemKey | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Module Key | ModuleKey | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Run Type | RunType | Choice | Yes | No | No | No |  |
| Run Status | RunStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Started UTC | StartedUtc | DateTime | Yes | No | No | No |  |
| Completed UTC | CompletedUtc | DateTime | No | No | No | No |  |
| Triggered By | TriggeredBy | Text | Yes | No | No | No | MaxLength=255 |
| Correlation ID | CorrelationId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Records Processed | RecordsProcessed | Text | Yes | No | No | No | MaxLength=255 |
| Records Created | RecordsCreated | Text | Yes | No | No | No | MaxLength=255 |
| Records Updated | RecordsUpdated | DateTime | Yes | No | No | No |  |
| Records Skipped | RecordsSkipped | Text | Yes | No | No | No | MaxLength=255 |
| Errors JSON | ErrorsJson | Note | No | No | No | No | RichText=false; Lines=6 |
| Summary JSON | SummaryJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Workflow / Business Audit / Configuration operational record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `17`
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
