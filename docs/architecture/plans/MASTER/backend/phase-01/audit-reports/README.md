# HB Intel Backend Azure Functions Audit Package

Date: 2026-04-23

This package is the repo-truth and research-backed backend audit for the HB Intel Azure Functions application, focused on production readiness, the current Safety ingestion blocker, the Graph-only cutover target, and workbook parser-contract modernization.

## Package contents
- `00-Backend-Audit-Summary.md`
- `01-Backend-Implementation-Map.md`
- `02-Research-Backed-Assessment.md`
- `03-Production-Readiness-Gap-Register.md`
- `04-Repository-and-Graph-Risk-Assessment.md`
- `05-Graph-Only-Cutover-Plan.md`
- `06-Workbook-Parsing-Target-Assessment.md`
- `07-Prioritized-Remediation-Plan.md`
- `08-Recommended-Execution-Waves.md`
- `09-Prompt-01-Graph-Only-Cutover-Closure.md`
- `10-Prompt-02-Permission-Posture-Closure.md`
- `11-Prompt-03-Observability-Idempotency-Release-Proof-Closure.md`

## Headline conclusion
The backend is not production ready today. The strongest parts are the route registration recovery, JWT validation posture, scoped admin host composition, fail-closed site/reference-list validation, and the existing use of managed-identity-based control-plane access. The dominant blocker is still the Safety ingestion data plane: the backend validates and starts correctly, then crosses into a repository that still performs SharePoint REST app-only list operations and fails at the first reporting-period read. The codebase is therefore operating with a mixed control-plane/data-plane integration model that is brittle and misaligned with the stated Graph-only target.

## Strategic direction
The recommended direction of record is:
1. Stabilize staging/test with the Graph permissions that already exist for the registered app.
2. Remove the remaining Safety repository dependence on SharePoint REST for operational reads/writes.
3. Adopt a Graph-first data plane for SharePoint list and file operations where feasible.
4. Tighten permissions explicitly before rollout by replacing convenience permissions with the least privileged selected-scope posture that still supports the final design.
5. Upgrade parser authority to prefer `ParserMeta`, named ranges, and workbook contract/version markers before visible-cell fallbacks.

## External guidance used
- Azure Functions Node.js developer guide (Functions v4 / `@azure/functions` v4, flexible code-centric registration).
- Azure Functions host.json reference.
- Azure Functions Flex Consumption guidance.
- Azure App Service / Azure Functions managed identity guidance.
- Azure Functions + OpenTelemetry / Application Insights guidance.
- Microsoft Graph SharePoint sites, lists, list items, file upload, throttling, and selected-permissions guidance.

## Repo-truth basis
- `backend/functions/src/hosts/admin-control-plane/index.ts`
- `backend/functions/src/functions/adminApi/index.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/parser/xlsxWorkbookView.ts`
- `packages/features/safety/src/parser/extractMetadata.ts`
- `packages/features/safety/src/parser/validateTemplate.ts`
- `packages/features/safety/src/domain/templateContract.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- related auth/config/runtime seams in `backend/functions/src/middleware/**`, `backend/functions/src/utils/**`, and `backend/functions/src/hosts/admin-control-plane/service-factory.ts`

## Uploaded artifacts incorporated
- Audit objective prompt uploaded in-session.
- `Safety_Checklist_Template.xlsx` inspected locally.
- `HB SharePoint Creator.json` inspected locally.
