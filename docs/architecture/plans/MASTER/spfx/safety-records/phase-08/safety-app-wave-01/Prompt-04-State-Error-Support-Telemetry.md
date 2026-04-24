# Prompt 04 — State/Error Support Telemetry

## Objective

Close remaining truthful-state, error-classification, and production support gaps for Safety upload, preview, commit, replay, and read-side list flows.

## Governing authorities

- `apps/safety/src/pages/supportTruth.ts`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

## Current gap

The app has good support payloads and failure classification, but production client telemetry is not yet a governed seam. Request IDs are present, but frontend state transitions and failures are not emitted as structured production telemetry.

## Required implementation outcome

- Add structured frontend telemetry for preview, commit, replay, read-side failures, cancellation, and runtime binding blocked states.
- Include safe fields: route action, frontend request ID, backend request ID, failure class, preview failure class, HTTP status, attempts, and package/runtime binding proof fingerprint.
- Add W3C `traceparent` or documented correlation strategy if feasible.
- Preserve support-payload safety: do not expose JWTs, workbook content, raw graphContext, or unrestricted backend messages in the UI.

## Proof of closure

- Telemetry utility tests.
- Component/mutation tests proving telemetry emission.
- Documentation showing how support can correlate frontend and backend events.
- No unrelated logging noise.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
