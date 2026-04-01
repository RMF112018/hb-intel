# Prompt-02 — Phase 9: Staging Deployment and Pre-Cutover Validation

## Objective

Create or harden the staging deployment and pre-cutover validation package for the Accounting app and connected Project Setup workflow.

## Instructions

You are working inside the live repository.

Use the Phase 9 release-readiness audit as the baseline. Do not re-read files that are still within your current context or memory.

Audit existing staging or deployment validation materials and then create or update the authoritative staging/pre-cutover validation artifacts.

## Focus areas

- release candidate deployment sequence
- environment-specific configuration verification
- SPFx package / backend / connected-service alignment checks
- pre-cutover smoke checks
- expected manual validation steps
- evidence capture requirements
- explicit pass / fail criteria

## Deliverables

Create or update:
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`

The checklist must include:
1. Deployment scope
2. Environment assumptions
3. Config validation steps
4. Backend readiness checks
5. SPFx / surface readiness checks
6. Workflow smoke checks
   - submit
   - controller review
   - clarification
   - launch
   - status visibility
   - admin exception routing
7. Manual external dependency checks
8. Evidence to capture
9. Exit criteria to proceed to pilot or cutover

## Acceptance criteria

- Staging validation is specific enough to execute without ambiguity.
- Checks are grouped in logical execution order.
- Each check has a pass/fail outcome.
- Preconditions and blockers are made explicit.
