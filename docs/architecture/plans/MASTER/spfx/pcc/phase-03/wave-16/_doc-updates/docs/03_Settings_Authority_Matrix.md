# 03 — Settings Authority Matrix

| Setting family | Owner | Storage | Editable by | Approval |
|---|---|---|---|---|
| Project display metadata | PCC/project profile | Project site | PM/PX/PCC Admin | Conditional |
| Accounting project number | Sage/accounting | Source + reference | Not editable | Required |
| Module visibility | PCC policy | HBCentral + project override | IT/PCC Admin; PM/PX request | Usually |
| Feature flags | PCC policy | HBCentral | IT/PCC Admin | Conditional |
| External launch links | Wave 15 External Systems | HBCentral + project site | IT/Admin; PM/PX request | Required for custom |
| URL policy | Wave 15/HBCentral | HBCentral | IT/PCC Admin | Required |
| Technical/provisioning | IT/Admin | Backend/HBCentral ref | IT/PCC Admin only | Required |
| Permission/security | IT/Admin/Team & Access | Source + PCC request | Request only | Required |
| Secret reference | IT/backend | Key Vault/app settings + reference | metadata only | Required |
| Site Health setting | Site Health/IT | Site Health + reference | IT/PCC Admin | Conditional |
| HBI behavior policy | PCC/HBI governance | HBCentral policy | IT/PCC Admin | Required |
| User preference | PCC user preference | User/project scoped | User | No unless policy-blocked |

## Required read-model metadata
Each setting must expose: `settingKey`, effective redacted value, `redactionClass`, `effectiveSource`, `sourceOwner`, `editablePolicy`, `canEdit`, `canRequestChange`, `requiresApproval`, `requiresAdminVerification`, `disabledReason`, and `validationStatus`.
