# Prompt-01 — Phase 10 Repo-Truth Baseline and Scope Freeze

## Objective

Establish the exact current repo truth for the Accounting SPFx production-gap-closure work so that all later Phase 10 prompts operate against a locked, evidence-based baseline rather than stale assumptions.

## Context

The prior audit found that the Accounting package identity and version aligned with repo truth, but production wiring, auth/approval posture, UX continuity, and documentation drift still needed closure. Before implementing changes, confirm the exact current state in the repo and identify which findings remain unresolved versus already closed.

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

- `apps/accounting/`
- `apps/estimating/`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/`
- `backend/functions/src/hosts/project-setup/`
- `backend/functions/src/middleware/`
- `packages/provisioning/`
- `packages/complexity/`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/developer/project-setup-frontend-api-contract.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- any existing Accounting-specific review, release, readiness, or remediation docs


## Tasks

1. Re-audit the current repo truth for the Accounting SPFx surface and its shared shell/runtime path.
2. Build a Phase 10 baseline matrix with these columns:
   - topic
   - repo truth now
   - prior audit finding
   - status (`still open`, `partially closed`, `already closed`, `superseded`)
   - evidence files
3. Specifically confirm the current state of:
   - Accounting package config
   - shell runtime injection path
   - Accounting app runtime config path
   - Accounting auth/token path
   - SharePoint API approval declarations
   - light-theme/SPFx theming posture
   - environment banners / readiness messaging
   - latent `/api/users/me/*` dependency handling
   - doc references to staging vs production API resource names
4. If any prior gap is already fully closed in repo truth, mark it closed and identify which later prompts must be narrowed instead of repeated.
5. Author a short Phase 10 baseline memo that explicitly lists:
   - what remains to be implemented
   - what only needs documentation reconciliation
   - what needs fresh artifact proof
   - what depends on tenant/admin action outside the repo


## Deliverables

- a new Phase 10 baseline memo under the appropriate Accounting planning/review path
- an explicit baseline matrix in markdown
- a narrowed implementation scope for Prompts 02–10 if repo truth already closed any sub-gap


## Acceptance Criteria

- no open item is carried forward without exact repo-file evidence
- no already-closed item is needlessly re-implemented
- the baseline clearly separates code changes, artifact-proof work, docs work, and external prerequisites
- later Phase 10 prompts can be executed without ambiguity about current state


## Output Format

Provide:
1. a concise implementation summary
2. the baseline matrix
3. the exact files created or updated
4. any narrowed instructions for later prompts if repo truth already resolved part of the work

