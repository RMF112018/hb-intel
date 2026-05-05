# PCC Control Center Setting Policy Rules

## 1. Objective

- Defines canonical Wave 16 policy/validation rules used by setting definitions and runtime validation.
- Storage posture: global policy list in HBCentral.
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

| Display Name        | Internal Name         | Type    | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes                              |
| ------------------- | --------------------- | ------- | -------- | ------ | --------- | ------- | --------------------------------------------------------------- |
| PolicyRule ID       | `PolicyRuleId`        | Text    | Yes      | No     | No        | Yes     | Stable rule key.                                                |
| RuleType            | `RuleType`            | Choice  | Yes      | No     | No        | Yes     | Choices: `Validation`, `Guardrail`, `Dependency`, `Visibility`. |
| AppliesToCategory   | `AppliesToCategory`   | Choice  | Yes      | No     | No        | Yes     | Same category vocabulary as definitions.                        |
| AppliesToSettingKey | `AppliesToSettingKey` | Text    | No       | No     | No        | Yes     | Optional for category-wide rules.                               |
| RuleExpressionJson  | `RuleExpressionJson`  | Note    | Yes      | No     | No        | No      | RichText=false; machine-evaluable expression payload.           |
| FailureCode         | `FailureCode`         | Text    | Yes      | No     | No        | Yes     | Stable code surfaced in validation results.                     |
| FailureMessage      | `FailureMessage`      | Note    | Yes      | No     | No        | No      | RichText=false.                                                 |
| Severity            | `Severity`            | Choice  | Yes      | No     | No        | Yes     | Choices: `Info`, `Warning`, `Error`, `Critical`.                |
| CanBeOverridden     | `CanBeOverridden`     | Boolean | Yes      | No     | No        | No      |                                                                 |
| IsActive            | `IsActive`            | Boolean | Yes      | No     | No        | Yes     |                                                                 |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings type is approved.
- SPFx/settings services are the primary authoring surface.

## 5. Relationship Observations

- `PolicyRuleId` links to definitions via `ValidationRuleId` and to validation results via `ValidationRuleId`.
- `FailureCode` and `Severity` drive downstream validation and health summaries.

## 6. Implementation-Relevant Findings

- Logical uniqueness: unique active `PolicyRuleId`.
- Query-critical indexes: `PolicyRuleId`, `RuleType`, `AppliesToCategory`, `AppliesToSettingKey`, `FailureCode`, `Severity`, `IsActive`.
- Expressions are contract payloads; parser/runtime behavior is implemented outside SharePoint.

## 7. Open Questions / Follow-Up Checks

- Confirm final List ID, Entity Type Name, list URLs, and field IDs after provisioning.
- Confirm tenant retention/sensitivity labels and final index enforcement behavior.
