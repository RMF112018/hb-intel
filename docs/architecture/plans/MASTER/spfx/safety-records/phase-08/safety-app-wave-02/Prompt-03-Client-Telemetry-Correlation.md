# Prompt 03 — Client Telemetry Correlation

## Objective

Standardize Safety frontend telemetry correlation with backend telemetry.

## Governing authorities

- `apps/safety/src/pages/supportTruth.ts`
- `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts`
- `backend/functions/src/services/safety-ingestion-telemetry.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- Azure Monitor / Application Insights / OpenTelemetry conventions already used in repo

## Current gap

Frontend support payloads exist, but there is no governed client telemetry pipeline that reliably correlates browser state transitions to backend requests.

## Required implementation outcome

- Add a reusable Safety frontend telemetry seam.
- Emit lifecycle events for route commands, read-side operations, runtime binding, and cancellation.
- Propagate `frontendRequestId`, backend `requestId`, and failure class.
- Add W3C trace context if compatible with existing backend/logging strategy.
- Redact sensitive data and never log workbook contents or JWTs.

## Proof of closure

- Telemetry utility tests.
- At least one end-to-end local/mock proof that preview/commit/replay events emit expected metadata.
- Documentation for support correlation.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
