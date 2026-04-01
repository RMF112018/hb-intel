# Prompt-05 — Phase 8 Operational Readiness, Runbook, and Support Verification

## Objective

Verify that the Project Setup workflow is operationally supportable and that runbooks, maintenance guidance, troubleshooting docs, and readiness evidence accurately reflect live repo behavior.

Use the audit output from:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Critical Working Rules

- Treat live repo truth as authoritative.
- Prefer correcting docs to match implemented truth rather than writing aspirational support guidance.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Be explicit wherever the repo still requires environment-gated or Azure/tenant validation outside local/test execution.

## Required Source Review

At minimum, review and reconcile:

- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/architecture/blueprint/current-state-map.md`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `packages/features/admin/src/monitors/provisioningFailureMonitor.ts`
- `packages/features/admin/src/monitors/stuckWorkflowMonitor.ts`
- `packages/features/admin/src/probes/azureFunctionsProbe.ts`
- `packages/features/admin/src/probes/sharePointProbe.ts`
- any other current runbook or readiness reference directly cited by the earlier prompts

## Required Work

1. Audit and reconcile operational documentation against actual repo behavior for:
   - diagnosing failed or stuck runs
   - routing failures from Accounting to Admin
   - retry / escalation / archive / state override actions
   - status truth and polling / SignalR expectations
   - environment-dependent operational prerequisites
   - observability queries and alert assumptions
2. Correct drift where docs claim broader readiness than the repo proves.
3. Preserve and clearly label out-of-repo Azure/portal work rather than implying it is repo-complete.
4. Update the audit memo with explicit supportability conclusions.

## Required Deliverable Updates

Update progress and evidence in:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

Also update the reconciled maintenance/readiness docs as needed.

## Required Output Expectations

The resulting documentation must make it easy for a later implementation or operations agent to answer:

- what is diagnosable from the UI
- what requires Admin action
- what requires Azure/App Insights/portal access
- what is still environment-gated
- what is intentionally deferred

## Completion Standard

This prompt is complete only when the support/runbook/readiness docs reflect current repo truth rather than plan ambition, and when remaining external/platform prerequisites are explicitly identified instead of implied away.
