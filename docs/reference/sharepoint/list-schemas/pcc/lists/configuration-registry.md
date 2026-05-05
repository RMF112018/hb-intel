# PCC Configuration Registry

## 1. Objective

- Planned PCC schema/reference file for `PCC Configuration Registry`.
- Category: `Workflow / Business Audit / Configuration`.
- Storage posture: `Global / HBCentral defaults only; project overrides are stored in Wave 16 control-center-setting-overrides`.
- Classification posture: `contract-derived-required`.

## 2. List-Level Metadata

- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `contract-derived-required`
- Description: `Workflow / Business Audit / Configuration / Global / HBCentral defaults only; project overrides are stored in Wave 16 control-center-setting-overrides`
- Hidden: `false`
- Item Count: ``
- Content Types Enabled: ``
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `false`

## 3. Field Schema

| Display Name          | Internal Name       | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                              |
| --------------------- | ------------------- | -------- | -------- | ------ | --------- | ------- | --------------------------------------------------------------- |
| Title                 | Title               | Text     | Yes      | No     | No        | No      | MaxLength=255                                                   |
| Project ID            | ProjectId           | Text     | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Configuration ID      | ConfigurationId     | Text     | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Application Key       | ApplicationKey      | Text     | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Environment Key       | EnvironmentKey      | Text     | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Scope Key             | ScopeKey            | Choice   | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Scope                 | Scope               | Choice   | Yes      | No     | No        | No      |                                                                 |
| Config Key            | ConfigKey           | Text     | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Display Name          | DisplayName         | Text     | Yes      | No     | No        | No      | MaxLength=255                                                   |
| Config Value          | ConfigValue         | Text     | No       | No     | No        | No      | Non-secret scalar value; optional when ConfigValueJson is used. |
| Config Value JSON     | ConfigValueJson     | Note     | No       | No     | No        | No      | RichText=false; Lines=6; optional structured value.             |
| Editor Persona        | EditorPersona       | Text     | Yes      | No     | No        | No      | MaxLength=255                                                   |
| Is Active             | IsActive            | Boolean  | Yes      | No     | No        | Yes     | Indexed for query/view performance                              |
| Last Updated At UTC   | LastUpdatedAtUtc    | DateTime | Yes      | No     | No        | No      |                                                                 |
| Last Updated By UPN   | LastUpdatedByUpn    | Text     | No       | No     | No        | No      | MaxLength=255; UPN string.                                      |
| Secret Reference Name | SecretReferenceName | Text     | No       | No     | No        | No      | MaxLength=255; required only when IsSecretReference=true.       |

## 4. Content Types / Forms / Behavioral Context

- Associated Content Types: ``
- Default New Form: ``
- Default Edit Form: ``
- Default Display Form: ``
- Appears Custom Forms (URL heuristic): ``
- Observed Role Hint: `configuration / enablement registry`

## 5. Relationship Observations

- Project-scoped records join to the PCC Project Profile / HBCentral Projects source through `ProjectId`.
- Person/user references are stored as stable text keys for cross-site portability; SharePoint User fields may be added later for UX only.

## 6. Implementation-Relevant Findings

- Non-hidden editable fields: `16`
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
