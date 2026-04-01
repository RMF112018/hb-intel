# Prompt-04 — Phase 5 Escalation Ownership and Reopen Lifecycle Integration

## Objective

Make escalation, reopen, retry, and related exception transitions coherent across request lifecycle, provisioning status, and operator ownership.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, bounded changes over broad refactors unless broader restructuring is explicitly required.
- Preserve the app boundary between Accounting and Admin.
- Be explicit about repo fact vs inference vs unresolved issue.
- Update documentation as part of the implementation rather than leaving it stale.

## Implementation goals

Using the earlier Phase 5 findings, ensure that:

- escalation ownership is explicit
- reopen behavior is intentional and bounded
- retry behavior does not create contradictory request or status state
- request lifecycle and provisioning status remain aligned during exception handling
- Admin-side status mutations do not silently leave request state stale
- operator surfaces do not imply conflicting ownership over recovery decisions

## Required work

- review escalation markers and state semantics
- review reopen / retry transitions and side effects
- review request-state reconciliation after:
  - retry
  - archive
  - escalation acknowledgment
  - force-state override
- align request lifecycle and provisioning status behavior where needed
- update docs and runbook material accordingly
- call out any intentionally deferred recovery complexity

## Deliverables

1. Implement the required code and doc changes.
2. Write an implementation report at:

`docs/architecture/reviews/phase-5-escalation-ownership-and-reopen-lifecycle-report.md`

## Verification

Provide evidence for:
- escalation behavior
- reopen behavior
- retry behavior
- request/status consistency after each
- any intentionally preserved ambiguity
