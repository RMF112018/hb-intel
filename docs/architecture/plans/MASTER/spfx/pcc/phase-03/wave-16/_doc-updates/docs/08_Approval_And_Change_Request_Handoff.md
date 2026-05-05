# 08 — Approval and Change-Request Handoff

Wave 16 does not own approval execution. Approval-required settings route through Wave 14.

## Handoff payload
- `changeRequestId`
- `projectId`
- `settingKey`
- `settingDefinitionId`
- `requestType`
- `currentValueSnapshot`
- `proposedValueSnapshot`
- `redactionClass`
- `requesterUpn`
- `requesterRole`
- `justification`
- `approvalAuthorityRole`
- `requiresAdminVerification`
- `riskCategory`
- `effectiveDate`
- `rollbackSnapshot`

## Request lifecycle
`draft`, `submitted`, `routed`, `pending-approval`, `approved`, `rejected`, `admin-verification-required`, `execution-pending`, `completed`, `cancelled`, `superseded`.

## Self-approval default
Requester cannot approve their own security, provisioning, external URL, feature/module enablement, global default, secret-reference, or HBI policy request.
