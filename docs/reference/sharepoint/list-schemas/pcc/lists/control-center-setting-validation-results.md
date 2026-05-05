# PCC Control Center Setting Validation Results

## 1. Objective

- Defines the proposed Wave 16 schema for `PCC Control Center Setting Validation Results`.
- Runtime posture is read-model first and future command-gated.
- Attachments should remain disabled.

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

| Display Name        | Internal Name        | Type                                             | Required | Hidden | Read Only | Indexed | Lookup / Choices / Formula / Notes |
| ------------------- | -------------------- | ------------------------------------------------ | -------- | ------ | --------- | ------- | ---------------------------------- |
| ValidationResult ID | `ValidationResultId` | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| Project ID          | `ProjectId`          | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | Yes     | See Wave 16 schema decision.       |
| SettingKey          | `SettingKey`         | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | Yes     | See Wave 16 schema decision.       |
| ValidationRule ID   | `ValidationRuleId`   | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| ValidationStatus    | `ValidationStatus`   | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | Yes     | See Wave 16 schema decision.       |
| Severity            | `Severity`           | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| Message             | `Message`            | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| RemediationPath     | `RemediationPath`    | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| ObservedAt UTC      | `ObservedAtUtc`      | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |
| Correlation ID      | `CorrelationId`      | Text/Choice/DateTime/Boolean/Note as appropriate | TBD      | No     | No        | No      | See Wave 16 schema decision.       |

## 4. Content Types / Forms / Behavioral Context

- Standard list item content type unless a shared PCC settings content type is approved.
- PCC SPFx is the preferred UX, not raw SharePoint list editing.

## 5. Relationship Observations

- Use text/internal keys for portability unless local site-column/lookup authority exists.
- Join by stable keys, not display labels.

## 6. Implementation-Relevant Findings

- Use indexed query dimensions first.
- Do not store raw secrets.
- Disable attachments.
- Use backend-normalized read models.

## 7. Open Questions / Follow-Up Checks

- Confirm GUIDs, entity type names, field IDs, and final URLs after provisioning.
