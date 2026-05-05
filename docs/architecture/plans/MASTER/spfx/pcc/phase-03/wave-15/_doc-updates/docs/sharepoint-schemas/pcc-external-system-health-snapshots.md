# PCC External System Health Snapshots

## Scope

Project Site

## URL

`/sites/{ProjectSite}/Lists/PCC External System Health Snapshots`

## Settings

- Attachments: `False`
- Versioning: `False`
- Folders: `False`
- Logical key: `ProjectId + SystemKey + HealthSnapshotId`

## Field Schema

| Display Name | Internal Name | Type | Required | Indexed | Notes |
|---|---|---:|---:|---:|---|
| Health Snapshot ID | `HealthSnapshotId` | Text | True | True |  |
| Project ID | `ProjectId` | Text | True | True |  |
| System Key | `SystemKey` | Text | True | True |  |
| Source Status | `SourceStatus` | Choice | True | True |  |
| Health Tone | `HealthTone` | Choice | True | True |  |
| Evaluated At UTC | `EvaluatedAtUtc` | DateTime | True | True |  |
| Warning Count | `WarningCount` | Number | True | True |  |
| Critical Count | `CriticalCount` | Number | True | True |  |
| Warnings JSON | `WarningsJson` | Note | False | False |  |
| Title | `Title` | Text | True | False | Human-readable row title. |
| Is Active | `IsActive` | Boolean | True | True | Active row gate. |
| Created | `Created` | DateTime | False | False | OOB audit. |
| Modified | `Modified` | DateTime | False | False | OOB audit. |
| Created By | `Author` | User | False | False | OOB audit. |
| Modified By | `Editor` | User | False | False | OOB audit. |


## Implementation Notes

- Provisioning must be idempotent.
- Direct user edits should be mediated by the External Systems Launch Pad UI where possible.
- Internal names are binding contract; display names are UI copy only.
- No secrets may be stored in this list.
