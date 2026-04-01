# Prompt-04 — Phase 8 Degraded-Path, Failure-Mode, and Observability Validation Hardening

## Objective

Validate that the Project Setup workflow behaves acceptably under degraded and failure conditions, and that telemetry / observability coverage is sufficient for support and troubleshooting based on actual repo seams rather than assumptions.

Use the audit output from:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for current degraded-path behavior.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not assume degraded behavior is correct because a doc says so; verify against repo truth.
- Distinguish between graceful degradation, hard failure, unimplemented handling, and externally configured observability.

## Required Validation Targets

Validate repo-truth behavior for degraded or failure modes including, where applicable:

- SignalR unavailable or disconnected
- polling fallback required
- backend/API request failure
- provisioning status missing / stale / partial
- SharePoint / Graph transient failure and retry paths
- connected-service partial configuration or absence
- stuck-run detection
- alert synthesis for failed/stuck conditions
- observability / logging continuity for key lifecycle and failure events

## Required Source Review

At minimum, review and use:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `packages/provisioning/src/failure-modes.ts`
- `packages/provisioning/src/integration-rules.ts`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `packages/features/admin/src/monitors/provisioningFailureMonitor.ts`
- `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts`
- `packages/features/admin/src/probes/azureFunctionsProbe.ts`
- `packages/features/admin/src/probes/sharePointProbe.ts`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- any current backend provisioning failure/compensation diagnostics identified by repo truth

## Required Deliverable Updates

Update progress and evidence in:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

The update must include:

- explicit degraded-path validation evidence
- observability / telemetry validation notes
- what is repo-proven vs docs-only vs externally configured
- remaining high-risk blind spots, if any

## Hard Requirement

Explicitly classify each major degraded-path claim as one of:

- repo-proven
- docs-supported but not repo-proven
- environment-gated
- out-of-repo Azure/tenant configured
- intentionally deferred

## Completion Standard

This prompt is complete only when the repo and readiness docs can answer, with evidence:

- what happens when real-time updates fail
- what the fallback path is
- how failures are surfaced to Admin/support
- what observability exists in repo versus only in Azure/portal configuration
- what degraded-path blind spots remain
