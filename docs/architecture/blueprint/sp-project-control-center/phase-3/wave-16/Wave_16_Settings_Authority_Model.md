# Wave 16 Settings Authority Model

## Authority Matrix Summary

| Setting family            | Owner                   | Storage                               | Editable by                 | Approval            |
| ------------------------- | ----------------------- | ------------------------------------- | --------------------------- | ------------------- |
| Project display metadata  | PCC/project profile     | Project site                          | PM/PX/PCC Admin             | Conditional         |
| Accounting project number | Sage/accounting         | Source + reference                    | Not editable                | Required            |
| Module visibility         | PCC policy              | HBCentral defaults + project override | IT/PCC Admin; PM/PX request | Usually             |
| Feature flags             | PCC policy              | HBCentral defaults                    | IT/PCC Admin                | Conditional         |
| External launch links     | External Systems module | HBCentral + project site              | IT/Admin; PM/PX request     | Required for custom |
| URL policy                | HBCentral policy        | HBCentral                             | IT/PCC Admin                | Required            |
| Technical/provisioning    | IT/Admin                | Backend/HBCentral reference           | IT/PCC Admin only           | Required            |
| Permission/security       | Team & Access / IT      | Source + PCC request                  | Request only                | Required            |
| Secret reference          | IT/backend              | Secret store + reference metadata     | Metadata only               | Required            |
| Site health settings      | Site Health / IT        | Site Health + reference               | IT/PCC Admin                | Conditional         |
| HBI behavior policy       | PCC/HBI governance      | HBCentral policy                      | IT/PCC Admin                | Required            |
| User preference           | PCC user preference     | User/project scoped                   | User                        | Policy-gated        |

## Required Read-Model Metadata Contract

Each setting record exposed by read models must include:

- `settingKey`
- redacted effective value
- `redactionClass`
- `effectiveSource`
- `sourceOwner`
- `editablePolicy`
- `canEdit`
- `canRequestChange`
- `requiresApproval`
- `requiresAdminVerification`
- `disabledReason`
- `validationStatus`

## Enforcement Posture

- Authority is field-level and policy-first, not UI-first.
- Higher-authority policy always overrides lower-scope mutation intent.
- Changes that cross security/governance boundaries route through requests and approvals.
