# Prompt-01 — Phase 8: Repo-Truth Reliability, Testing, and Operational Readiness Audit

## Objective

Conduct a comprehensive repo-truth audit of the current verification, reliability, and operational-readiness state for the Project Setup workflow spanning requester submission, Accounting controller review, provisioning runtime behavior, and Admin exception handling.

## Required working approach

1. Audit the live repo with emphasis on:
   - existing tests in `apps/estimating`, `apps/accounting`, `apps/admin`, `apps/pwa`, `packages/provisioning`, and `backend/functions`
   - provisioning lifecycle tests, status/runtime tests, and exception-path tests
   - runbooks, maintenance docs, observability docs, and readiness checklists
   - any recent review reports or verification matrices tied to provisioning / Project Setup

2. Identify:
   - what verification already exists and is passing
   - what verification is partial, deferred, or missing
   - what degraded/failure paths are covered vs uncovered
   - what operational documentation exists and whether it matches repo truth

3. Produce an audit report saved to:
   - `docs/architecture/reviews/project-setup-phase-8-reliability-testing-and-operational-readiness-audit.md`

## Required report structure

- Executive summary
- Confirmed repo implementation facts
- Existing verification inventory by surface and backend area
- Existing degraded-path / failure-mode coverage
- Existing operational-readiness documentation inventory
- High-risk gaps and missing evidence
- Recommended correction priorities
- Explicit unresolved questions

## Rules

- Treat the live repo as authoritative implementation truth.
- Do not propose broad remediation beyond clearly labeled recommended priorities.
- Use direct repo evidence throughout.
