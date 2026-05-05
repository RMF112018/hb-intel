# PCC Control Center Setting Definitions

## 1. Objective

- Defines canonical Wave 16 setting definitions and governance metadata.
- Storage posture: global policy/default definitions in HBCentral.
- Attachments remain disabled.

## 2. List-Level Metadata

- List ID: ``
- Entity Type Name: ``
- URL: ``
- Default View URL: ``
- Root Folder URL: ``
- Base Template / Base Type: `100` / `0`
- Classification: `contract-derived-required`
- Hidden: `false`
- Content Types Enabled: `false`
- Versioning: `EnableVersioning=true`, `EnableMinorVersions=false`, `MajorVersionLimit=50`
- Moderation: `EnableModeration=false`
- Attachments Enabled: `false`

## 3. Field Schema

| Display Name              | Internal Name               | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                |
| ------------------------- | --------------------------- | ------- | -------- | ------ | --------- | ------- | --------------------------------------------------------------------------------- |
| SettingDefinition ID      | `SettingDefinitionId`       | Text    | Yes      | No     | No        | Yes     | Stable unique key per definition.                                                 |
| SettingKey                | `SettingKey`                | Text    | Yes      | No     | No        | Yes     | Stable semantic key used across definition/value/override lists.                  |
| DisplayName               | `DisplayName`               | Text    | Yes      | No     | No        | No      | MaxLength=255.                                                                    |
| Category                  | `Category`                  | Choice  | Yes      | No     | No        | Yes     | Choices: `Security`, `Integration`, `Workflow`, `ReadModel`, `UX`, `Operations`.  |
| ValueType                 | `ValueType`                 | Choice  | Yes      | No     | No        | No      | Choices: `String`, `Number`, `Boolean`, `Json`, `Url`, `Guid`, `SecretReference`. |
| SourceOwner               | `SourceOwner`               | Choice  | Yes      | No     | No        | Yes     | Choices: `HBCentral`, `ProjectSite`, `Derived`.                                   |
| StorageOwner              | `StorageOwner`              | Choice  | Yes      | No     | No        | Yes     | Choices: `HBCentralPolicy`, `ProjectEffective`, `ProjectWorkflow`.                |
| EditablePolicy            | `EditablePolicy`            | Choice  | Yes      | No     | No        | No      | Choices: `ReadOnly`, `AdminOnly`, `WorkflowApproved`.                             |
| RedactionClass            | `RedactionClass`            | Choice  | Yes      | No     | No        | No      | Choices: `None`, `Internal`, `Sensitive`.                                         |
| RequiresApproval          | `RequiresApproval`          | Boolean | Yes      | No     | No        | No      |                                                                                   |
| RequiresAdminVerification | `RequiresAdminVerification` | Boolean | Yes      | No     | No        | No      |                                                                                   |
| ValidationRule ID         | `ValidationRuleId`          | Text    | No       | No     | No        | Yes     | References policy rules by stable key.                                            |
| DependencyGroup ID        | `DependencyGroupId`         | Text    | No       | No     | No        | Yes     | Groups related setting dependencies.                                              |
| IsActive                  | `IsActive`                  | Boolean | Yes      | No     | No        | Yes     |                                                                                   |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- `SettingDefinitionId` and `SettingKey` join to values, overrides, change requests, and validation results.
- Definitions are global contract records; project-specific behavior is represented in project-site lists.

## 6. Implementation-Relevant Findings

- Logical uniqueness: enforce unique active `SettingDefinitionId` and unique active `SettingKey`.
- Query-critical indexes: `SettingDefinitionId`, `SettingKey`, `Category`, `SourceOwner`, `StorageOwner`, `IsActive`.
- Secrets are never stored here; only metadata and behavior policy are stored.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
