# PCC Feature Flags

## 1. Objective
- Planned PCC schema/reference file for `PCC Feature Flags`.
- Category: `Workflow / Business Audit / Configuration`.
- Storage posture: `Global / HBCentral`.
- Classification posture: `model-derived-required`.

## 2. List-Level Metadata
- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `model-derived-required`
- Description: `Workflow / Business Audit / Configuration / Global / HBCentral`
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
| Feature Flag ID | FeatureFlagId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Display Name | DisplayName | Text | Yes | No | No | No | MaxLength=255 |
| Description | Description | Note | No | No | No | No | RichText=false; Lines=6 |
| Posture | Posture | Choice | Yes | No | No | No |  |
| Default Enabled | DefaultEnabled | Text | Yes | No | No | No | MaxLength=255 |
| Surface ID | SurfaceId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Module ID | ModuleId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Is Enabled | IsEnabled | Boolean | Yes | No | No | No |  |
| Environment Key | EnvironmentKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Scope Key | ScopeKey | Choice | Yes | No | No | Yes | Indexed for query/view performance |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `configuration / enablement registry`

## 5. Relationship Observations
- 

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `11`
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
