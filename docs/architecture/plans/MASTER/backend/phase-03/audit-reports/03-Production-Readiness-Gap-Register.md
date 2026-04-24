# 03 — Production-Readiness Gap Register

## Severity scale
- **P0** = blocking production readiness now
- **P1** = major risk; must close before rollout
- **P2** = important hardening / supportability gap
- **P3** = cleanup or optimization

## G-01 — No end-to-end committed write proof for Safety lane
- Severity: **P0**
- Gap:
  - The system still cannot prove successful committed writes into the authoritative HBCentral Safety lists.
- Why it matters:
  - The Safety backend lane is not production ready until a real workbook can preview, commit, and persist expected records.
- Likely closure:
  - fix live reporting-period read seam, then execute proof run with before/after Graph snapshots.

## G-02 — Live blocker narrative and repo-truth narrative are out of sync
- Severity: **P0**
- Gap:
  - The attached brief says ingestion still uses `SharePointSafetyInspectionRepository`; current `main` explicitly guards against that.
- Why it matters:
  - Teams will diagnose the wrong seam unless deployed artifact parity is proven.
- Likely closure:
  - artifact/runtime parity audit tied to the live function host and current `main`.

## G-03 — Reporting-period read seam still fails in hosted environment
- Severity: **P0**
- Gap:
  - `getReportingPeriod()` is the current blocking seam.
- Why it matters:
  - The entire commit path is blocked before downstream persistence logic can execute.
- Likely root-cause lanes:
  - wrong identity
  - wrong grant
  - wrong site/list binding
  - wrong item identifier contract
  - stale deployment
- Likely closure:
  - instrument and prove outbound Graph GET on the reporting-period item under the deployed identity.

## G-04 — Graph-only cutover is incomplete at the broader backend level
- Severity: **P1**
- Gap:
  - Safety hot path is graph-native, but broader backend still has mixed Graph / SharePoint/PnP seams.
- Why it matters:
  - cutover objective remains only partially achieved.
- Likely closure:
  - classify seams into:
    - keep temporarily (provisioning-only)
    - migrate next
    - retire

## G-05 — Permission posture not yet proven under least privilege
- Severity: **P1**
- Gap:
  - staging/test may succeed with broad Graph grants, but steady-state least-privilege proof is not yet complete.
- Why it matters:
  - rollout can fail after late permission tightening if the exact required grants are not proven.
- Likely closure:
  - permission inventory + site/list selected-scope strategy + staged proof matrix.

## G-06 — Route surface remains broader than the immediate backend objective
- Severity: **P2**
- Gap:
  - monolithic host still imports many unrelated route families.
- Why it matters:
  - larger blast radius, noisier deploys, more opportunities for unintended exposure.
- Likely closure:
  - continue host-boundary tightening and release-scope proof.

## G-07 — Preview exists but is not yet the fully governed product contract
- Severity: **P1**
- Gap:
  - preview logic is strong, but the full submit flow should now explicitly treat preview as authority for template compatibility, parser source authority, reporting-period fit, and duplicate risk.
- Why it matters:
  - better operator diagnostics, fewer opaque 422 failures, cleaner commit semantics.
- Likely closure:
  - tighten preview response contract and align frontend submit workflow.

## G-08 — Workbook parser scaffolding is visible to end users
- Severity: **P2**
- Gap:
  - `ParserMeta` is visible in the uploaded workbook.
- Why it matters:
  - user-facing workflow discipline and template governance are weaker than intended.
- Likely closure:
  - hide the sheet while preserving named ranges and formulas.

## G-09 — Identifier contract for reporting period is still fragile
- Severity: **P1**
- Gap:
  - route requires `context.reportingPeriodId`; repository converts this into a numeric list item lookup path.
- Why it matters:
  - if the UI passes a logical/business ID instead of the numeric SharePoint/Graph item ID, reads fail even when permissions are correct.
- Likely closure:
  - define one canonical ID contract and enforce it front-to-back.

## G-10 — Observability is good but not yet “incident proof”
- Severity: **P2**
- Gap:
  - there is rich telemetry, but the incident path should include direct release evidence and explicit runbook queries for artifact drift, identity, and grant failures.
- Why it matters:
  - support time stays too high during live failures.
- Likely closure:
  - add proof queries, release checklist, and operator playbook.

## G-11 — Flex Consumption deployment assumptions require explicit confirmation
- Severity: **P1**
- Gap:
  - the repo’s packaging discipline is good, but hosting-plan-specific deployment semantics must be explicitly validated for the current live host.
- Why it matters:
  - artifact truth is only valuable if it maps to the actual deployment mechanism the plan supports.
- Likely closure:
  - confirm one-deploy alignment and release evidence on the live host.

## G-12 — Sampling and telemetry retention need explicit high-value event strategy
- Severity: **P2**
- Gap:
  - host sampling is enabled. High-value ingest failure and release-proof events should be reviewed for retention and operator usefulness.
- Why it matters:
  - critical failures can become harder to reconstruct.
- Likely closure:
  - validate telemetry classes retained during Safety ingest failures and releases.

## G-13 — SharePoint provisioning/control-plane seams are still conceptually coupled with data-plane thinking
- Severity: **P2**
- Gap:
  - the repo still presents a broad `SharePointService` facade that covers site provisioning and Safety ingestion delegation together.
- Why it matters:
  - operational reasoning stays harder than necessary.
- Likely closure:
  - keep façade temporarily, but continue documenting and testing underlying seam ownership.

## G-14 — No final proof yet that the workbook contract and backend contract fully agree
- Severity: **P1**
- Gap:
  - code expects parser markers and named ranges; uploaded workbook mostly matches, but one intent mismatch (`ParserMeta` visible) and formula portability risk remain.
- Why it matters:
  - parser confidence is high, but not yet fully governed.
- Likely closure:
  - finalize workbook governance checklist and lock the contract.

## Primary sources consulted

### Official platform guidance
- Azure Functions Node.js v4 programming model: https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4
- Azure Functions deployment technologies: https://learn.microsoft.com/en-us/azure/azure-functions/functions-deployment-technologies
- Zip deployment for Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/deployment-zip-push
- Run Functions from a package: https://learn.microsoft.com/en-us/azure/azure-functions/run-functions-from-deployment-package
- Azure Functions app settings reference: https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings
- Manage function app settings / CORS: https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings
- Azure Functions best practices: https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices
- Improve Azure Functions performance and reliability: https://learn.microsoft.com/en-us/azure/azure-functions/performance-reliability
- Monitor executions in Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring
- Application Insights logs in Azure Functions: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-functions/monitoring/functions-monitoring-appinsightslogs
- Managed identities for App Service and Azure Functions: https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity
- Managed identities developer guidance: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers
- Microsoft Graph throttling guidance: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft Graph Selected permissions overview: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Microsoft Graph create site permission: https://learn.microsoft.com/en-us/graph/api/site-post-permissions
- Microsoft Graph list item resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem
- Microsoft Graph get list item: https://learn.microsoft.com/en-us/graph/api/listitem-get
- Microsoft Graph create list item: https://learn.microsoft.com/graph/api/listitem-create
- Microsoft Graph update list item: https://learn.microsoft.com/en-us/graph/api/listitem-update
- Microsoft Graph create list: https://learn.microsoft.com/en-us/graph/api/list-create

### Repo truth inspected
- `backend/functions/README.md`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/README.md
- `backend/functions/package.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/package.json
- `backend/functions/host.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/host.json
- `backend/functions/src/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/index.ts
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
- `backend/functions/src/functions/health/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/index.ts
- `backend/functions/src/functions/health/ready.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/ready.ts
- `backend/functions/src/services/sharepoint-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/sharepoint-service.ts
- `backend/functions/src/services/safety-ingestion-application-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-application-service.ts
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-data-plane.ts
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-repository.ts
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts
- `backend/functions/src/utils/validate-config.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/utils/validate-config.ts
- `backend/functions/src/middleware/auth.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/auth.ts
- `backend/functions/src/middleware/authorization.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/authorization.ts
- `scripts/package-functions-artifact.ts`: https://github.com/RMF112018/hb-intel/blob/main/scripts/package-functions-artifact.ts
- `packages/features/safety/src/domain/templateContract.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/domain/templateContract.ts
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/contractWorkbookAccess.ts
- `packages/features/safety/src/parser/extractMetadata.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/extractMetadata.ts
- `packages/features/safety/src/parser/parseChecklist.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/parseChecklist.ts
- `packages/features/safety/src/parser/validateTemplate.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/validateTemplate.ts
