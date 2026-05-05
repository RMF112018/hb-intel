# PCC Control Center Setting Health Snapshots

## 1. Objective

- Stores point-in-time health summaries derived from validation and audit streams.
- Storage posture: project-site health/status snapshot list.
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

| Display Name         | Internal Name          | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                                                   |
| -------------------- | ---------------------- | -------- | -------- | ------ | --------- | ------- | ------------------------------------------------------------------------------------ |
| HealthSnapshot ID    | `HealthSnapshotId`     | Text     | Yes      | No     | No        | Yes     | Stable snapshot key.                                                                 |
| Project ID           | `ProjectId`            | Text     | Yes      | No     | No        | Yes     |                                                                                      |
| SnapshotType         | `SnapshotType`         | Choice   | Yes      | No     | No        | Yes     | Choices: `ValidationSummary`, `PolicyCompliance`, `DependencyHealth`, `Operational`. |
| HealthState          | `HealthState`          | Choice   | Yes      | No     | No        | Yes     | Choices: `Healthy`, `Warning`, `Degraded`, `Blocked`.                                |
| FindingCount         | `FindingCount`         | Number   | Yes      | No     | No        | No      | Integer >= 0.                                                                        |
| CriticalFindingCount | `CriticalFindingCount` | Number   | Yes      | No     | No        | No      | Integer >= 0.                                                                        |
| StaleFindingCount    | `StaleFindingCount`    | Number   | Yes      | No     | No        | No      | Integer >= 0.                                                                        |
| ObservedAt UTC       | `ObservedAtUtc`        | DateTime | Yes      | No     | No        | Yes     |                                                                                      |
| SiteHealthFinding ID | `SiteHealthFindingId`  | Text     | No       | No     | No        | Yes     | Optional linkage to site-health finding record.                                      |
| Summary              | `Summary`              | Note     | No       | No     | No        | No      | RichText=false.                                                                      |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- Snapshot aggregates validation results and dependency/audit signals for a project and time.
- `SiteHealthFindingId` links into broader site health remediation streams when present.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique snapshot key `HealthSnapshotId`; optionally enforce one per `ProjectId + SnapshotType + ObservedAtUtc`.
- Query-critical indexes: `HealthSnapshotId`, `ProjectId`, `SnapshotType`, `HealthState`, `ObservedAtUtc`, `SiteHealthFindingId`.
- Snapshot rows are derived evidence and should be treated as append-oriented history.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
