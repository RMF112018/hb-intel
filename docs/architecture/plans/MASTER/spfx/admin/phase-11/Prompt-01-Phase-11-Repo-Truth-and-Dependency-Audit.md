# Prompt-01 — Phase 11 Repo-Truth and Dependency Audit

## Objective

Audit the current repo for everything that materially affects **Phase 11 — High-risk action safety model** and produce a focused dependency/variance artifact before implementation begins.

## Important execution rules

- Read the smallest authoritative set needed.
- Do **not** re-read files that are already in active context unless they changed, context is stale, or the task widened.
- Distinguish clearly between:
  - confirmed repo fact,
  - confirmed end-state-plan fact,
  - inferred recommendation,
  - unresolved dependency issue.
- Do not implement the safety model in this prompt.

## Required authority set

Read at minimum:

1. `CLAUDE.md`
2. `docs/architecture/blueprint/current-state-map.md`
3. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
4. local READMEs for:
   - `apps/admin`
   - `packages/features/admin`
   - `backend/functions`
5. current files directly relevant to Phase 11:
   - `apps/admin/package.json`
   - `apps/admin/src/App.tsx`
   - `apps/admin/src/router/routes.ts`
   - `apps/admin/src/pages/SystemSettingsPage.tsx`
   - `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
   - `apps/admin/src/pages/ErrorLogPage.tsx`
   - `packages/features/admin/package.json`
   - `packages/features/admin/README.md`
   - `packages/ui-kit/package.json`
   - `packages/models/package.json`
   - `backend/functions/package.json`
   - `backend/functions/README.md`
   - `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
   - `backend/functions/src/services/service-factory.ts`

Also inspect any nearby files you discover are necessary to answer:
- where shared contracts should live,
- where reusable UI should live,
- how current admin routes/pages are actually wired,
- how current backend action execution and audit behavior works.

## Deliverable

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-11/phase-11-repo-truth-and-dependency-audit.md`

## Required sections in the audit file

1. **Purpose**
2. **Authority set actually used**
3. **Confirmed repo facts relevant to Phase 11**
4. **Current implementation maturity by area**
   - operator console
   - reusable admin package
   - UI kit
   - shared models
   - backend control plane
   - audit/evidence
5. **Natural first-adopter candidates**
6. **Dependency gaps / variances**
7. **What Phase 11 can implement now without broad backfill**
8. **What Phase 11 must not try to solve in full**
9. **Recommended package placement for safety-model responsibilities**

## Minimum findings that should be captured if still true

- `apps/admin` exists and is build/test/lint capable.
- Current admin routes are still thin and at least some routes point back into `SystemSettingsPage` rather than dedicated mature safety workflows.
- `ProvisioningFailuresPage` is a real live page and the strongest current first-adopter candidate.
- `ErrorLogPage` is placeholder-level.
- `@hbc/features-admin` is an admin-intelligence package, not the control plane.
- `@hbc/ui-kit` is the correct reusable visual surface for common safety primitives.
- `@hbc/models` is available for shared contracts.
- `backend/functions` already has meaningful foundations for retries, compensation, auth enforcement, and service composition.

## Validation

Before finishing:
- verify every path cited in the audit exists,
- avoid overstating maturity,
- separate present truth from recommendation,
- confirm the deliverable remains an audit artifact, not an implementation doc.

## Completion condition

Stop after the audit file is complete and consistent.
