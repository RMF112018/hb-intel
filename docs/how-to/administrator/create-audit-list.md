# Create Provisioning Audit List

## Purpose

This one-time procedure creates the SharePoint `ProvisioningAuditLog` list required by Phase 6 dual-store persistence (D-PH6-06).

## Prerequisites

- Managed Identity or service principal has list-creation permission on `SHAREPOINT_TENANT_URL`.
- Environment variable `SHAREPOINT_TENANT_URL` is set.
- Dependencies installed in `backend/functions`.

## Run Script

From repository root:

```bash
pnpm exec tsx scripts/create-audit-list.ts
```

## What It Creates

- List: `ProvisioningAuditLog`
- Required columns:
  - `ProjectId`
  - `ProjectNumber`
  - `ProjectName`
  - `CorrelationId`
  - `Event` (`Started`, `Completed`, `Failed`)
  - `TriggeredBy`
  - `SubmittedBy`
  - `Timestamp`
- Optional columns:
  - `SiteUrl`
  - `ErrorSummary`

## Verification

1. Open SharePoint list settings and confirm all columns exist.
2. Trigger a provisioning run and confirm three lifecycle events are written (`Started`, `Completed` or `Failed`).
3. Confirm provisioning does not fail if an audit write fails (fire-and-forget `.catch` behavior).
