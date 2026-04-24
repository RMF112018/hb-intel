# Prompt-05 — Add Observability, Retries, Idempotency, and Run Control

## Objective
Make the new Procore connector operable in production with real diagnostics, safe retries, and rollout control.

## Governing authorities
- `backend/functions/src/idempotency/with-idempotency.ts`
- `backend/functions/src/utils/withTelemetry.ts`
- `backend/functions/host.json`
- `backend/functions/src/config/wave0-env-registry.ts`
- `docs/how-to/developer/native-integration-backbone-implementation-guide.md`
- Microsoft/Azure Functions production reliability guidance

## Repo seams to inspect
- idempotency helpers
- telemetry helpers
- admin observability route seams
- config registry and startup validation
- any timer / orchestration entrypoints added for Procore

## Current gap to close
Even after connection and storage work land, the connector will still be unsafe without:
- rate-limit-aware retries
- idempotent extraction/publication behavior
- subject-area freshness tracking
- replay controls
- operator diagnostics and rollout gates

## Required implementation outcome
1. Add Procore-specific run-health and freshness telemetry.
2. Add safe retry policy boundaries for transient failures.
3. Add duplication-control / idempotency for extraction and publication steps.
4. Add admin-visible sync health / freshness / last-failure surfaces.
5. Add rollout controls so subject-area activation can be gated and observed.
6. Ensure logging never leaks secrets or raw sensitive payloads.

## Proof of closure
Return:
- retry and idempotency behavior added
- observability surfaces/endpoints added
- metrics/events/log patterns added
- rollout-control/config changes added
- explicit proof that secrets are not emitted in telemetry

## Guardrails
- Do not add noisy or secret-leaking logs.
- Do not assume retries are safe unless idempotency is implemented.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
