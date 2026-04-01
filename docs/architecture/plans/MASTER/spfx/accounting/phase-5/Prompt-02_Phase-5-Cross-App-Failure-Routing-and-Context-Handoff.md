# Prompt-02 — Phase 5 Cross-App Failure Routing and Context Handoff

## Objective

Implement and harden the failure and exception handoff from Accounting to Admin so exceptional cases arrive in the Admin surface with sufficient context for safe operator recovery work.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, bounded changes over broad refactors unless broader restructuring is explicitly required.
- Preserve the app boundary between Accounting and Admin.
- Be explicit about repo fact vs inference vs unresolved issue.
- Update documentation as part of the implementation rather than leaving it stale.

## Implementation goals

Using the Prompt-01 audit findings, ensure that:

- Accounting routes exception cases to the correct Admin destination
- required request, run, and status context survives the handoff
- deep links and query/context payloads are stable and intentional
- the handoff does not require Admin operators to reconstruct context manually
- operator messaging in Accounting clearly indicates the ownership change
- if multiple runs exist for a project, the route-in contract selects the intended run intentionally

## Required work

- review and harden cross-app routes / URLs / context payloads
- verify or improve request/run/status context transfer
- ensure failure and escalation entry points in Admin are deterministic
- explicitly decide whether `projectId` alone is sufficient or whether run-specific context is required
- update docs describing the handoff contract
- capture any remaining gaps that must be deferred explicitly

## Deliverables

1. Implement the required code changes.
2. Update docs as needed.
3. Write an implementation report at:

`docs/architecture/reviews/phase-5-cross-app-failure-routing-and-context-handoff-report.md`

## Verification

Provide concrete verification evidence for:
- Accounting route-out behavior
- Admin route-in behavior
- multi-run correctness of route resolution
- context preservation
- operator messaging reflecting the handoff
