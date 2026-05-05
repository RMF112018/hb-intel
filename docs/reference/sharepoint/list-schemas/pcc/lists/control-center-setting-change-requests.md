# PCC Control Center Setting Change Requests

## 1. Objective

- Records requested changes and workflow context before overrides/values are updated.
- Storage posture: project-site settings workflow list.
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

| Display Name          | Internal Name           | Type   | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                           |
| --------------------- | ----------------------- | ------ | -------- | ------ | --------- | ------- | -------------------------------------------------------------------------------------------- |
| ChangeRequest ID      | `ChangeRequestId`       | Text   | Yes      | No     | No        | Yes     | Stable request key.                                                                          |
| Project ID            | `ProjectId`             | Text   | Yes      | No     | No        | Yes     |                                                                                              |
| SettingDefinition ID  | `SettingDefinitionId`   | Text   | Yes      | No     | No        | Yes     |                                                                                              |
| SettingKey            | `SettingKey`            | Text   | Yes      | No     | No        | Yes     |                                                                                              |
| RequestType           | `RequestType`           | Choice | Yes      | No     | No        | Yes     | Choices: `CreateOverride`, `UpdateOverride`, `RemoveOverride`, `Revalidate`.                 |
| RequestState          | `RequestState`          | Choice | Yes      | No     | No        | Yes     | Choices: `Draft`, `Submitted`, `InReview`, `Approved`, `Rejected`, `Cancelled`, `Completed`. |
| RequesterUpn          | `RequesterUpn`          | Text   | Yes      | No     | No        | Yes     |                                                                                              |
| RequesterRole         | `RequesterRole`         | Choice | Yes      | No     | No        | No      | Choices: `ProjectManager`, `ProjectEngineer`, `Operations`, `Administrator`, `System`.       |
| CurrentValueSnapshot  | `CurrentValueSnapshot`  | Note   | No       | No     | No        | No      | RichText=false; serialized snapshot at request time.                                         |
| ProposedValueSnapshot | `ProposedValueSnapshot` | Note   | Yes      | No     | No        | No      | RichText=false; proposed payload.                                                            |
| Justification         | `Justification`         | Note   | Yes      | No     | No        | No      | RichText=false.                                                                              |
| ApprovalRequest ID    | `ApprovalRequestId`     | Text   | No       | No     | No        | Yes     | Set when routed to approvals.                                                                |
| PriorityAction ID     | `PriorityActionId`      | Text   | No       | No     | No        | Yes     | Optional linkage to priority actions.                                                        |
| AdminVerification ID  | `AdminVerificationId`   | Text   | No       | No     | No        | Yes     | Optional linkage to admin verification.                                                      |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- Change requests connect definitions/keys to approvals, priority actions, and verification tracks.
- Approved requests become source inputs for override and effective-value updates.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique `ChangeRequestId`; workflows use `RequestState` transitions.
- Query-critical indexes: `ChangeRequestId`, `ProjectId`, `SettingDefinitionId`, `SettingKey`, `RequestType`, `RequestState`, `RequesterUpn`, `ApprovalRequestId`, `PriorityActionId`, `AdminVerificationId`.
- Value snapshots are immutable evidence rows once submitted.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
