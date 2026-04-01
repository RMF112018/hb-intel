# Prompt-03 — Phase 8 Integration and End-to-End Workflow Validation Hardening

## Objective

Harden the integration and realistic-path validation story for the Project Setup workflow so the repo demonstrates credible cross-surface behavior from requester submission through controller action, provisioning runtime behavior, failure routing, and Admin exception handling.

Use the audit output from:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Critical Working Rules

- Treat live repo code and tests as authoritative for implementation facts.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Keep scope on production-relevant flows, not cosmetic-only UI checks.
- Do not overstate deterministic repo-local proof as full hosted-environment or tenant proof.
- This prompt is about integration / realistic-path validation hardening, not broad feature redesign.

## Required Validation Targets

Audit and expand integration / realistic-path validation for:

- requester submission → controller queue visibility
- controller clarification / hold / approve / failed-routing behavior
- approval-to-`ReadyToProvision` handoff and subsequent provisioning status visibility
- failure routing into Admin oversight
- cross-app / cross-surface context handoff (including `?projectId=` where relevant)
- reopen / retry / terminal-state expectations where applicable
- PWA / SPFx parity assumptions where they materially affect shared lifecycle behavior

## Required Source Review

At minimum, review and use the most relevant current sources among:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- `apps/admin/src/test/OperationalDashboardPage.test.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/test/parity/stateLabels.test.ts`
- `apps/pwa/src/test/parity/wizardConfig.test.ts`
- current requester/coordinator/completion tests in Estimating
- any existing browser/integration harnesses or environment-gated validation seams directly identified by the audit

## Required Evidence Classification

For every meaningful validation result, classify it as one of:

- repo-proven deterministic integration proof
- repo-proven browser-level proof
- environment-gated validation still required
- out-of-repo tenant/Azure validation still required
- intentionally deferred

Do not collapse these into one generic “E2E complete” statement.

## Required Deliverable Updates

Update progress and evidence in:

`docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

Include:

- command results
- files added/updated
- what is now proven
- what still requires hosted / tenant / Azure validation
- any meaningful limitations of the proof

## Completion Standard

This prompt is complete only when the repo clearly shows:

- what realistic cross-surface integration behavior is repo-proven
- what still requires environment-gated proof
- what cannot honestly be claimed as full E2E/pilot proof yet

Do not hide proof limitations behind generic “integration complete” language.
