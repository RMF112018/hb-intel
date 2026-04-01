# Prompt-01 — Phase 3 Repo-Truth Accounting Surface Audit

## Objective

Audit the current Accounting app implementation against live repo truth and the current authoritative workflow/boundary references. Produce an exact Phase 3 gap inventory for routes, queue behavior, detail behavior, visible actions, state handling, status messaging, audit visibility, degraded-path behavior, helper behavior, and Admin-routing posture.

This prompt is primarily an audit and authority-routing prompt. It should establish what is already implemented, what is incomplete, what is stale in the package authority chain, and what later prompts must actually change.

## Working Rules

1. Treat the live repo as the authority.
2. Do not re-read files already in active context unless needed to verify a contradiction or capture exact evidence.
3. Do not redesign the frozen workflow contract unless repo truth forces you to record a contradiction or a dependency on committed earlier-phase outputs in the current workspace.
4. Do not move Admin-only recovery capabilities into Accounting.
5. Do not move requester or coordinator responsibilities into Accounting.
6. Classify each finding as one of:
   - confirmed repo fact
   - confirmed repo-doc intent
   - inferred implementation recommendation
   - unresolved gap or ambiguity
7. Explicitly distinguish:
   - live UI action
   - valid backend transition
   - system-owned progression
8. Update report artifacts as part of the work.

## Canonical Copy Check

Before concluding the audit memo, confirm which package copy is canonical **in the current workspace**.

Required result for this package:

- state whether the package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-3/`
- explicitly state whether duplicate package copies were found in the current workspace
- if the package being audited is only an attached artifact / local draft and not yet committed in the repo, say so directly
- do not hard-code machine-specific absolute paths in the memo

## Required Paths

### Accounting routes, pages, helpers, and tests
- `apps/accounting/src/router/routes.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/crossAppUrls.ts`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Backend and shared lifecycle contract
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/bic-config.ts`

### Current-state and living refs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`

Also inspect any PH6 or older workflow docs that still appear to influence current prompt wording.

## Required Tasks

- Confirm the canonical Phase 3 package working copy and record the result.
- Audit queue and detail route behavior in the Accounting app.
- Identify the exact controller actions currently available by request state.
- Identify the exact valid backend transitions that matter to the controller surface.
- Confirm which behaviors already exist today for status banners, smart-empty-state handling, state messaging, timelines, audit visibility, and degraded-path Admin routing.
- Identify missing or incomplete workflow actions relative to current repo truth and current living refs.
- Identify dead-end states, especially the current `AwaitingExternalSetup` gap.
- Identify wording or UI assumptions that drift from the actual backend handoff semantics.
- Identify any places where Accounting improperly absorbs Admin or coordinator responsibilities.
- Identify stale authority paths and explain why they are stale, partially stale, or historical only.
- Explicitly identify any current living doc that remains authoritative in family but stale in detail.
- Produce a prioritized implementation inventory ordered by impact on controller workflow completeness.

## Deliverables

- A repo-truth gap inventory saved into the required report update.
- A source-authority summary listing which docs govern Prompts 02 through 06.
- A stale-authority summary listing historical or partially stale docs that should not be treated as primary truth.
- A prioritized implementation list that directly informs Prompt-02 through Prompt-05.

## Verification

- Confirm all live Accounting routes and their components.
- Confirm the visible action set by request state.
- Confirm whether `AwaitingExternalSetup` can currently be advanced from the live UI.
- Confirm whether approval currently requires `projectNumber` capture in the live UI.
- Confirm whether UI wording aligns with the actual current handoff from `ReadyToProvision` into system-owned provisioning.
- Confirm whether failed-state Admin routing uses the actual current cross-app URL helper and route target.
- Confirm whether the referenced functional-completion report already exists or must be created by the executing prompt.

## Required Report Update

Update or create:

- `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`

The report update must include:

- progress notes
- canonical-copy confirmation
- exact repo-truth findings
- source-authority classification
- stale-authority findings
- prioritized implementation inventory
- blockers or unresolved items
- evidence paths for every meaningful conclusion

## Completion Standard

This prompt is complete only when later prompts can work from one precise current-state inventory instead of generic “finish the Accounting app” assumptions.

---

## Execution Record

- **Status:** COMPLETE
- **Date:** 2026-04-01
- **Deliverable:** `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`
- **Key findings:**
  - One critical dead-end: `AwaitingExternalSetup` has no forward action in the UI (Priority 1 for Prompt-03)
  - One minor doc drift: `controller-review-surface.md` line 49 names `HbcEmptyState` instead of `HbcSmartEmptyState`
  - No boundary violations; Admin recovery properly separated
  - Approval projectNumber capture and auto-trigger wording correctly aligned
  - Timeline entries incomplete for mid-lifecycle states (Priority 3 for Prompt-04)
- **Verification:** Accounting app lint, build, and test passed
- **No blockers** for Prompt-02
