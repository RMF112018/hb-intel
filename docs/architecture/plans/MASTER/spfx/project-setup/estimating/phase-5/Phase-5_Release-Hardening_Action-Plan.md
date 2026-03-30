# Phase 5 — Release Hardening Action Plan

## Objective

Bring the Estimating / Project Setup package onto a **decision-ready production release posture** by converting the work from Phases 1–4 into objective release evidence: integration and regression coverage, operator-facing diagnostics, deployment rehearsal, rollback/recovery readiness, and final signoff / handoff assets.

This phase is not intended to reopen broad scope, auth, schema, or infrastructure redesign unless a narrowly scoped corrective change is required to close a release blocker discovered during final hardening.

## In scope

- Release-hardening baseline and remaining-launch-blocker inventory
- Integration, regression, and end-to-end validation for retained Project Setup scope
- Production-mode vs UI-review-mode validation where both are intentionally supported
- Operator-facing diagnostics and release gates
- Deployment rehearsal, smoke checks, rollback, and recovery procedures
- Final production-readiness checklist, signoff package, and support handoff notes
- Consolidation of known risks, explicit prerequisites, and release decision inputs

## Out of scope unless strictly required to enable Phase 5

- Broad UX redesign
- Broad field-schema redesign beyond Phase 2 outputs
- Broad auth/token architecture redesign beyond Phase 3 outputs
- Broad infrastructure redesign beyond Phase 4 outputs
- New feature development unrelated to retained Project Setup launch scope
- Non-Project-Setup platform release work

## Known starting facts for Phase 5

- Phase 1 should have isolated the deployable Project Setup scope.
- Phase 2 should have corrected the production `Projects` list data contract.
- Phase 3 should have established the production auth/token model.
- Phase 4 should have hardened startup, connected services, CORS, storage, identity, and observability.
- Production launch is still unsafe unless those changes are converted into verifiable test coverage, deployment checks, and operator-usable documentation.

## Phase 5 success criteria

Phase 5 is complete only when all of the following are true:

1. The retained Project Setup frontend/backend surface is covered by meaningful integration and regression checks.
2. Production mode and UI-review mode behavior are both explicit, testable, and safe.
3. Operators can determine whether release posture is **go**, **no-go**, or **degraded** using documented checks.
4. Deployment, validation, rollback, and recovery procedures are documented and rehearsable.
5. Final signoff artifacts exist for leadership / IT / support review.
6. The repo contains authoritative release-readiness and handoff documentation for Project Setup deployment.

## Workstream A — Repo truth and release-hardening baseline

### Tasks
- Inventory current release evidence, including:
  - tests
  - smoke checks
  - readiness checklists
  - diagnostics
  - deployment notes
  - rollback notes
  - handoff docs
- Inventory remaining open blockers from Phases 1–4.
- Produce a release-hardening matrix covering:
  - area
  - current evidence
  - missing evidence
  - blocker severity
  - release impact
  - owner / follow-up needed
- Confirm the exact retained launch surface for Project Setup.

### Deliverables
- Release-hardening baseline matrix
- Remaining blocker inventory
- Canonical retained launch-surface summary

### Acceptance criteria
- There is one authoritative baseline describing what release evidence exists and what is still missing.
- The team can identify launch blockers without re-auditing the repo from scratch.

## Workstream B — Integration, regression, and end-to-end coverage

### Tasks
- Add or tighten tests for the retained Project Setup surface, including at minimum:
  - package boot in UI-review mode
  - package boot in production mode
  - authenticated API call path
  - project request create/list/update-state lifecycle
  - production `Projects` list mapping assumptions
  - provisioning-status behavior if retained
  - failure behavior for missing config / denied permission / backend unavailability
- Convert critical launch assumptions into executable tests wherever practical.
- Add regression guards so removed/orphaned routes or unsupported shell dependencies do not quietly return.
- Ensure tests clearly separate supported retained scope from intentionally unsupported features.

### Deliverables
- Integration/regression test additions
- End-to-end or smoke-validation scripts where practical
- Unsupported-surface regression guards

### Acceptance criteria
- Retained launch assumptions are test-backed.
- Unsupported or orphaned scope cannot quietly re-enter the package without detection.

## Workstream C — Operational diagnostics and release gates

### Tasks
- Add or tighten operator-facing diagnostics for:
  - runtime mode
  - startup/config failures
  - auth/token failures
  - SharePoint field-contract failures
  - connected-service failures
  - degraded backend availability
- Define explicit go/no-go gates for release.
- Add pre-release and post-deploy smoke checks with clear pass/fail outputs.
- Ensure diagnostics are understandable to a novice IT technician, not just developers.

### Deliverables
- Release gate checklist
- Operator diagnostic guide
- Smoke-check definitions / scripts

### Acceptance criteria
- Release posture can be evaluated objectively.
- Operator diagnostics point to actionable next steps instead of generic failure messages.

## Workstream D — Deployment rehearsal, rollback, and recovery

### Tasks
- Document the intended deployment sequence for:
  - backend
  - connected-service prerequisites
  - SPFx package deployment / update
  - API permission approval validation
  - post-deploy smoke verification
- Create rollback procedures for the most likely failure scenarios.
- Define degraded-mode and recovery guidance for retained runtime dependencies.
- Ensure the deployment can be rehearsed safely in a staging or controlled validation path.

### Deliverables
- Deployment runbook
- Rollback runbook
- Recovery / degraded-mode notes

### Acceptance criteria
- A release can be executed and reversed with a documented sequence.
- The team is not dependent on tribal knowledge to recover from a failed deployment.

## Workstream E — Production-readiness signoff and handoff

### Tasks
- Build final signoff-ready artifacts, including:
  - production-readiness summary
  - open-risk summary
  - deployment prerequisites
  - release gates
  - rollback summary
  - support / ownership notes
- Produce a final list of unresolved items that are acceptable for launch vs blockers that are not.
- Consolidate repo documentation so support and IT teams have one authoritative handoff package.

### Deliverables
- Production-readiness signoff markdown
- Open-risk / accepted-risk summary
- Support handoff notes

### Acceptance criteria
- Leadership / IT / support have a coherent decision-ready package.
- Launch blockers and accepted risks are explicitly separated.

## Recommended execution sequence

1. Prompt 01 — Repo truth and release-hardening baseline
2. Prompt 02 — Integration, regression, and end-to-end coverage
3. Prompt 03 — Operational diagnostics and release gates
4. Prompt 04 — Deployment rehearsal, rollback, and recovery
5. Prompt 05 — Production-readiness signoff and handoff assets
6. Prompt 06 — Final verification and handoff

## Non-negotiable constraints

- Do not re-read files already in current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not let this phase drift into broad redesign work unless a narrowly scoped release blocker requires it.
- Do not accept “works on my machine” or ad hoc manual checks as sufficient release evidence.
- Do not leave release decisions dependent on tribal knowledge.
- Do not label the package production-ready without objective evidence, explicit gates, and rollback procedures.

## Phase 5 exit artifacts

At the end of Phase 5, the repo should contain:

- authoritative release-hardening baseline documentation
- retained-scope integration / regression / smoke validation assets
- operator-facing diagnostics and release gate documentation
- deployment, rollback, and recovery runbooks
- production-readiness signoff / accepted-risk documentation
- final verification notes and immediate post-phase recommendations
