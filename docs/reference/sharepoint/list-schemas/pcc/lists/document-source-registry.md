# PCC Document Source Registry

## 1. Objective
- Planned PCC schema/reference file for `PCC Document Source Registry`.
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
| Source Key | SourceKey | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Project ID | ProjectId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Display Name | DisplayName | Text | Yes | No | No | No | MaxLength=255 |
| Wave7 Lane | Wave7Lane | Choice | Yes | No | No | No |  |
| Source Kind | SourceKind | Choice | Yes | No | No | No |  |
| Enabled | Enabled | Boolean | Yes | No | No | No |  |
| Binding Kind | BindingKind | Choice | Yes | No | No | No |  |
| Site ID | SiteId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Web ID | WebId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| List ID | ListId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Drive ID | DriveId | Text | Yes | No | No | Yes | Indexed for query/view performance |
| Root Path | RootPath | Text | Yes | No | No | No | MaxLength=255 |
| System Key | SystemKey | Choice | Yes | No | No | Yes | Indexed for query/view performance |
| Tenant Or Org Ref | TenantOrOrgRef | Text | Yes | No | No | No | MaxLength=255 |
| Project Ref | ProjectRef | Text | Yes | No | No | No | MaxLength=255 |
| Launch Url Template | LaunchUrlTemplate | URL | No | No | No | No | Launch/reference value; no secrets or bearer tokens |
| Notes | Notes | Note | No | No | No | No | RichText=false; Lines=6 |
| Binding JSON | BindingJson | Note | Yes | No | No | No | RichText=false; Lines=6 |

## 4. Content Types / Forms / Behavioral Context
- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `document control reference / action register`

## 5. Relationship Observations
- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.

## 6. Implementation-Relevant Findings
- Non-hidden editable fields: `19`
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
