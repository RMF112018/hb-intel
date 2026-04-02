# Prompt-03 — Phase 11 Accounting Protected API Permission Contract Reconciliation

## Objective

Resolve the contradiction between the audited Accounting `.sppkg` permission posture and current repo truth by determining whether Accounting is, in the intended product state, a protected Project Setup API caller.

The key question is whether Accounting should formally request:

- `hb-intel-api-production`
- `access_as_user`

If yes, repo truth must be updated to reflect that consistently across package config, auth docs, and release/readiness materials.

If no, the Accounting frontend/runtime path must be corrected so the shipped artifact no longer implies or requires that permission.

## Critical Working Rules

- Treat this as a contract-reconciliation prompt, not a speculative design exercise.
- Use current code paths, current backend route usage, and current auth docs as evidence.
- Do not re-read files already in current context or memory unless needed to verify contradiction, capture exact evidence, or confirm the final posture.
- Where SharePoint API access approval semantics or SPFx AAD-secured API behavior matter, use official Microsoft documentation.
- Do not leave the result ambiguous.

## Required Scope

Inspect at minimum:

### Accounting code paths
- queue/detail/review surfaces in `apps/accounting/src/**`
- any API client or provisioning-related hooks/stores used by Accounting
- any token provider or auth bridge used in the Accounting SharePoint-hosted path

### Backend/auth/reference docs
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- any connected service posture docs
- release/readiness docs that classify Accounting’s role
- `apps/accounting/config/package-solution.json`
- the latest fresh Accounting `.sppkg` or artifact evidence if already rebuilt during this phase

### Microsoft guidance
- SPFx API permission request / API access approval behavior
- AAD-secured API calling patterns from SPFx

## Questions You Must Answer

1. Does Accounting currently call protected backend routes in the intended release posture?
2. If yes, is that behavior intentional and product-correct?
3. Should Accounting officially declare `webApiPermissionRequests` in repo truth?
4. If yes, which docs were wrong or stale?
5. If no, which code path or packaged behavior is incorrect and must be removed or replaced?

## Required Outputs

### 1. Create a contract memo at:
`docs/architecture/reviews/accounting-protected-api-permission-contract-reconciliation.md`

The memo must include:
- Executive Summary
- Current Code Evidence
- Current Package Evidence
- Current Repo-Doc Position
- Microsoft Guidance Summary
- Final Contract Decision
- Required Repo Changes
- Exact Files Inspected

### 2. Update whichever of the following are required by the final decision:
- `apps/accounting/config/package-solution.json`
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- any release/readiness docs that describe Accounting’s protected API posture
- phase-local Phase 11 reference docs

### 3. Create or update a short matrix at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/03-Accounting-API-Permission-Decision-Matrix.md`

## Hard Requirements

- Do not leave “maybe” language in the final contract.
- Distinguish clearly between:
  - current code fact
  - current packaged artifact fact
  - intended product posture
  - required SharePoint admin approval consequence
- If Accounting is confirmed as a protected API caller, say so directly and propagate the change cleanly.
- If Accounting is not intended to be a protected API caller, identify the exact path that must be removed or refactored.

## Completion Standard

This prompt is complete only when the Accounting package’s permission posture can be traced cleanly from code → package config → auth docs → admin approval expectations.
