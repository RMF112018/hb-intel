# Prompt-02 — Phase 1 Architecture Baseline

## Objective

Create the canonical **Phase 1 architecture baseline** for the Admin SPFx IT Control Center.

This document must become the authoritative Phase 1 explanation of:
- what the Admin SPFx app is,
- what it is not,
- what the backend/control plane is,
- what the adapter layer is,
- and how the current repo foundations map to that model.

## Important execution rules

- Do **not** re-read files still in current context unless needed because they changed or context is stale.
- Use the repo-truth verification output from Prompt-01 as the immediate evidence base.
- Keep this document Phase-1-specific and architecture-safe.
- Do not let the baseline become a giant end-state rewrite.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-repo-truth-verification.md`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
- the already-verified source files from Prompt-01

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-architecture-baseline.md`

## Required sections

1. **Purpose**
2. **Why Phase 1 exists**
3. **Current foundations already in repo**
4. **Canonical operating model**
   - SPFx operator console
   - privileged backend/control plane
   - adapter layer
   - run / audit persistence
   - standards / configuration governance
5. **Responsibilities by layer**
6. **Explicit out-of-boundary items for SPFx**
7. **How current repo packages/apps map to the baseline**
   - `apps/admin`
   - `packages/features/admin`
   - `@hbc/ui-kit`
   - `backend/functions`
   - provisioning foundations
8. **Phase 1 boundary implications for later phases**
9. **No-go implementation patterns**
10. **Cross-links to the other Phase 1 artifacts**

## Required substance

The baseline must make these points explicit if still consistent with repo truth:

- SPFx is the operator-facing shell and command surface.
- Browser-side code must not own privileged Graph writes, privileged SharePoint admin actions, retry logic, compensation logic, durable run state, or audit persistence internals.
- The backend/control plane is where privileged execution, orchestration, checkpoints, retries, compensation, repair decisions, and durable evidence belong.
- `@hbc/features-admin` stays a reusable admin-intelligence package and should not be expanded into the privileged executor.
- Existing provisioning saga/backend patterns are the correct seed crystal for later generalized control-plane work.
- Standards/configuration governance is a first-class concern, not a side note.

## Writing standard

Write it like a serious developer-facing architecture baseline:
- direct,
- explicit,
- low on fluff,
- high on operational clarity.

## Validation

Before finishing:
- confirm the baseline does not contradict the repo-truth verification doc,
- confirm it does not overclaim current implementation maturity,
- confirm it does not drift into Phase 2 contract design,
- confirm every cross-link path is correct.

## Completion condition

Stop after the baseline doc is complete.
Do not create the boundary matrix in this prompt.
