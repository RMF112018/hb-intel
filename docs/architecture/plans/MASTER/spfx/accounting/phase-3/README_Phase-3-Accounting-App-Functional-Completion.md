# Phase 3 — Accounting App Functional Completion

## Purpose

This is the revised canonical Phase 3 prompt set for the Accounting-side Project Setup controller surface.

Phase 3 is an **implementation-forward Accounting surface completion phase**. It is not:

- a backend lifecycle redesign phase
- an Admin recovery implementation phase
- a repeat of Phase 1 contract freeze

Its purpose is to complete the live Accounting controller surface against current repo truth, strengthen the controller UX that already exists, close the live `AwaitingExternalSetup` dead-end in a contract-safe way, preserve the Admin recovery boundary, and leave the repo with a clear readiness report for later hardening phases.

## Canonical Working Copy Rule

Treat the repo-relative package path as canonical **only if the package has been committed there in the current workspace**:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-3/`

Do not hard-code workstation-specific paths in findings or final docs.  
If duplicate package copies exist in the current workspace, record them explicitly and name which copy was audited.  
If the package exists only as an attached artifact or local working draft, say so directly.

## Authority Order

When sources disagree, use this order:

1. live repo code, tests, manifests, and current UI behavior
2. `docs/architecture/blueprint/current-state-map.md`
3. living reference docs for current SPFx surfaces, provisioning behavior, degraded-path behavior, and Project Setup connected-service posture
4. historical PH6, MVP, and earlier workflow-planning docs as drift evidence only

Historical plans may still be useful for intent, but they are not peer authority with current-state code and living references.

## Current Repo-Truth Baseline That Motivates Phase 3

The live repo currently shows all of the following:

- Accounting queue already exposes `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, and `Failed` filtering.
- Accounting detail already supports controller approve, clarification, hold, and failed-item route-to-Admin behavior.
- Approval is not generic. The detail page captures and validates a `projectNumber` and advances the request to `ReadyToProvision` with that value.
- The backend auto-starts provisioning when the controller advances a request to `ReadyToProvision`.
- The live surface has no forward action from `AwaitingExternalSetup`, which makes that state a real controller-surface dead-end today.
- The live detail page already contains real post-approval lifecycle banners, timeline rendering, action error banners, load/empty/error handling, and expert-gated audit visibility.
- Admin recovery already owns retry, archive, escalation acknowledgment, and override behavior.
- Current cross-app failure routing already uses `getAdminAppUrl()` and degrades safely when the Admin URL is not configured.
- The current controller surface doc family remains authoritative in family, but at least one living doc is partially stale in detail and must be reconciled during this phase.

These facts are the starting point for this package. Do not write prompts that assume a separate controller-side provisioning launch model still exists.

## Files In This Package

- `Accounting_Phase3_Prompt_Audit_Report.md`
- `Phase-3_Accounting-App-Functional-Completion_Implementation-Plan.md`
- `Prompt-01_Phase-3-Repo-Truth-Accounting-Surface-Audit.md`
- `Prompt-02_Phase-3-Queue-and-Detail-Workflow-Completion.md`
- `Prompt-03_Phase-3-External-Setup-and-Final-Controller-Handoff-Completion.md`
- `Prompt-04_Phase-3-Status-Feedback-Audit-Trail-and-Controller-UX-Hardening.md`
- `Prompt-05_Phase-3-Admin-Routing-and-Cross-App-Boundary-Verification.md`
- `Prompt-06_Phase-3-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume the current package wording is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- Prefer extension of existing routes, pages, helpers, and tests over parallel patterns.
- Keep Phase 3 focused on Accounting controller-surface completion, controller-safe UX hardening, cross-app routing integrity, and documentation/readiness closure.
- Do not redesign lifecycle semantics or Admin ownership in this phase unless a prompt explicitly confirms that a committed earlier-phase artifact in the current workspace changed the governing contract and that change remains consistent with current repo truth.
- Do not move Admin-only recovery capabilities into Accounting.
- Do not move requester or coordinator responsibilities into Accounting.
- Do not invent a separate controller-side provisioning launch model unless current repo truth and committed earlier-phase artifacts in the current workspace explicitly require it.
- Update documentation and report artifacts as part of the implementation rather than deferring them to the end.

## Evidence Discipline

Every prompt and every resulting artifact must clearly separate:

1. confirmed repo fact
2. confirmed repo-doc intent
3. inferred implementation recommendation
4. unresolved gap or ambiguity

When a prompt identifies a gap, it must also distinguish:

- live UI action
- valid backend transition
- system-owned progression
- cross-surface boundary ownership

## Current-State Files That Matter Most In Phase 3

At minimum, this package expects the local code agent to ground itself in the following current-state sources as relevant per prompt:

### Accounting surface and support files
- `apps/accounting/src/router/routes.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/utils/crossAppUrls.ts`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

### Backend and shared lifecycle files
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/bic-config.ts`

### Living references and current-state docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`

## Known Drift To Handle Carefully

The package must assume at least the following possible drift risks exist until Prompt-01 proves otherwise:

- controller-surface docs that omit the approval-time `projectNumber` requirement
- wording that implies the controller still performs a separate provisioning launch step
- wording that blurs live UI affordances with valid backend transition rights
- wording that understates existing controller-surface status/audit functionality

## Phase 3 Success Standard

Phase 3 is complete only when all of the following are true:

- the Accounting queue and detail flow are complete for the controller role
- `AwaitingExternalSetup` is no longer a controller dead-end unless a committed earlier-phase artifact in the current workspace explicitly preserves that limitation and current repo truth still supports that decision
- controller-facing wording is aligned with the actual backend handoff behavior
- the controller surface communicates clear status, next-step context, and read-only audit visibility
- failed cases route cleanly to Admin without adding Admin recovery actions to Accounting
- living docs are updated to match repo truth or explicitly classified when partially stale
- the final readiness report clearly states what is complete, what remains, and whether the Accounting controller workflow is functionally ready for later hardening phases

## Execution Order

Execute the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip ahead unless a prior prompt explicitly records that its blocking dependency is resolved.

---

## Execution Progress

| Prompt | Description | Status | Date |
|--------|-------------|--------|------|
| 01 | Repo-Truth Accounting Surface Audit | COMPLETE | 2026-04-01 |
| 02 | Queue and Detail Workflow Completion | COMPLETE | 2026-04-01 |
| 03 | External Setup and Final Controller Handoff | COMPLETE | 2026-04-01 |
| 04 | Status Feedback, Audit Trail, and UX Hardening | COMPLETE | 2026-04-01 |
| 05 | Admin Routing and Cross-App Boundary Verification | NOT STARTED | — |
| 06 | Final Documentation Reconciliation and Readiness | NOT STARTED | — |
