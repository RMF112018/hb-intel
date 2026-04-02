# Prompt-04 — Phase 10 SPFx Package Permissions and Approval Path Alignment

## Objective

Align the Accounting package’s SharePoint API permission declaration and approval posture with the final supported production auth model so that deployment and admin approval steps are explicit, accurate, and consistent.

## Context

The audit identified a material mismatch between the comparison Project Setup package, which declares `webApiPermissionRequests`, and the current Accounting package, which does not yet evidence the same approval posture.

## Working Rules

- Treat the live repo as the source of truth.
- Do not re-read files that are already in your active context or memory unless you need to verify a contradiction, confirm exact wording, or inspect a file you have not yet opened.
- Do not rely on stale phase documents when repo truth disagrees.
- Do not make assumptions about production readiness that are not evidenced in code, build artifacts, tests, or docs.
- Keep changes narrowly scoped to the objective of this prompt unless a directly dependent correction is required.
- When you change behavior, also update the governing docs and validation evidence that define or prove that behavior.
- Prefer additive, explicit, and test-backed changes over hidden fallbacks.
- If you discover that a requested change is already fully implemented in repo truth, do not re-implement it. Instead, document the repo truth, close the gap in the affected docs, and continue to the next unresolved item.

## Required Repo Focus

- `apps/accounting/config/package-solution.json`
- `apps/estimating/config/package-solution.json`
- SharePoint/SPFx deployment and approval docs in `docs/`
- any release checklists or connected-service docs that mention API approval


## Tasks

1. Decide whether Accounting must declare `webApiPermissionRequests` for its supported production behavior.
2. If yes:
   - add the correct `resource` and `scope`
   - make sure the declared resource name matches the final audience/app-registration contract
   - update packaging/build docs accordingly
3. If no:
   - document exactly why no SharePoint API approval declaration is needed
   - prove that the Accounting production path does not rely on that approval
4. Reconcile Accounting and Project Setup docs so they no longer conflict or leave room for deployment confusion.
5. Update release/readiness docs to clearly separate:
   - package-declared approvals
   - Entra app-registration requirements
   - Function App config requirements
   - tenant/admin actions outside the repo
6. If a fresh package rebuild is needed after changing `package-solution.json`, perform it and record the new package evidence.


## Deliverables

- corrected Accounting package permission declaration or explicit documented rationale for omission
- updated deployment/approval docs
- rebuilt package evidence if config changed


## Acceptance Criteria

- the Accounting approval path is explicit and internally consistent
- package config, auth docs, and deployment docs no longer disagree
- a deployment/admin team could follow the docs without guessing which approvals are required


## Output Format

Provide:
1. the final decision on `webApiPermissionRequests`
2. the exact package config changes made, if any
3. the exact docs updated
4. any rebuilt package evidence

