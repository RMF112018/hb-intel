# 19 — Prompt-01 Restore Safety Ingestion Graph Data Plane

Date: 2026-04-24

## Scope
- Enforced fail-closed Graph-only backend ingestion/replay/preview code path.
- Added protected non-mutating reporting-period Graph probe endpoint.
- Added behavioral guard tests for code-path enforcement and reporting-period seam diagnostics.

## Before Evidence
- Live failure from prior run:
  - `Fetch item 1 from Safety Reporting Periods failed (401)` during `POST /api/safety-records/ingest`.

## Changes Implemented
- Runtime graph-only enforcement in `SafetyIngestionApplicationService`:
  - explicit `codePath` validation before ingest/preview/replay/probe repository operations.
  - structured fail-closed error code: `SAFETY_INGESTION_CODE_PATH_VIOLATION`.
  - telemetry events: `safety.ingestion.code-path.validated` and `safety.ingestion.code-path.violation`.
- New admin-gated, non-mutating Graph probe route:
  - `GET /api/safety-records/reporting-periods/{reportingPeriodId}/probe?reportingPeriodSpItemId=<id>`.
  - canonical reporting-period contract validation enforced.
  - returns safe seam diagnostics (`codePath`, `siteUrl`, `siteId`, `listId`, `parsedItemId`, `statusCode`, `graphErrorCode`, `causeBucket`, `graphPathSummary`).
- Repository diagnostics:
  - added `probeReportingPeriodRead(...)` on `SafetyIngestionGraphRepository`.
  - deterministic bucket mapping for `401/403/404` classes.
- Backend guard test:
  - runtime source tree scan fails if `SharePointSafetyInspectionRepository` appears in non-test backend source.

## Verification Commands Executed
1. `pnpm --filter @hbc/functions check-types`
2. `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-application-service.test.ts src/services/__tests__/safety-ingestion-graph-repository.test.ts src/services/__tests__/safety-ingestion-cutover-guard.test.ts src/functions/adminApi/safety-record-keeping-routes.test.ts src/services/__tests__/safety-ingestion-failure-classifier.test.ts src/services/__tests__/safety-ingestion-graph-data-plane.test.ts`
3. `pnpm --filter @hbc/functions build`
4. `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-application-service.test.ts > /tmp/safety-e2e-evidence/prompt01-graph-cutover/app-service-test.log 2>&1`
5. `rg -n "safety.ingestion.code-path.(validated|violation)|SAFETY_INGESTION_CODE_PATH_VIOLATION" /tmp/safety-e2e-evidence/prompt01-graph-cutover/app-service-test.log`
6. `rg -n "/_api/web/lists|createSafetyAppOnlySpHttpClient|SharePointSafetyInspectionRepository" backend/functions/src/services backend/functions/src/functions/adminApi -g '!**/*.test.ts'`
7. Live smoke sequence:
   - `/tmp/safety-e2e-context.sh`
   - `POST /api/safety-records/ingest/preview` (request id `prompt01-preview-20260424`)
   - `POST /api/safety-records/ingest` (request id `prompt01-ingest-20260424`)
   - `GET /api/safety-records/reporting-periods/period-1/probe?reportingPeriodSpItemId=1` (request id `prompt01-probe-20260424`)

## Observed Results
- Typecheck/build: PASS.
- Targeted test suites: PASS.
- Code-path telemetry proof:
  - includes `safety.ingestion.code-path.validated` with `codePathObserved=graph-only`.
  - includes `safety.ingestion.code-path.violation` + `SAFETY_INGESTION_CODE_PATH_VIOLATION` for non-graph test double.
- REST seam search (runtime files, excluding tests): PASS (0 matches).
- Live preview smoke:
  - HTTP 200; preview returned with `requestAccepted=true`.
- Live ingest smoke:
  - HTTP 422 `SAFETY_INGESTION_COMMIT_NOT_READY` / `preview-gate-blocked`.
  - no reporting-period `401` observed in this request path.
- Live probe smoke:
  - HTTP 404 on new probe route (host route parity lag; code exists locally and tests pass).

## Artifact Paths
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/preview-request.json`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/preview-headers.txt`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/preview-response.json`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/ingest-headers.txt`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/ingest-response.json`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/probe-headers.txt`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/probe-response.json`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/code-path-telemetry-proof.txt`
- `/tmp/safety-e2e-evidence/prompt01-graph-cutover/search-proof/backend-rest-seams-runtime.txt`

## Canonical Statement: Safety Ingestion Data Plane
- Backend Safety ingestion application data plane is Graph-only.
- No active SharePoint REST/PnP list-item ingestion seam remains in backend runtime Safety ingest/preview/replay sources.
- Remaining REST/PnP code in repository is outside this backend ingestion lane.

## Residual Gap
- Live host route parity must be refreshed for the new probe endpoint (`/api/safety-records/reporting-periods/{id}/probe` returned `404` in current deployed runtime).
