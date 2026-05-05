# PCC Responsibility Template Library

## 1. Objective
- Planned PCC schema/reference file for `PCC Responsibility Template Library`.
- Category: `Responsibility Matrix`.
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
- Description: `Responsibility Matrix / Global / HBCentral registry`
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
| Template Version | TemplateVersion | Text | Yes | No | No | No | MaxLength=255 |
| Status | Status | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Effective Date UTC | EffectiveDateUtc | DateTime | Yes | No | No | No |  |
| Retirement Date UTC | RetirementDateUtc | DateTime | Yes | No | No | No |  |
| Classification | Classification | Choice | Yes | No | No | No |  |
| Criticality | Criticality | Text | Yes | No | No | No | MaxLength=255 |
| Domain | Domain | Text | Yes | No | No | No | MaxLength=255 |
| Source Task | SourceTask | Text | Yes | No | No | No | MaxLength=255 |
| Baseline Raci JSON | BaselineRaciJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Baseline Contract Party Mapping JSON | BaselineContractPartyMappingJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Obligation Ref JSON | ObligationRefJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Decision Rights JSON | DecisionRightsJson | Note | Yes | No | No | No | RichText=false; Lines=6 |
| Source Snapshot JSON | SourceSnapshotJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `Responsibility Matrix operational record`

## 5. Relationship Observations
- 

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `15`
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
