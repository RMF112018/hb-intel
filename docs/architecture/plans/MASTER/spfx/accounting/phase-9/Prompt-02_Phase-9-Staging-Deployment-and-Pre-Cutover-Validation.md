# Prompt-02 — Phase 9 Staging Deployment and Pre-Cutover Validation

## Objective

Create or harden the authoritative staging deployment and pre-cutover validation package for the Accounting app and connected Project Setup workflow.

Use the release-readiness audit as the baseline:

`docs/architecture/reviews/phase-9-release-readiness-audit.md`

This prompt must produce an executable staging/pre-cutover checklist that is specific enough to run without guesswork.

## Critical Working Rules

- Treat live repo code, tests, runbooks, and current-state docs as authoritative for present implementation truth.
- Use official Microsoft documentation where staging/deployment-slot, SPFx deployment, or API-approval behavior must be confirmed.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- This is a staging/pre-cutover validation prompt, not a broad implementation prompt.
- Do not assume the target environment already supports a recommended pattern unless that support is evidenced or explicitly marked as a manual verification step.

## Required Source Review

At minimum, reconcile the most relevant current sources among:

- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`

Use official Microsoft guidance where needed for:

- staging slot vs production deployment practice
- slot access / swap behavior
- SPFx app-catalog deployment and trust
- SharePoint API access approval

## You Must Explicitly Resolve

1. what the release-candidate deployment scope actually is
2. what environment assumptions must be true before staging validation starts
3. which config values must be validated before any smoke testing
4. which tenant/admin approvals must already be present before staging is meaningful
5. what exact workflow smoke path must be executed in staging
6. what evidence must be captured
7. which steps are pass/fail gates
8. which checks are:
   - repo-proven
   - manual validation
   - externally blocked
9. whether the staging path assumes deployment slots, and if so whether that is proven or merely recommended

## Required Deliverable

Create or update:

`docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`

## Required Checklist Structure

- Deployment Scope
- Environment Assumptions
- Config Validation Steps
- Backend Readiness Checks
- SPFx / Surface Readiness Checks
- Workflow Smoke Checks
  - submit
  - controller review
  - clarification
  - approve to `ReadyToProvision`
  - status visibility during provisioning
  - admin exception routing
- Manual External Dependency Checks
- Evidence to Capture
- Explicit Pass / Fail Criteria
- Exit Criteria to Proceed to Pilot or Cutover
- Blocking Conditions
- Exact Owners for Each Major Check

## Hard Requirements

- Replace generic “launch” wording with current workflow wording unless the source explicitly requires otherwise.
- If slot-based staging/swap is recommended but not evidenced in the target environment, state that explicitly.
- If SPFx API access approval or app-catalog trust is still external/manual, do not mark the environment staging-ready until that is handled or explicitly carved out with constraint language.

## Completion Standard

This prompt is complete only when the staging validation package is specific enough to execute, auditable enough to support a release decision, and honest about what still must be manually verified outside the repo.
