# Phase 5 — Admin Exception-Path Integration

## Objective

Complete Phase 5 of the Accounting-side Project Setup production-readiness program by integrating the Admin exception path cleanly and intentionally into the live Project Setup workflow.

This phase focuses on the handoff into Admin for failed or exceptional cases and on the recovery responsibilities that truly belong in the Admin surface.

## Critical repo-truth nuance

Phase 5 must **not** assume that every exception action is already Admin-exclusive in the live repo.

Current repo truth still includes:

- Accounting controller routing to Admin for failed requests
- Estimating requester/coordinator bounded retry for some failures
- Estimating escalation into Admin for non-retryable or exhausted cases
- Admin-exclusive oversight, archival, escalation acknowledgment, and force-state controls
- backend routes whose authorization posture is broader than a simplistic “Admin-only for all exception actions” summary would suggest

This package is written to preserve that nuance.

## Intended phase outcome

At the end of this phase:

- Accounting routes failed or exceptional requests to Admin cleanly
- Admin receives enough context to recover or govern the exception path
- true Admin-exclusive recovery actions are clearly bounded and authorized
- shared retry/escalation behavior is explicitly classified instead of being hand-waved
- reopen / retry / escalation semantics are coherent across request lifecycle and provisioning status
- cross-app routing and operator messaging reinforce the correct ownership model
- active documentation reflects actual repo truth

## Deliverables in this package

- `Phase-5_Admin-Exception-Path-Integration_Implementation-Plan.md`
- `Prompt-01_Phase-5-Repo-Truth-Admin-Exception-Path-Audit.md`
- `Prompt-02_Phase-5-Cross-App-Failure-Routing-and-Context-Handoff.md`
- `Prompt-03_Phase-5-Admin-Recovery-Action-Boundary-and-Authorization-Hardening.md`
- `Prompt-04_Phase-5-Escalation-Ownership-and-Reopen-Lifecycle-Integration.md`
- `Prompt-05_Phase-5-Accounting-Admin-Exception-UX-and-Operational-Verification.md`
- `Prompt-06_Phase-5-Final-Documentation-Reconciliation-and-Readiness-Report.md`
- `Accounting_Phase5_Prompt_Audit_Report.md`

## Required execution order

Run the prompts in numeric order.

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip ahead. Later prompts assume the repo-truth findings and implementation outcomes from earlier prompts are already in place.

## Global instructions for the local code agent

- Treat the live repo as the implementation authority.
- Do not rely on stale planning language when the repo truth differs.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Preserve the app boundary:
  - Accounting = controller review / routing surface
  - Admin = oversight / archival / acknowledgment / override / recovery surface
- Do not move Admin recovery powers into Accounting.
- Do not move controller approval responsibility into Admin.
- Do not assume bounded retry or escalation are already Admin-exclusive unless repo evidence proves that for the specific action.
- Update documentation as part of the work.
- Record unresolved issues explicitly rather than silently working around them.

## Canonical repo-truth seams this phase must verify

At minimum, the live repo currently requires this phase to explicitly verify:

- Accounting route-out behavior from failed requests
- Admin route-in behavior through `?projectId=`
- whether `projectId` alone is sufficient context when multiple provisioning runs exist
- which recovery actions are truly Admin-exclusive
- which exception actions are shared with Estimating/requester flows
- whether Admin-side mutations keep request lifecycle and provisioning status aligned
- whether operator messaging across surfaces reinforces the right ownership model

## Suggested report location

Unless a prompt specifies a more focused file, write reports to:

`docs/architecture/reviews/`

## Completion rule

Phase 5 is complete only when:

- the Accounting-to-Admin exception path is coherent
- true Admin recovery actions are bounded and authorized correctly
- shared retry/escalation behavior is explicitly classified rather than misdescribed
- context handoff between apps is sufficient for safe recovery work
- request lifecycle and provisioning status do not drift silently during recovery handling
- operator messaging reflects correct ownership
- docs reflect repo truth
