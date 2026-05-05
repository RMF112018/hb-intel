# 04 — Settings Domain Model

## Objects
- `SettingDefinition`: global catalog entry.
- `SettingPolicyRule`: validation/approval/redaction/inheritance/conflict rule.
- `SettingValue`: effective setting value for a scope.
- `SettingOverride`: approved/pending project/module/user override.
- `SettingChangeRequest`: governed request before approval/execution.
- `SettingValidationResult`: validation output and remediation path.
- `SettingAuditEvent`: business audit event.
- `SettingDependency`: relationship to affected settings/modules/surfaces.
- `SettingHealthSnapshot`: rollup for health/drift status.

## Vocabularies
Value types: `string`, `number`, `boolean`, `json`, `url`, `guid`, `choice`, `multichoice`, `person`, `group`, `secret-reference`, `derived`.

Editable policy: `read-only`, `direct-draft`, `request-only`, `approval-required`, `admin-only`, `future-gated`.

Redaction: `public`, `internal`, `restricted`, `secret-reference`, `secret-never-display`.

Effective source: `global-default`, `project-override`, `module-override`, `role-filter`, `user-preference`, `source-system`, `derived`, `unavailable`.
