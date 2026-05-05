# PCC Control Center Setting Overrides

## 1. Objective

- Stores approved project/module override records that can supersede defaults.
- Storage posture: project-site approved override list.
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

| Display Name         | Internal Name         | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                    |
| -------------------- | --------------------- | -------- | -------- | ------ | --------- | ------- | ------------------------------------------------------------------------------------- |
| Override ID          | `OverrideId`          | Text     | Yes      | No     | No        | Yes     | Stable override key.                                                                  |
| Project ID           | `ProjectId`           | Text     | Yes      | No     | No        | Yes     |                                                                                       |
| SettingDefinition ID | `SettingDefinitionId` | Text     | Yes      | No     | No        | Yes     |                                                                                       |
| SettingKey           | `SettingKey`          | Text     | Yes      | No     | No        | Yes     |                                                                                       |
| OverrideScope        | `OverrideScope`       | Choice   | Yes      | No     | No        | Yes     | Choices: `Project`, `Module`, `Persona`.                                              |
| OverrideValue        | `OverrideValue`       | Text     | No       | No     | No        | No      | Optional scalar override.                                                             |
| OverrideValueJson    | `OverrideValueJson`   | Note     | No       | No     | No        | No      | RichText=false; optional structured override.                                         |
| ApprovalRequest ID   | `ApprovalRequestId`   | Text     | Yes      | No     | No        | Yes     | Required linkage to approvals workflow.                                               |
| OverrideState        | `OverrideState`       | Choice   | Yes      | No     | No        | Yes     | Choices: `Draft`, `PendingApproval`, `Approved`, `Rejected`, `Superseded`, `Revoked`. |
| ApprovedByUpn        | `ApprovedByUpn`       | Text     | No       | No     | No        | No      | Populated when approved.                                                              |
| ApprovedAt UTC       | `ApprovedAtUtc`       | DateTime | No       | No     | No        | Yes     | Populated when approved.                                                              |
| EffectiveFrom UTC    | `EffectiveFromUtc`    | DateTime | No       | No     | No        | Yes     |                                                                                       |
| EffectiveThrough UTC | `EffectiveThroughUtc` | DateTime | No       | No     | No        | Yes     |                                                                                       |
| IsActive             | `IsActive`            | Boolean  | Yes      | No     | No        | Yes     |                                                                                       |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- `SettingDefinitionId` and `SettingKey` link to definition contract and effective values.
- `ApprovalRequestId` links to approval routing/state for policy governance.

## 6. Implementation-Relevant Findings

- Logical uniqueness: one active approved override per `ProjectId + SettingKey + OverrideScope + Scope target` at a time.
- Query-critical indexes: `ProjectId`, `SettingDefinitionId`, `SettingKey`, `OverrideScope`, `ApprovalRequestId`, `OverrideState`, `ApprovedAtUtc`, `EffectiveFromUtc`, `EffectiveThroughUtc`, `IsActive`.
- Only approved/active overrides should influence resolved values.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
