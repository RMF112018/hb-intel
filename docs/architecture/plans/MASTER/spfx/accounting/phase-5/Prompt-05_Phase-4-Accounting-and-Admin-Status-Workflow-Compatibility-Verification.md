# Prompt-05 — Phase 4 Accounting and Admin Status Workflow Compatibility Verification

## Objective

Verify and remediate, if needed, the compatibility of the hardened provisioning status model with the Accounting and Admin workflow surfaces without creating boundary drift.

## Working rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.


## Implementation goals

Confirm that the hardened status model from Prompts 02 through 04 is consumed correctly by:

- the Accounting controller workflow
- the Admin recovery / oversight workflow

Ensure that:
- Accounting sees enough information to act safely in its role
- Admin sees enough information to recover and oversee without inventing parallel truth
- no new ownership drift or cross-app responsibility overlap is introduced
- surface text, badges, and transitions remain aligned with backend truth

## Required work

- audit Accounting status usage
- audit Admin status usage
- fix any mismatches caused by Phase 4 hardening
- keep the app boundary intact:
  - Accounting is not the recovery console
  - Admin is not the controller approval gate
- update docs if surface behavior changes materially

## Deliverables

1. Implement the required compatibility fixes, if any.
2. Update the relevant surface docs.
3. Write a verification report at:

`docs/architecture/reviews/phase-4-accounting-admin-status-compatibility-report.md`

## Verification

Provide evidence for:
- Accounting compatibility
- Admin compatibility
- preserved app boundary
- consistent status truth across both surfaces
