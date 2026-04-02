# Prompt-08 — Phase 10 Documentation and Connected-Service Posture Reconciliation

## Objective

Reconcile all production-sensitive documentation so that build-time injection, audience/resource names, approval steps, connected-service posture, and release/readiness guidance match the implemented repo truth after Prompts 02–07.

## Context

The audit found documentation drift, including mixed staging/production references and inconsistencies across package config, connected-service posture, and frontend/backend contract docs.

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

- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/developer/project-setup-frontend-api-contract.md`
- any Accounting-specific auth/build/release docs created in earlier prompts
- release checklists, readiness docs, and review docs touched by this work
- any current-state-map or related docs that should reflect the final production posture


## Tasks

1. Reconcile all staging vs production references that affect:
   - API resource names
   - audience URIs
   - package approval guidance
   - build-time environment injection
   - Function App configuration
2. Make sure the docs now clearly distinguish:
   - repo truth
   - packaged-artifact truth
   - manual prerequisites
   - tenant/admin approvals
   - external platform configuration
3. Add or update Accounting-specific docs where the repo previously relied too heavily on Project Setup docs to imply Accounting behavior.
4. Remove or annotate any outdated claims that could cause a future audit to falsely reopen already-closed gaps.
5. Ensure the final docs are internally consistent across code, package config, and release workflow.


## Deliverables

- reconciled production-sensitive docs
- explicit documentation of the final Accounting production posture
- correction notes where prior docs were stale or superseded


## Acceptance Criteria

- a deployment team can follow the docs without guessing which values, approvals, or services apply
- no critical staging/production ambiguity remains in the touched paths
- future audits will not reopen the same gaps because of stale documentation


## Output Format

Provide:
1. a documentation reconciliation summary
2. the exact files updated
3. the major stale claims corrected
4. any residual external prerequisites that remain outside the repo

