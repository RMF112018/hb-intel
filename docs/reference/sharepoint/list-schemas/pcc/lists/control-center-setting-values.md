# PCC Control Center Setting Values

## 1. Objective

- Stores resolved/effective project-site values after precedence and policy evaluation.
- Storage posture: project-site effective values list.
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

| Display Name         | Internal Name         | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                     |
| -------------------- | --------------------- | ------- | -------- | ------ | --------- | ------- | ---------------------------------------------------------------------- |
| SettingValue ID      | `SettingValueId`      | Text    | Yes      | No     | No        | Yes     | Stable value-row key.                                                  |
| Project ID           | `ProjectId`           | Text    | Yes      | No     | No        | Yes     | Project-site partition key.                                            |
| SettingDefinition ID | `SettingDefinitionId` | Text    | Yes      | No     | No        | Yes     | Joins to definitions.                                                  |
| SettingKey           | `SettingKey`          | Text    | Yes      | No     | No        | Yes     |                                                                        |
| EnvironmentKey       | `EnvironmentKey`      | Choice  | Yes      | No     | No        | Yes     | Choices: `Production`, `Staging`, `Development`, `Local`.              |
| Scope                | `Scope`               | Choice  | Yes      | No     | No        | Yes     | Choices: `Tenant`, `Project`, `Module`, `Persona`.                     |
| ScopeKey             | `ScopeKey`            | Text    | Yes      | No     | No        | Yes     | Concrete scope discriminator.                                          |
| EffectiveSource      | `EffectiveSource`     | Choice  | Yes      | No     | No        | Yes     | Choices: `GlobalDefault`, `PolicyRule`, `ApprovedOverride`, `Derived`. |
| ResolvedValue        | `ResolvedValue`       | Text    | No       | No     | No        | No      | Optional scalar value; blank when JSON payload is used.                |
| ResolvedValueJson    | `ResolvedValueJson`   | Note    | No       | No     | No        | No      | RichText=false; optional structured value.                             |
| IsSecretReference    | `IsSecretReference`   | Boolean | Yes      | No     | No        | Yes     |                                                                        |
| SecretReferenceName  | `SecretReferenceName` | Text    | No       | No     | No        | No      | Required only when `IsSecretReference=true`.                           |
| ValidationStatus     | `ValidationStatus`    | Choice  | Yes      | No     | No        | Yes     | Choices: `NotValidated`, `Valid`, `Warning`, `Blocked`, `Expired`.     |
| IsActive             | `IsActive`            | Boolean | Yes      | No     | No        | Yes     |                                                                        |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- `SettingDefinitionId` and `SettingKey` bind each row to global definition contract.
- Values are consumed by read-model composition and linked to overrides/change requests by keys.

## 6. Implementation-Relevant Findings

- Logical uniqueness: one active row per `ProjectId + SettingKey + EnvironmentKey + Scope + ScopeKey`.
- Query-critical indexes: `ProjectId`, `SettingDefinitionId`, `SettingKey`, `EnvironmentKey`, `Scope`, `ScopeKey`, `EffectiveSource`, `ValidationStatus`, `IsActive`.
- Secret values are never stored directly; only secret references are allowed.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
