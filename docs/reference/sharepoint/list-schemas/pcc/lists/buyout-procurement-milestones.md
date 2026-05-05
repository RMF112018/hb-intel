# PCC Buyout Procurement Milestones

## 1. Objective
- Planned PCC schema/reference file for `PCC Buyout Procurement Milestones`.
- Category: `Buyout / Procurement`.
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
- Description: `Buyout / Procurement / Project site`
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
| Procurement Milestone ID | ProcurementMilestoneId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Buyout Package ID | BuyoutPackageId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Milestone Type | MilestoneType | Choice | Yes | No | No | No |  |
| Required Date | RequiredDate | DateTime | Yes | No | No | No |  |
| Forecast Date | ForecastDate | DateTime | Yes | No | No | No |  |
| Actual Date | ActualDate | DateTime | No | No | No | No |  |
| Status | Status | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Source System | SourceSystem | Choice | Yes | No | No | No |  |
| Source Lineage ID | SourceLineageId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Schedule Activity ID | ScheduleActivityId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Procore Submittal ID | ProcoreSubmittalId | Text | No | No | No | Yes | Indexed for query/view performance |
| Risk Level | RiskLevel | Text | Yes | No | No | No | MaxLength=255 |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `buyout/procurement control record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.
- Procore references are read-only/mapping references; PCC does not write back into Procore in the MVP posture.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `15`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `7`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
