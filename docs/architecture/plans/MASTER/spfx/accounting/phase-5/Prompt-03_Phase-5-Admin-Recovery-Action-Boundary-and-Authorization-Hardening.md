# Prompt-03 — Phase 5 Admin Recovery Action Boundary and Authorization Hardening

## Objective

Harden the Admin recovery surface so true Admin-exclusive recovery, override, and oversight actions are clearly bounded to Admin and correctly authorized.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, bounded changes over broad refactors unless broader restructuring is explicitly required.
- Preserve the app boundary between Accounting and Admin.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not assume every exception action is Admin-exclusive without repo proof.
- Update documentation as part of the implementation rather than leaving it stale.

## Implementation goals

Using the Phase 5 audit and handoff findings, ensure that:

- true Admin-exclusive recovery actions are explicitly limited to Admin
- the backend authorization model matches the intended operator boundary
- Accounting cannot reach or simulate Admin-only recovery actions
- Admin recovery actions are individually coherent and documented
- shared retry/escalation behavior is explicitly classified instead of mislabeled
- any missing authorization checks or weak assumptions are corrected

## Required work

- inventory Admin-visible exception actions
- inventory Admin-exclusive backend routes
- inventory shared backend routes used by non-Admin surfaces
- review backend authorization checks for recovery / override actions
- harden missing or weak authorization boundaries
- remove or correct any surface ambiguity about who owns which action
- update docs to reflect the final Admin recovery boundary

## Hard requirement

Explicitly separate the following categories in your report:

1. Admin-exclusive UI actions
2. Admin-exclusive backend actions
3. shared exception actions
4. backend routes whose authorization posture is broader than the Admin UI language suggests

## Deliverables

1. Implement the required code and documentation changes.
2. Write an implementation report at:

`docs/architecture/reviews/phase-5-admin-recovery-boundary-and-authorization-report.md`

## Verification

Provide evidence for:
- Admin-only action inventory
- shared action inventory
- route and backend authorization correctness
- preserved separation from Accounting
- any residual risks
