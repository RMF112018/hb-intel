# Prompt-05 — Phase 5 Accounting/Admin Exception UX and Operational Verification

## Objective

Verify the Accounting and Admin operator experience for exceptional cases and harden any remaining messaging, action-visibility, or workflow issues without creating boundary drift.

Where adjacent Estimating exception messaging materially affects Admin ownership, verify and document that too.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, bounded changes over broad refactors unless broader restructuring is explicitly required.
- Preserve the app boundary between Accounting and Admin.
- Be explicit about repo fact vs inference vs unresolved issue.
- Update documentation as part of the implementation rather than leaving it stale.

## Implementation goals

Confirm that:

- Accounting communicates exception routing clearly
- Admin communicates recovery ownership clearly
- action visibility is correct by role and state
- operator messaging does not imply the wrong surface owns the next step
- the exception workflow is operationally understandable under real failure conditions
- adjacent Estimating exception messaging does not contradict Admin recovery ownership

## Required work

- audit Accounting exception messaging
- audit Admin exception messaging
- audit badges, banners, state text, and action visibility
- verify the wording around shared retry/escalation versus Admin-exclusive recovery
- fix any remaining UX issues needed for clear exception handling
- update relevant surface docs if behavior changes materially

## Deliverables

1. Implement the required compatibility and UX fixes, if any.
2. Update the relevant docs.
3. Write a verification report at:

`docs/architecture/reviews/phase-5-accounting-admin-exception-ux-verification-report.md`

## Verification

Provide evidence for:
- Accounting exception UX correctness
- Admin exception UX correctness
- preserved app boundary
- operational clarity for operators
- any adjacent requester/coordinator messaging that materially affects exception ownership
