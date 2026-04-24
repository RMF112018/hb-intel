# Prompt 03 — Strengthen Safety Preview and Cutover Diagnostics

## Objective

Harden the Safety preview and ingestion diagnostics so operators can determine, from structured backend output, whether a failure is caused by template incompatibility, parser mismatch, reporting-period mismatch, duplicate/supersession risk, Graph permission failure, binding drift, or runtime artifact drift.

## Governing authorities

- existing preview contract and commit gate
- current Graph data plane and telemetry
- current request-id and response-helper conventions
- production-readiness need for supportable, discriminating diagnostics

## Files and seams to inspect

At minimum inspect:

- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- `backend/functions/src/services/safety-ingestion-telemetry.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/middleware/request-id.ts`
- any route handlers that shape preview/ingest/replay responses

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current gap to close

The backend already emits structured 400/422 responses, but production support still lacks enough discrimination between:
- template failure
- parse failure
- period mismatch
- unresolved project
- duplicate/supersession risk
- Graph auth/permission failure
- site/list binding error
- stale/wrong artifact suspicion

## Required implementation outcome

Strengthen the preview and ingest diagnostics so that:

1. preview returns a stable machine-readable structure for:
   - template compatibility
   - parser-contract marker state
   - field value sources
   - intake-vs-parser conflicts
   - reporting-period fit
   - project resolution result
   - duplicate risk
   - normalized key findings preview

2. ingest failure diagnostics preserve the failure class instead of flattening everything into generic failure messaging

3. Graph request failures surface enough non-secret context to support triage:
   - operation
   - site/list target
   - status family
   - whether the failure appears auth, permission, or binding related

4. all responses preserve request correlation

## Proof of closure required

- tests for preview response shape stability
- tests for failure-class mapping
- evidence that the route returns discriminating diagnostics instead of generic failure text
- no regression in commit gating

