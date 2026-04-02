# Prompt-05 — Phase 11 Hidden Hosted Dependency Reconciliation and Complexity Path Cleanup

## Objective

Resolve the under-specified hosted-runtime dependency chain associated with:

- `/api/users/me/preferences`
- `/api/users/me/groups`

and any related Complexity/auth/session path that may still be present in the Accounting SharePoint-hosted artifact.

The goal is to determine whether these dependencies are:
- intentional and required,
- accidental carryover,
- development-only assumptions,
- or stale code paths that should be removed or bypassed in the hosted Accounting production path.

## Critical Working Rules

- This is a dependency-reconciliation and cleanup prompt, not a general auth rewrite.
- Use current Accounting code paths and the current hosted release posture as the source of truth.
- Do not re-read files already in current context or memory unless needed to verify contradiction or capture exact evidence.
- If a dependency is legitimate, document/provision it; do not silently leave it implicit.
- If a dependency is illegitimate, remove or isolate it cleanly.

## Required Scope

Inspect at minimum:
- `apps/accounting/src/App.tsx`
- any Accounting route/provider stack using `ComplexityProvider`
- any preferences/groups fetch helpers or implicit session/profile loaders
- relevant shared packages under:
  - `packages/complexity`
  - `packages/auth`
  - `packages/shell`
- any backend route docs that would explain `/api/users/me/*`
- prior gap-validation docs concerning latent `/api/users/me/*` dependencies, if still present

## Questions You Must Answer

1. Why does the Accounting hosted path still include `/api/users/me/preferences` and `/api/users/me/groups`, if it does?
2. Are those calls required in the intended production path?
3. If required, which backend/host surface owns them?
4. If not required, what is the cleanest way to remove or bypass them for hosted Accounting?
5. Is `ComplexityProvider` or related session/profile logic introducing unnecessary same-origin assumptions in SharePoint-hosted production?

## Required Outputs

### 1. Create a dependency memo at:
`docs/architecture/reviews/accounting-hidden-hosted-dependency-reconciliation.md`

The memo must include:
- Executive Summary
- Dependency Inventory
- Current Purpose of Each Dependency
- Hosted Accounting Impact
- Final Decision per Dependency
- Code Changes Made
- Documentation Changes Made
- Exact Files Inspected

### 2. Create or update a phase-local decision file at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/05-Hosted-Dependency-Decision-Log.md`

### 3. Implement whichever of the following the evidence supports:
- remove stale dependencies
- replace them with valid hosted alternatives
- or document/provision them explicitly if they are part of the intended production contract

### 4. Add or update targeted tests if the hosted dependency cleanup changes runtime behavior.

## Hard Requirements

- Do not leave undocumented same-origin dependencies in the final hosted Accounting path.
- State explicitly whether `/api/users/me/preferences` and `/api/users/me/groups` remain part of the intended release posture after this prompt.
- If they remain, identify their owner and provisioning requirements.

## Completion Standard

This prompt is complete only when the hosted Accounting runtime no longer contains unexplained or under-documented same-origin user-profile dependencies.
