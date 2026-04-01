# Prompt-06 — Phase 2 Final Documentation Reconciliation And Readiness Report

## Objective

Close Phase 2 by reconciling authoritative docs with repo truth and issuing a final readiness report that states exactly what has been completed, what remains for Phase 3, and what external production dependencies still exist.

## Preconditions

- Prompt-01 through Prompt-05 are complete
- all intended Phase 2 implementation work is finished

## Working Rules

- Final documentation must reflect repo truth.
- Apply strict doc precedence:
  1. live repo code and tests
  2. `current-state-map.md`
  3. current living refs and runbooks
  4. PH6 and older MVP docs as historical evidence only
- Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
- Be explicit about anything unresolved.
- Do not bury external dependencies or partial implementations.

## Required Documentation Targets

Reconcile and update as needed:

```text
docs/architecture/reviews/project-setup-accounting-phase-2-backend-lifecycle-hardening-report.md
docs/architecture/blueprint/current-state-map.md
docs/reference/spfx-surfaces/controller-review-surface.md
docs/reference/provisioning/state-machine.md
docs/reference/provisioning/saga-steps.md
docs/maintenance/provisioning-runbook.md
docs/reference/developer/project-setup-connected-service-posture.md
```

Treat these as likely historical or partially stale comparison sources to classify, not default authority:

```text
docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md
docs/architecture/plans/PH6.11-Accounting-App.md
docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T03-Controller-Gate-and-Request-Orchestration.md
docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T05-Provisioning-Orchestrator-and-Status.md
```

If some docs should not be changed because they are historical or superseded, document that decision in the final report instead of silently leaving contradictions unaddressed.

## Required Final Report Structure

Ensure the review report contains, at minimum:

- Executive Summary
- Phase 2 Scope Completed
- Final Frozen Backend Contract
- Implemented Validation / Idempotency Controls
- Request / Run / Status Model
- Accounting Compatibility Result
- Required Phase 3 Follow-Up Work
- Production External Dependencies
- Explicit Unresolved Questions
- Final Go / No-Go Recommendation For Advancing To Phase 3
- Documentation Classification Notes

## Required Closure Behavior

For every major issue originally identified in Prompt-01, mark it as one of:

- Resolved
- Partially Resolved
- Deferred to Phase 3
- External Dependency
- No Longer Applicable

Each item must have a short closure statement with repo evidence.

Also classify major docs touched by this phase as:

- current authority
- historical evidence
- partially stale
- superseded in this context

## Verification

Run a final pass of the most relevant valid commands:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/provisioning check-types
pnpm --filter @hbc/functions test || true
pnpm --filter @hbc/spfx-accounting build
pnpm --filter @hbc/spfx-accounting lint
pnpm --filter @hbc/spfx-accounting test || true
```

Capture outcomes in the final report.

## Acceptance Criteria

- the repo has a final Phase 2 evidence package
- the backend lifecycle contract is documented consistently enough to support Phase 3
- required frontend follow-up is clearly separated from completed backend work
- production blockers are explicitly identified instead of implied
- historical PH6 and older MVP docs are not silently treated as current authority
