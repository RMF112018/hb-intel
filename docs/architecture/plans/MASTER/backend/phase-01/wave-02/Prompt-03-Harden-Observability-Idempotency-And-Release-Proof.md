# Prompt 03 — Harden Observability, Idempotency, And Release Proof

## Objective
Add the operational hardening needed so the backend is supportable in production: stronger data-plane telemetry, explicit retry/throttling behavior, idempotency clarity, and artifact/host release proof.

## Governing authorities
- Azure Functions Application Insights / OpenTelemetry guidance.
- Microsoft Graph throttling guidance.
- Repo truth in:
  - `backend/functions/src/utils/logger.ts`
  - `backend/functions/src/utils/withTelemetry.ts`
  - `backend/functions/src/hosts/admin-control-plane/**`
  - Safety ingestion service/repository seams

## Files / seams / symbols to inspect
- telemetry/logging helpers
- Safety ingestion route/service/repository
- build/deploy/release scripts or docs tied to the admin-control-plane host
- any test/proof harness already used for backend deployment verification

## Current gap to close
The backend has useful structured logging, but not yet enough:
- stage-by-stage data-plane telemetry,
- Graph throttling/backoff behavior,
- explicit idempotency/duplicate suppression proof,
- or host-composition artifact proof for release integrity.

## Required implementation outcome
1. Emit clear structured events for:
   - preview/parse start,
   - contract validation,
   - project/reporting-period resolution,
   - each major write group,
   - throttling/backoff,
   - terminal success/failure.
2. Implement Graph-appropriate retry/backoff behavior honoring `Retry-After`.
3. Strengthen idempotency/duplicate suppression proof.
4. Add release proof that shows the correct host composition and route registration for the deployed artifact.

## Proof of closure required
- Show telemetry examples for a successful and failed ingest.
- Show throttling/backoff behavior in code and test proof.
- Show idempotency/duplicate suppression proof.
- Show release proof for host composition and registered routes.

## Hard prohibitions
- Do not bloat telemetry with raw workbook contents or sensitive data.
- Do not add blind retries.
- Do not rely on “deployment succeeded” as release proof.

## Important working rule
Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
