# Prompt 03 — SPFx Surface Remediation (Estimating / Accounting / Admin)

```text
You are acting as a senior SPFx workflow-surface, user-command, review-flow, and release-readiness engineer for HB Intel.

## Objective

Using the validated findings from Prompt 01 and the backend fixes from Prompt 02, remediate any Monday-critical deficiencies in the SPFx Estimating, Accounting, and Admin surfaces that participate in the provisioning saga.

## Scope boundary

Only address surfaces directly involved in the saga:

- Estimating requester / request-detail saga entry and response flow
- Accounting controller queue / structured review / approval flow
- Admin oversight / recovery / retry / archive / force-state flow

Do not broaden into unrelated UI polish or broader domain work.

## Important instruction

Do not re-read files that are still within your current context or memory.
Reuse active context when available.
Only open additional files when needed to implement or verify a validated deficiency.

## Primary files likely in scope

- `apps/estimating/src/pages/NewRequestPage.tsx`
- `apps/estimating/src/pages/RequestDetailPage.tsx`
- related Estimating project-setup components and utilities as required
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- related Accounting utilities and tests as required
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- related Admin utilities and tests as required

## Required work

### 1. Align Estimating requester flows with corrected backend behavior
If validated:
- remove unsafe global request-list assumptions
- ensure clarification-return and requester record retrieval use the correct requester-scoped path
- ensure error, loading, and fallback states remain correct

### 2. Align Accounting controller review behavior with corrected data flow
If validated:
- ensure all necessary request fields are visible when they should be
- ensure approval flow correctly handles project-number capture and state advancement
- ensure clarification and hold flows remain correct
- ensure failed-request escalation to Admin remains correct

### 3. Align Admin oversight with corrected saga/runtime behavior
If validated:
- ensure queue filtering, details, retry, archive, escalation ack, and force-state actions remain correctly wired
- ensure the UI accurately reflects the corrected backend states and continuity paths

### 4. Keep changes constrained
Only change user-facing behavior when it is required to correct a validated Monday-critical defect.

## Validation requirements during implementation

After changes:
- run the relevant surface/component tests
- add or update focused UI tests for every validated defect you fixed
- verify all user commands involved in the saga still work:
  - new request
  - request detail / response visibility
  - clarification / revision flow
  - approval
  - hold
  - admin recovery actions

## Required deliverables

### 1. Code changes
Implement all validated Monday-critical SPFx surface fixes.

### 2. Focused surface tests
Add or update tests proving the corrected behavior.

### 3. Final report
Provide:
- files changed
- validated deficiencies fixed
- tests added / updated
- commands run
- pass / fail results
- any remaining Monday-critical UI risk

## Guardrails

- Do not introduce broad UI refactors.
- Do not change surface behavior that Prompt 01 did not validate as deficient.
- Preserve existing architecture and repo conventions.
- Keep the user-command flows explicit, testable, and low-risk.
```