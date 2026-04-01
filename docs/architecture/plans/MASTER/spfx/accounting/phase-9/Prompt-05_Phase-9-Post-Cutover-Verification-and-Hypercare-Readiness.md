# Prompt-05 — Phase 9 Post-Cutover Verification and Hypercare Readiness

## Objective

Create the post-cutover verification and hypercare readiness package so the release can be supported immediately after production cutover.

Use the outputs from:

- the release-readiness audit
- the staging/pre-cutover checklist
- the pilot plan
- the cutover/rollback checklist

This prompt must align post-cutover expectations to actual repo-truth supportability and observability material.

## Critical Working Rules

- Treat live repo truth as authoritative for what is implemented and documented.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Start from the existing runbooks and observability docs, not from a blank slate.
- Distinguish clearly between immediate production verification, hypercare operations, and normal steady-state operations.

## Required Source Review

At minimum, reconcile:

- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `docs/reference/provisioning/verification-matrix.md`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/admin/src/test/alertPollingService.test.ts`
- the Phase 9 audit, staging, pilot, and cutover outputs

## You Must Explicitly Define

1. immediate production verification checks
2. production workflow checks by role/surface
3. monitoring / telemetry checks
4. incident / defect severity model
5. hypercare roles and time window
6. escalation paths
7. daily stabilization review expectations
8. exit criteria from hypercare
9. what is repo-proven versus what still depends on live-environment validation after cutover

## Required Deliverable

Create or update:

`docs/architecture/release/phase-9-post-cutover-verification-and-hypercare-plan.md`

## Required Plan Structure

- Immediate Verification Checks After Cutover
- Production Workflow Checks
- Monitoring / Telemetry Checks
- Incident / Defect Severity Model
- Hypercare Roles and Time Window
- Escalation Paths
- Daily Stabilization Review Expectations
- Exit Criteria from Hypercare
- Constraints / Blind Spots / Manual Verification Areas

## Hard Requirements

- Make immediate verification checks concrete and role-aware.
- Tie monitoring and support steps directly to the existing runbooks where applicable.
- Distinguish between:
  - repo-proven support behavior
  - manual production validation
  - environment/tooling dependencies not controlled by the repo
- Do not pretend hypercare is steady-state operations.

## Completion Standard

This prompt is complete only when the repo contains a post-cutover/hypercare plan that support and release owners could use immediately after production go-live.
