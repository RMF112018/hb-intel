# PCC Cross Stage Traceability Links

## 1. Objective
- Planned PCC schema/reference file for `PCC Cross Stage Traceability Links`.
- Category: `Project Memory / Traceability / HBI Grounding`.
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
- Description: `Project Memory / Traceability / HBI Grounding / Project site`
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
| Traceability Edge ID | TraceabilityEdgeId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Edge Type | EdgeType | Choice | Yes | No | No | No |  |
| Direction | Direction | Text | Yes | No | No | No | MaxLength=255 |
| From Record ID | FromRecordId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| From Record Type | FromRecordType | Choice | Yes | No | No | No |  |
| To Record ID | ToRecordId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| To Record Type | ToRecordType | Choice | Yes | No | No | No |  |
| Rationale | Rationale | Note | No | No | No | No | RichText=false; Lines=6 |
| Confidence | Confidence | Choice | Yes | No | No | No |  |
| Source Lineage JSON | SourceLineageJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Project Memory / Traceability / HBI Grounding operational record`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `12`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `4`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
