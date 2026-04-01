# Prompt-04 — Phase 8: Degraded-Path, Failure-Mode, and Observability Validation Hardening

## Objective

Validate that the Project Setup workflow behaves acceptably under degraded and failure conditions, and that telemetry / observability coverage is sufficient for support and troubleshooting.

## Required working approach

1. Validate repo-truth behavior for degraded or failure modes including, where applicable:
   - SignalR unavailable or disconnected
   - polling fallback required
   - backend/API request failure
   - provisioning status missing / stale / partial
   - SharePoint / Graph transient failure and retry paths
   - connected-service partial configuration or absence

2. Verify observability and diagnostics coverage for:
   - launch events
   - state transitions
   - provisioning status updates
   - failure / escalation paths
   - retry or reopen activity

3. Update tests, docs, and verification evidence as appropriate.

4. Update progress and evidence in:
   - `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Required outputs

- explicit degraded-path validation evidence
- observability / telemetry validation notes
- documented remaining high-risk blind spots, if any

## Rules

- Do not assume degraded behavior is correct because a doc says so; verify against repo truth.
- Distinguish between graceful degradation, hard failure, and unimplemented handling.
