# Prompt-04 — Phase 9 Production Cutover and Rollback Preparation

## Objective

Produce the practical production cutover and rollback package for the Accounting app and connected Project Setup / provisioning workflow.

Use the outputs from:

- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`
- `docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md`

This prompt must result in a **step-ordered, evidence-bound, usable** release-day procedure.

## Critical Working Rules

- Treat live repo truth as authoritative for what is implemented.
- Use official Microsoft documentation where deployment-slot, swap, or app-catalog deployment behavior must be confirmed.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Do not assume a rollback method unless you can classify it as:
  - repo-proven
  - environment-proven outside repo
  - recommended but not yet evidenced
- Do not produce a generic cutover plan detached from the current host boundary, workflow contract, and support posture.

## Required Source Review

At minimum, reconcile:

- the Phase 9 release-readiness audit
- the staging/pre-cutover checklist
- the pilot plan
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

Use official Microsoft guidance where necessary for:

- Azure Functions deployment slots and swap / rollback posture
- SharePoint app-catalog deployment / trust
- SharePoint API access approval dependencies

## You Must Explicitly Resolve

1. the exact cutover sequence
2. the go / no-go gate
3. the validation checkpoints during cutover
4. the immediate rollback triggers
5. the rollback strategy actually in play:
   - slot swap
   - artifact rollback
   - .sppkg rollback / package restore / package disable
   - config rollback
   - combined rollback
6. the owner matrix
7. the communication steps
8. the exact evidence to capture during cutover
9. any steps that are still conditional because they depend on environment capabilities not proven by the repo

## Required Deliverable

Create or update:

`docs/architecture/release/phase-9-production-cutover-and-rollback-checklist.md`

## Required Checklist Structure

- Pre-Cutover Prerequisites
- Go / No-Go Gate
- Cutover Sequence
- Validation Checkpoints During Cutover
- Immediate Rollback Triggers
- Rollback Strategy Selection and Assumptions
- Rollback Steps
- Communication Steps
- Owner Matrix
- Final Cutover Completion Criteria
- Constraints and Conditional Paths

## Hard Requirements

- Do not hand-wave rollback.
- If slot-based rollback is only recommended and not yet evidenced in the target environment, say so plainly and define the fallback rollback method.
- Keep the SPFx and backend release steps explicit and separate where needed.
- Preserve current workflow semantics in validation checkpoints.

## Completion Standard

This prompt is complete only when the repo contains a cutover/rollback package that a release lead or technical owner could use on release day without hidden assumptions.
