# 07 — Prioritized Remediation Plan

## Priority ordering
- **Now** = required to unblock production-readiness assessment
- **Next** = required before rollout
- **Later** = important hardening after the blocker is closed

## R-01 — Prove the live artifact is the graph-native code on current `main`
- Priority: **Now**
- Closes:
  - G-02
  - part of G-11
- Implementation direction:
  - verify deployed artifact/version/sha against current repo and release manifest
  - verify the active host includes the graph-native Safety routes and cutover-guard expectations
- Impact:
  - prevents wrong-root-cause diagnosis
- Cross-layer implications:
  - deployment pipeline
  - release evidence
  - incident triage
- Type:
  - refinement with proof-oriented checks

## R-02 — Repair the reporting-period read seam under the deployed identity
- Priority: **Now**
- Closes:
  - G-01
  - G-03
  - G-09
- Implementation direction:
  - instrument `getReportingPeriod()` and its caller chain
  - prove:
    - outbound identity
    - target site
    - target list
    - target item id
    - returned status / graph error code
  - confirm whether `context.reportingPeriodId` is the numeric Graph/SharePoint list item id expected by `spItemIdFromString()`
  - correct ID contract if not
- Impact:
  - removes the live blocker
- Cross-layer implications:
  - route payload contract
  - frontend upload context
  - graph repository
  - telemetry
- Type:
  - structural bug closure

## R-03 — Complete live end-to-end graph write proof for Safety ingest
- Priority: **Now**
- Closes:
  - G-01
- Implementation direction:
  - once reporting-period read is fixed, run controlled proof cases:
    - preview success
    - commit success
    - replay success
    - duplicate/supersession case
  - capture before/after Graph snapshots for all target lists
- Impact:
  - moves Safety lane from theoretical readiness to proven readiness
- Cross-layer implications:
  - QA
  - runbooks
  - release gating
- Type:
  - refinement + proof

## R-04 — Formalize one canonical reporting-period identifier contract
- Priority: **Now**
- Closes:
  - G-09
- Implementation direction:
  - choose one authoritative ID model:
    - numeric list item id
    - or explicit logical id plus server-side resolution
  - enforce it in:
    - route contract
    - frontend upload payload
    - preview diagnostics
    - repository assumptions
- Impact:
  - removes a fragile boundary
- Cross-layer implications:
  - frontend/backed contract
- Type:
  - structural contract correction

## R-05 — Treat preview as the canonical pre-commit validation surface
- Priority: **Next**
- Closes:
  - G-07
  - G-14
- Implementation direction:
  - keep current preview logic
  - tighten response schema
  - require preview-equivalent validation before commit
  - expose field authority and template compatibility clearly
- Impact:
  - better operator feedback, fewer opaque failures
- Cross-layer implications:
  - route contract
  - frontend UX
  - parser authority
- Type:
  - refinement

## R-06 — Adopt the workbook parser contract as governed authority
- Priority: **Next**
- Closes:
  - G-14
- Implementation direction:
  - enforce accepted marker values
  - keep parser-meta / named range precedence
  - reserve visible-sheet fallback for unmarked legacy templates
  - add explicit incompatible-template diagnostics
- Impact:
  - more deterministic parsing
- Cross-layer implications:
  - template governance
  - parser code
  - support workflow
- Type:
  - refinement with governance hardening

## R-07 — Correct the workbook artifact so `ParserMeta` is hidden
- Priority: **Next**
- Closes:
  - G-08
- Implementation direction:
  - update workbook distribution artifact
  - preserve formulas, names, and validations
  - hide parser-support sheet
- Impact:
  - cleaner field-user workflow and stronger template governance
- Cross-layer implications:
  - workbook distribution and documentation
- Type:
  - refinement

## R-08 — Complete Graph-only application-facing cutover declaration
- Priority: **Next**
- Closes:
  - G-04
  - G-13
- Implementation direction:
  - explicitly document which seams are:
    - graph-only and complete
    - transitional and isolated
    - still pending migration
  - refuse reintroduction of REST/PnP into Safety ingest/preview/replay hot paths
- Impact:
  - clearer architecture and lower regression risk
- Cross-layer implications:
  - docs
  - tests
  - architectural governance
- Type:
  - architectural hardening

## R-09 — Tighten permissions before rollout and re-prove behavior
- Priority: **Next**
- Closes:
  - G-05
- Implementation direction:
  - derive exact permission inventory from successful staging flow
  - remove unnecessary broad grants
  - prefer selected-scope/resource-grant model where feasible
  - rerun end-to-end proof suite under tightened posture
- Impact:
  - converts staging success into production-safe success
- Cross-layer implications:
  - Entra / Graph / SharePoint admin ops
  - release gates
- Type:
  - structural security hardening

## R-10 — Confirm Flex-host deployment mechanics and release proof
- Priority: **Next**
- Closes:
  - G-11
- Implementation direction:
  - confirm live host deployment method aligns with current Flex guidance
  - keep artifact manifest + health identity proof
  - ensure release runbook explicitly matches hosting-plan reality
- Impact:
  - higher deployment integrity
- Cross-layer implications:
  - pipeline
  - release ops
- Type:
  - refinement / deployment hardening

## R-11 — Reduce route-surface blast radius where practical
- Priority: **Later**
- Closes:
  - G-06
- Implementation direction:
  - continue moving toward tighter host-boundary deployment where it meaningfully reduces risk
- Impact:
  - maintainability and hardening
- Cross-layer implications:
  - packaging
  - composition roots
- Type:
  - architectural optimization

## R-12 — Strengthen incident-proof observability
- Priority: **Later**
- Closes:
  - G-10
  - G-12
- Implementation direction:
  - add operator query pack / runbook
  - review telemetry retention for high-value Safety events
  - make artifact/version/identity/grant failures fast to diagnose
- Impact:
  - better supportability
- Cross-layer implications:
  - ops
  - telemetry
- Type:
  - refinement

## Direction-of-record decisions

### Repository direction
- The backend should **not** be treated as a generic broken system.
- The current Safety lane should be treated as a **graph-native design that still needs live proof closure**.

### Auth / data-plane direction
- The repository should be kept **away from remaining failing REST/app-only ingestion behavior**.
- The working provisioning model should **not** be allowed to justify split behavior in the Safety hot path.
- The graph-only cutover should become the new application-facing backend direction of record.

### Parser direction
- The parser should prefer:
  1. `ParserMeta`
  2. named ranges
  3. visible-sheet fallback only for legacy/unmarked templates

### Additional required changes
Yes:
- additional auth/runtime proof
- additional config/binding proof
- likely route-contract tightening for reporting-period ID semantics
are still required before end-to-end writes can be declared safely restored.

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
