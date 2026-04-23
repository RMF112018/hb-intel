# 09 — Prompt 01 Graph-Only Cutover Closure

Date: 2026-04-23

## Closure statement
Prompt 01 is closed. The Safety ingestion lane no longer contains an active SharePoint REST list-item data plane in backend operations. Ingest and replay now run through Graph-native backend repository operations, and the frontend sharepoint adapter delegates ingest/replay to backend endpoints only.

## Implemented changes
1. Added backend replay lane:
- `POST /api/safety-records/replay` route added in `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`.
- `SharePointService.replaySafetyWorkbook()` added and wired through the same preflight/contract checks as ingest.

2. Extended Graph repository/data plane for replay:
- `SafetyIngestionGraphRepository.replayIngestion()` now:
  - resolves parent run from `SafetyIngestionRuns`,
  - downloads retained workbook bytes through Graph,
  - re-runs `runIngestionPipeline` with replay lineage and `supersedePrior`,
  - persists governed replay failure runs when replay cannot proceed.
- `SafetyIngestionGraphDataPlane.downloadFileByListItemId()` added.

3. Retired hybrid ingestion/replay behavior in sharepoint adapter:
- `SharePointSafetyInspectionRepository.ingestWorkbook()` now backend-only.
- `SharePointSafetyInspectionRepository.replayIngestion()` now backend-only.
- Removed local ingest/replay execution paths (`uploadToSafetyChecklistUploads`, `downloadUploadedWorkbook`, local `runIngestionPipeline` execution in adapter ingest/replay methods).

4. Regression-proofing updates:
- Cutover guard test expanded to cover replay (`backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`).
- Safety route wiring test expanded for replay route (`backend/functions/src/functions/adminApi/safety-record-keeping-routes.test.ts`).
- Backend ingestion adapter tests now assert replay delegates to backend endpoint (`packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.backend-ingestion.test.ts`).

## Proof of closure

### A) No active REST list-item path in Safety ingestion lane
Command:
- `rg -n "async ingestWorkbook|async replayIngestion|runIngestionPipeline|uploadToSafetyChecklistUploads|downloadUploadedWorkbook|/api/safety-records/ingest|/api/safety-records/replay" packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`

Result highlights:
- `ingestWorkbook` and `replayIngestion` methods remain.
- `runIngestionPipeline`, `uploadToSafetyChecklistUploads`, and `downloadUploadedWorkbook` are no longer present in active adapter ingest/replay path.
- Adapter now calls backend endpoints:
  - `/api/safety-records/ingest`
  - `/api/safety-records/replay`

### B) Backend ingest + replay are Graph-native
Command:
- `rg -n "async ingestSafetyWorkbook|async replaySafetyWorkbook|SharePointSafetyInspectionRepository|/_api/web/lists|createSafetyAppOnlySpHttpClient|new SafetyIngestionGraphRepository|repo.replayIngestion|repo.ingestWorkbook" backend/functions/src/services/sharepoint-service.ts`

Result highlights:
- `ingestSafetyWorkbook` and `replaySafetyWorkbook` both instantiate `SafetyIngestionGraphRepository`.
- Both invoke Graph repository operations (`repo.ingestWorkbook`, `repo.replayIngestion`).
- No ingestion/replay references to `SharePointSafetyInspectionRepository` remain in backend service lane.

### C) Repo-wide replay path and Graph download seam
Command:
- `rg -n "downloadFileByListItemId|async replayIngestion|runIngestionPipeline|/_api/web/lists" backend/functions/src/services/safety-ingestion-graph-repository.ts backend/functions/src/services/safety-ingestion-graph-data-plane.ts`

Result highlights:
- Replay exists in Graph repository.
- Graph data plane contains explicit retained-upload download method by list item id.
- No SharePoint REST `/_api/web/lists` usage exists in these Graph ingestion/replay service files.

### D) Route exposure proof
Command:
- `rg -n "route: 'safety-records/(ingest|ingest/preview|replay)'|replaySafetyWorkbook|ingestSafetyWorkbook|previewSafetyWorkbook" backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

Result highlights:
- `safety-records/ingest`, `safety-records/ingest/preview`, and `safety-records/replay` are all registered.
- Replay route calls `sharePoint.replaySafetyWorkbook(...)`.

## Verification run

### Backend/functions
- `pnpm --filter @hbc/functions test -- safety-ingestion-cutover-guard safety-record-keeping-routes safety-ingestion-graph-repository`
- `pnpm --filter @hbc/functions check-types`

Result: pass.

### Features/safety
- `pnpm --filter @hbc/features-safety test -- SharePointSafetyInspectionRepository.backend-ingestion`
- `pnpm --filter @hbc/features-safety check-types`

Result: pass.

## Retained REST/PnP code (intentionally not removed)
SharePoint REST/PnP usage remains in non-ingestion control-plane and other non-cutover seams (e.g., provisioning/topology/list contract checks and legacy non-ingestion operations). This is intentional per Prompt 01 prohibition: do not remove legitimately needed non-ingestion control-plane code.
