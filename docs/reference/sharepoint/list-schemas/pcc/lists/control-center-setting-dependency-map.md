# PCC Control Center Setting Dependency Map

## 1. Objective

- Tracks setting dependency edges used for impact analysis and validation ordering.
- Storage posture: project-site dependency graph cache.
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

| Display Name        | Internal Name         | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                 |
| ------------------- | --------------------- | ------- | -------- | ------ | --------- | ------- | -------------------------------------------------- |
| Dependency ID       | `DependencyId`        | Text    | Yes      | No     | No        | Yes     | Stable dependency edge key.                        |
| SettingKey          | `SettingKey`          | Text    | Yes      | No     | No        | Yes     | Source setting key.                                |
| DependsOnSettingKey | `DependsOnSettingKey` | Text    | Yes      | No     | No        | Yes     | Upstream setting key.                              |
| AffectedSurface ID  | `AffectedSurfaceId`   | Text    | No       | No     | No        | Yes     | Optional surface-level impact key.                 |
| AffectedModule ID   | `AffectedModuleId`    | Text    | No       | No     | No        | Yes     | Optional module-level impact key.                  |
| DependencyType      | `DependencyType`      | Choice  | Yes      | No     | No        | Yes     | Choices: `Hard`, `Soft`, `Ordering`, `Visibility`. |
| ImpactDescription   | `ImpactDescription`   | Note    | Yes      | No     | No        | No      | RichText=false.                                    |
| FailureBehavior     | `FailureBehavior`     | Choice  | Yes      | No     | No        | Yes     | Choices: `Block`, `Warn`, `Fallback`, `Ignore`.    |
| IsActive            | `IsActive`            | Boolean | Yes      | No     | No        | Yes     |                                                    |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- Dependency edges connect definition keys and inform validation rules/health calculations.
- `AffectedSurfaceId` and `AffectedModuleId` tie dependencies to UX/module exposure.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique active edge per `SettingKey + DependsOnSettingKey + DependencyType + AffectedSurfaceId + AffectedModuleId`.
- Query-critical indexes: `DependencyId`, `SettingKey`, `DependsOnSettingKey`, `AffectedSurfaceId`, `AffectedModuleId`, `DependencyType`, `FailureBehavior`, `IsActive`.
- Dependency graph evaluation is runtime logic; list stores canonical edge declarations.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
