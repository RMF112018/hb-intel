# Prompt 01 — Rebuild Safety Ingestion Data Plane Around Graph

## Objective
Close the current Safety ingestion blocker by replacing the failing repository/data-plane seam in the backend with a Graph-native Safety repository implementation. The outcome must be a working end-to-end ingest path that performs authoritative writes to the real Safety/HBCentral targets without depending on the current REST list-item path.

## Governing authorities
- Microsoft Learn: Azure Functions Node.js v4 programming model.
- Microsoft Learn: managed identity guidance for Azure-hosted apps.
- Microsoft Learn: Microsoft Graph SharePoint sites/list/listItem/file APIs.
- Microsoft Learn: Microsoft Graph throttling guidance.
- Repo truth in:
  - `backend/functions/src/services/sharepoint-service.ts`
  - `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
  - `packages/features/safety/src/lists/descriptors.ts`
  - `backend/functions/src/services/managed-identity-token-service.ts`

## Files / seams / symbols to inspect
- `backend/functions/src/services/sharepoint-service.ts`
  - `ingestSafetyWorkbook`
  - `createSafetyAppOnlySpHttpClient`
  - `resolveSafetyGuidOverlay`
- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
  - `getReportingPeriod`
  - `createReportingPeriod`
  - `commit`
  - `postItem`
  - `fetchItem`
  - `fetchItems`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- any Graph service/helper seam you need to add under `backend/functions/src/services/**` or the Safety package

## Current gap to close
The current backend validates targets and contracts successfully, then crosses into a REST repository and fails on the first reporting-period read. This is the wrong seam to preserve. Do not attempt to patch around the current 401 and call that done.

## Required implementation outcome
1. Introduce a Graph-native repository path for the Safety ingestion lane.
2. Move reporting-period reads/writes first.
3. Move project-week, inspection-event, findings, and ingestion-run writes to the same Graph-native lane.
4. Move workbook upload landing to Graph file APIs where that lane is part of ingestion correctness.
5. Cut `SharePointService.ingestSafetyWorkbook()` over to the new repository path.
6. Preserve the authoritative site/list topology already modeled by the descriptors.
7. Keep unrelated admin-control-plane work out of scope.

## Proof of closure required
- Show that `POST /api/admin/safety-records/ingest` completes successfully against real targets.
- Show before/after proof that `Safety Ingestion Runs`, `Safety Project Week Records`, `Safety Inspection Events`, and `Safety Findings` changed (`delta > 0`).
- Prove that the ingestion path no longer uses REST list-item calls.
- Show structured logs for the Graph-based read/write flow.
- Show that replay/idempotency behavior was not regressed.

## Hard prohibitions
- Do not do unrelated frontend work.
- Do not rewrite provisioning dry-run unless required by the ingestion cutover.
- Do not keep the REST repository as the active ingestion data plane.
- Do not claim closure based only on unit tests or route presence.

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
