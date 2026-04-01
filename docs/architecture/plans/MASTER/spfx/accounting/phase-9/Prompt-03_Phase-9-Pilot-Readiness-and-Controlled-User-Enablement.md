# Prompt-03 — Phase 9 Pilot Readiness and Controlled User Enablement

## Objective

Create the controlled pilot plan for releasing the Accounting app workflow to a limited production-like audience before any broad cutover.

Use the outputs from:

- `docs/architecture/reviews/phase-9-release-readiness-audit.md`
- `docs/architecture/release/phase-9-staging-deployment-and-pre-cutover-validation-checklist.md`

This prompt is for **controlled enablement, observation, and decision support**, not broad release.

## Critical Working Rules

- Treat live repo truth as authoritative for what the system currently does.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Use the current runbooks, verification evidence, and external dependency register as the baseline.
- Do not define pilot scope so broadly that it becomes indistinguishable from production rollout.
- Do not imply pilot readiness if staging exit criteria are not satisfied.

## Required Source Review

At minimum, compare and reconcile:

- the Phase 9 release-readiness audit
- the staging/pre-cutover validation checklist
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- current workflow verification tests relevant to pilot smoke confidence
- any current support/owner docs or runbook ownership references in the repo

## You Must Explicitly Define

1. pilot objective
2. pilot scope
3. in-scope users and surfaces
4. prerequisites that must be true before the pilot starts
5. enablement sequence
6. success criteria
7. failure / pause / rollback thresholds
8. support ownership during the pilot
9. issue triage model
10. evidence required for the pilot-complete decision
11. whether the pilot is:
   - ready now
   - ready once named manual prerequisites complete
   - blocked

## Required Deliverable

Create or update:

`docs/architecture/release/phase-9-pilot-readiness-and-controlled-user-enablement.md`

## Required Document Structure

- Pilot Objective
- In-Scope Users and Surfaces
- Prerequisites Before Pilot Start
- Pilot Execution Sequence
- Success Criteria
- Failure / Pause / Rollback Thresholds
- Support Model and Owner Matrix
- Issue Triage Model
- Evidence to Capture During Pilot
- Pilot Completion Decision Framework
- Constraints That Prevent Broader Release

## Hard Requirements

- Keep the pilot audience explicitly bounded.
- Make success/failure criteria measurable.
- Tie pilot go/no-go to the staging checklist and external dependency register.
- Distinguish between:
  - ready for limited pilot
  - ready for broader production cutover
- Do not overstate what a pilot proves if tenant/platform prerequisites remain partly manual.

## Completion Standard

This prompt is complete only when the repo contains an executable, bounded pilot plan that a release lead could actually run without relying on tribal knowledge.
