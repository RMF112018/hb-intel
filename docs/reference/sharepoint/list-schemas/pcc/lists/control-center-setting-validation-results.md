# PCC Control Center Setting Validation Results

## 1. Objective

- Captures rule evaluation output for effective values, overrides, and policy checks.
- Storage posture: project-site validation evidence list.
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

| Display Name        | Internal Name        | Type     | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                 |
| ------------------- | -------------------- | -------- | -------- | ------ | --------- | ------- | -------------------------------------------------- |
| ValidationResult ID | `ValidationResultId` | Text     | Yes      | No     | No        | Yes     | Stable result key.                                 |
| Project ID          | `ProjectId`          | Text     | Yes      | No     | No        | Yes     |                                                    |
| SettingKey          | `SettingKey`         | Text     | Yes      | No     | No        | Yes     |                                                    |
| ValidationRule ID   | `ValidationRuleId`   | Text     | Yes      | No     | No        | Yes     | Links to policy rules list.                        |
| ValidationStatus    | `ValidationStatus`   | Choice   | Yes      | No     | No        | Yes     | Choices: `Valid`, `Warning`, `Blocked`, `Expired`. |
| Severity            | `Severity`           | Choice   | Yes      | No     | No        | Yes     | Choices: `Info`, `Warning`, `Error`, `Critical`.   |
| Message             | `Message`            | Note     | Yes      | No     | No        | No      | RichText=false.                                    |
| RemediationPath     | `RemediationPath`    | Note     | No       | No     | No        | No      | RichText=false; operator guidance.                 |
| ObservedAt UTC      | `ObservedAtUtc`      | DateTime | Yes      | No     | No        | Yes     |                                                    |
| Correlation ID      | `CorrelationId`      | Text     | No       | No     | No        | Yes     | Correlates to runs/events.                         |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- Results link to rules through `ValidationRuleId` and to setting rows through `ProjectId + SettingKey`.
- Validation findings feed health snapshots and audit surfacing.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique `ValidationResultId`; many results may exist per setting over time.
- Query-critical indexes: `ValidationResultId`, `ProjectId`, `SettingKey`, `ValidationRuleId`, `ValidationStatus`, `Severity`, `ObservedAtUtc`, `CorrelationId`.
- Retain immutable result evidence for compliance lineage.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
