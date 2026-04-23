# 11 — Prompt 03 Observability, Idempotency, and Release Proof Closure

Date: 2026-04-23

## Closure statement
Prompt 03 is closed. Safety ingestion now has stage-level structured telemetry, Graph-aware retry/backoff with explicit delay-source metadata, duplicate/idempotency outcome telemetry, and artifact-based release proof for admin-control-plane host composition and Safety route registration.

## Implemented hardening
1. Telemetry taxonomy + redaction helper:
- `backend/functions/src/services/safety-ingestion-telemetry.ts`
- Emits bounded customEvent/customMetric payloads and redacts workbook-sensitive keys.

2. Stage-level pipeline telemetry observer contract:
- `packages/features/safety/src/ingestion/runIngestionPipeline.ts`
- Added optional telemetry observer contract and emitted stage events for parse/validation/resolution/duplicate/write groups/terminal outcomes.

3. Backend lane telemetry wiring:
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- Correlation fields (`requestId`, `runId`, `parentRunId`, `attemptNumber`, `operation`) are threaded through backend ingest/replay/preview telemetry.

4. Retry/backoff hardening:
- `backend/functions/src/utils/retry.ts`
- Handles `Retry-After` (seconds + HTTP-date) and `x-ms-retry-after-ms`, transient-only retry classes, bounded exponential backoff + jitter, explicit retry metadata.

5. Artifact release proof contract:
- `scripts/package-functions-artifact.ts`
- Adds admin-control-plane host composition assertions and Safety route signature assertions into staged artifact validation + inventory metadata.
- Regression gate added in `backend/functions/src/test/release-gates.test.ts`.

6. Operator reference update:
- `docs/reference/developer/monitoring-queries.md`
- Added Safety ingestion stage timeline, Graph throttle/retry evidence, and idempotency/duplicate outcome query blocks.

## Telemetry examples (redacted)
Command:
- `pnpm exec tsx -e "import { emitSafetyIngestionEvent } from './backend/functions/src/services/safety-ingestion-telemetry.ts'; ..."`

Output sample (success):
```json
{"level":"info","_telemetryType":"customEvent","name":"safety.ingestion.request.completed","requestId":"req-success","operation":"ingest","runId":"run-123","attemptNumber":1,"timestamp":"2026-04-23T13:44:11.057Z","state":"committed","runSpItemId":123,"reportingPeriodId":"period-14"}
```

Output sample (failure with redaction):
```json
{"level":"info","_telemetryType":"customEvent","name":"safety.ingestion.request.failed","requestId":"req-fail","operation":"ingest","timestamp":"2026-04-23T13:44:11.058Z","message":"SAFETY_INGESTION_PARSE_FAILED","rawChecklistJson":"[REDACTED]","fileContentBase64":"[REDACTED]"}
```

## Throttling/backoff proof
Code + seam search:
- `rg -n "Retry-After|x-ms-retry-after-ms|jitterRatio|onRetry:|isTransientError|parseRetryAfter" backend/functions/src/utils/retry.ts backend/functions/src/services/safety-ingestion-graph-data-plane.ts`

Result highlights:
- `retry.ts` now includes typed retry metadata source classes and header parsing.
- Graph data plane emits retry telemetry from `onRetry`.

Test proof:
- `backend/functions/src/utils/retry.test.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-graph-data-plane.test.ts`

## Idempotency / duplicate suppression proof
Code + seam search:
- `rg -n "safety\.ingestion\.(pipeline\.stage|idempotency\.short-circuit|duplicate\.review-required|duplicate\.supersession)" backend/functions/src packages/features/safety/src`

Result highlights:
- Stage + idempotency/duplicate events are emitted from Graph repository observer wiring.

Behavioral test proof:
- `packages/features/safety/src/ingestion/runIngestionPipeline.test.ts`
  - includes assertion that idempotent short-circuit emits terminal success metadata and does not emit `write-group.inspection-event` start.

## Artifact host composition + route registration proof
Successful artifact-proof commands:
1. `pnpm --filter @hbc/functions build`
2. `pnpm exec tsx scripts/package-functions-artifact.ts --skip-build --staging /tmp/functions-deploy-prompt03 --output /tmp/functions-artifact-prompt03.zip`

Artifact summary output:
```json
{
  "outputZipPath": "/tmp/functions-artifact-prompt03.zip",
  "stagingDir": "/tmp/functions-deploy-prompt03",
  "inventoryPath": "/tmp/functions-deploy-prompt03/artifact-inventory.json",
  "inventoryInZip": "artifact-inventory.json",
  "deployCommand": "az functionapp deploy --type zip --src-path <artifact.zip>"
}
```

Inventory proof:
- `/tmp/functions-deploy-prompt03/artifact-inventory.json` contains:
  - `entrypoint: "./dist/backend/functions/src/index.js"`
  - `adminControlPlaneReleaseProof.hostEntrypoint: "dist/backend/functions/src/hosts/admin-control-plane/index.js"`
  - `adminControlPlaneReleaseProof.safetyRouteSignatures` including:
    - `safety-records/ingest`
    - `safety-records/ingest/preview`
    - `safety-records/replay`

Staged artifact route scan:
- `rg -n "safety-records/(ingest|ingest/preview|replay)" /tmp/functions-deploy-prompt03/dist/backend/functions/src/functions/adminApi/safety-record-keeping-routes.js`
- Shows all three route signatures present.

Zip inventory proof:
- `unzip -l /tmp/functions-artifact-prompt03.zip | rg "artifact-inventory.json|hosts/admin-control-plane/index.js|functions/adminApi/safety-record-keeping-routes.js"`
- Shows expected host/route files plus `artifact-inventory.json` in packaged artifact.

## Verification summary
Backend/functions:
- `pnpm --filter @hbc/functions test -- src/services/__tests__/safety-ingestion-graph-data-plane.test.ts src/services/__tests__/safety-ingestion-graph-repository.test.ts src/services/__tests__/safety-ingestion-telemetry.test.ts src/utils/retry.test.ts src/test/release-gates.test.ts`
- `pnpm --filter @hbc/functions check-types`

Features/safety:
- `pnpm --filter @hbc/features-safety test -- src/ingestion/runIngestionPipeline.test.ts`
- `pnpm --filter @hbc/features-safety check-types`

Result:
- Pass.
