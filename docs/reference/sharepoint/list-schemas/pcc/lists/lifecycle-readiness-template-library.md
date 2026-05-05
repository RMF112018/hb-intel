# PCC Lifecycle Readiness Template Library

## 1. Objective
- Planned PCC schema/reference file for `PCC Lifecycle Readiness Template Library`.
- Category: `Lifecycle Readiness`.
- Storage posture: `Global / HBCentral registry`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Lifecycle Readiness / Global / HBCentral registry`
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
| Template Item ID | TemplateItemId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Family | Family | Choice | Yes | No | No | No |  |
| Normalized Title | NormalizedTitle | Text | Yes | No | No | No | MaxLength=255 |
| Lifecycle Phase | LifecyclePhase | Text | Yes | No | No | No | MaxLength=255 |
| Readiness Domain | ReadinessDomain | Text | Yes | No | No | No | MaxLength=255 |
| Item Type | ItemType | Choice | Yes | No | No | No |  |
| Criticality | Criticality | Text | Yes | No | No | No | MaxLength=255 |
| Risk Tags JSON | RiskTagsJson | Note | No | No | No | No | RichText=false; Lines=6 |
| Default Owner Persona | DefaultOwnerPersona | Text | Yes | No | No | No | MaxLength=255 |
| Default Reviewer Persona | DefaultReviewerPersona | Text | No | No | No | No | MaxLength=255 |
| Ownership Classification | OwnershipClassification | Text | Yes | No | No | No | MaxLength=255 |
| Evidence Policy | EvidencePolicy | Text | No | No | No | No | MaxLength=255 |
| External References JSON | ExternalReferencesJson | Note | No | No | No | No | RichText=false; Lines=6 |
| Default Gate Impact JSON | DefaultGateImpactJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Active By Default | ActiveByDefault | Text | Yes | No | No | No | MaxLength=255 |
| Classification Notes | ClassificationNotes | Note | No | No | No | No | RichText=false; Lines=6 |
| Source Trace JSON | SourceTraceJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Source Lineage JSON | SourceLineageJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Template Version | TemplateVersion | Text | Yes | No | No | No | MaxLength=255 |
| Is Active | IsActive | Boolean | Yes | No | No | Yes | Indexed for query/view performance |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `project readiness workflow record`

## 5. Relationship Observations
- Source lineage fields preserve external/source-system traceability without making PCC the external system of record.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `21`
- Hidden fields: `0`
- Non-hidden lookup fields: `0`
- Unique-enforced fields: ``
- Indexed non-hidden fields: `2`
- System/OOB fields are not included in this planned schema file; live tenant extraction should append OOB fields only where integration-relevant.
- Attachments should remain disabled unless a later approved exception is recorded; evidence should be handled by Document Control references.
- Default operational views should filter first on indexed fields such as `ProjectId`, active/status/state fields, module/system keys, or due-date fields.

## 7. Open Questions / Follow-Up Checks
- Confirm final list URL, list GUID, entity type name, and form URLs after provisioning.
- Confirm whether this list should use a shared PCC content type or a list-local item content type.
- Confirm field IDs and site-column reuse before generating Graph/PnP provisioning assets.
- Confirm production index strategy against actual query patterns and expected item volume.
- Confirm whether any tenant-specific retention, sensitivity, or compliance labels apply.
