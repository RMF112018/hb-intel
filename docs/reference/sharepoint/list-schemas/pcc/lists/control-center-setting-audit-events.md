# PCC Control Center Setting Audit Events

## 1. Objective

- Captures append-only audit records for settings reads, changes, and policy decisions.
- Storage posture: project-site audit/event list.
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

| Display Name       | Internal Name       | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                            |
| ------------------ | ------------------- | -------- | -------- | ------ | --------- | ------- | --------------------------------------------------------------------------------------------- |
| AuditEvent ID      | `AuditEventId`      | Text     | Yes      | No     | No        | Yes     | Stable event key.                                                                             |
| Project ID         | `ProjectId`         | Text     | Yes      | No     | No        | Yes     |                                                                                               |
| EventType          | `EventType`         | Choice   | Yes      | No     | No        | Yes     | Choices: `Read`, `Create`, `Update`, `Delete`, `Validate`, `Approve`, `Reject`, `SystemSync`. |
| SettingKey         | `SettingKey`        | Text     | Yes      | No     | No        | Yes     |                                                                                               |
| ActorUpn           | `ActorUpn`          | Text     | No       | No     | No        | Yes     | Empty when system-generated.                                                                  |
| ActorRole          | `ActorRole`         | Choice   | No       | No     | No        | Yes     | Choices: `User`, `Admin`, `System`, `ServicePrincipal`.                                       |
| BeforeSnapshot     | `BeforeSnapshot`    | Note     | No       | No     | No        | No      | RichText=false; prior state payload.                                                          |
| AfterSnapshot      | `AfterSnapshot`     | Note     | No       | No     | No        | No      | RichText=false; resulting state payload.                                                      |
| Redacted           | `Redacted`          | Boolean  | Yes      | No     | No        | Yes     | Indicates payload redaction.                                                                  |
| ApprovalRequest ID | `ApprovalRequestId` | Text     | No       | No     | No        | Yes     |                                                                                               |
| Correlation ID     | `CorrelationId`     | Text     | No       | No     | No        | Yes     | Correlates related actions/events.                                                            |
| EventAt UTC        | `EventAtUtc`        | DateTime | Yes      | No     | No        | Yes     |                                                                                               |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- Events join to change requests/approvals and values by `SettingKey`, `ProjectId`, and `CorrelationId`.
- Event lineage supports security/HBI redaction traceability.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique `AuditEventId`; append-only write behavior expected.
- Query-critical indexes: `AuditEventId`, `ProjectId`, `EventType`, `SettingKey`, `ActorUpn`, `ActorRole`, `Redacted`, `ApprovalRequestId`, `CorrelationId`, `EventAtUtc`.
- Snapshot payloads must remain non-secret and redaction-safe.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
