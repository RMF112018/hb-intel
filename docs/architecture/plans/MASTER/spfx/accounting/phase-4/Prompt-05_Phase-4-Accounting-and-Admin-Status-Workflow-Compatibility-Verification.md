# Prompt-05 — Phase 4 Accounting and Admin Status Workflow Compatibility Verification

## Objective

Verify and remediate, if needed, the compatibility of the hardened provisioning-status model with the Accounting and Admin workflow surfaces without creating boundary drift.

This prompt must respect the live repo distinction between:

- **Admin as a direct provisioning-status consumer**
- **Accounting as an indirect compatibility surface** that depends on request-state reconciliation and lifecycle-compatible messaging

## Working Rules

- Treat the live repo as the authority.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction, retrieve exact evidence, or inspect newly changed content.
- Prefer targeted, minimal edits unless broader restructuring is required by the prompt.
- Preserve package and app boundaries unless the prompt explicitly directs otherwise.
- Be explicit about repo fact vs inference vs unresolved issue.
- Do not silently change business semantics established in earlier phases. If you detect a contradiction, document it and resolve it deliberately.
- Do not turn Accounting into a recovery console.
- Do not turn Admin into a controller approval gate.

## Implementation Goals

Confirm that the hardened status model from Prompts 02 through 04 is consumed correctly by:

- the **Accounting controller workflow** through request-state compatibility and status-aligned messaging
- the **Admin recovery / oversight workflow** through direct provisioning-status reads and admin mutation paths

Ensure that:

- Accounting sees enough information to act safely in its role without directly owning recovery logic
- Admin sees enough information to recover and oversee without inventing parallel truth
- no new ownership drift or cross-app responsibility overlap is introduced
- surface text, badges, and transitions remain aligned with backend truth
- request-state reconciliation remains sufficient for Accounting lifecycle banners and controller messaging

## Required Work

- audit Accounting lifecycle messaging and banner compatibility against hardened provisioning truth
- audit Admin direct status usage, badges, actions, and mutation flows
- fix any mismatches caused by Phase 4 hardening
- keep the app boundary intact:
  - Accounting is not the recovery console
  - Admin is not the controller approval gate
- update docs if surface behavior changes materially

## Required Files and Areas

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- any additional docs affected by compatibility fixes

## Deliverables

1. Implement the required compatibility fixes, if any.
2. Update the relevant surface docs.
3. Write a verification report at:

`docs/architecture/reviews/phase-4-accounting-admin-status-compatibility-report.md`

## Verification

Provide evidence for:

- Accounting indirect compatibility
- Admin direct compatibility
- preserved app boundary
- consistent status truth across both surfaces
- status-compatible request-state messaging in Accounting
- no new recovery-action leakage into Accounting

## Additional Hard Requirement

Your report must explicitly separate:

- **Accounting indirect compatibility via request-state reconciliation**
- **Admin direct compatibility via durable provisioning-status reads and actions**

Do not blur these into one category.

## Completion Standard

This prompt is complete only when both surfaces are compatible with the adopted Phase 4 status model and their responsibilities remain cleanly separated.
