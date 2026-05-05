# PCC Priority Action Candidates

## 1. Objective
- Planned PCC schema/reference file for `PCC Priority Action Candidates`.
- Category: `Priority Actions`.
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
- Description: `Priority Actions / Project site`
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
| Priority Action ID | PriorityActionId | Choice | No | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Category | Category | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Summary | Summary | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Due Date | DueDate | DateTime | Yes | No | No | Yes | Indexed for query/view performance |
| Assignee Persona | AssigneePersona | Text | Yes | No | No | No | MaxLength=255 |
| Related Work Center | RelatedWorkCenter | Text | Yes | No | No | No | MaxLength=255 |
| Severity | Severity | Choice | Yes | No | No | No |  |
| Related Workflow Item ID | RelatedWorkflowItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Source Module | SourceModule | Text | Yes | No | No | No | MaxLength=255 |
| Source Record ID | SourceRecordId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Dedupe Key | DedupeKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Item Status | ItemStatus | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Sort Order | SortOrder | Number | Yes | No | No | No |  |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `priority action source/candidate record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Workflow records join to PCC Workflow Items through `WorkflowItemId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `15`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `8`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
