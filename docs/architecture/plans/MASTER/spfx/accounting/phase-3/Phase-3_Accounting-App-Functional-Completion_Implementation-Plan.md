# Phase 3 — Accounting App Functional Completion — Implementation Plan

## Objective

Complete the Accounting SPFx app so it fully supports the controller role in the Project Setup workflow, aligned first to live repo truth, then to the current-state map and living reference docs, and only secondarily to older PH6-era planning material.

This phase remains **implementation-forward**, but it must not silently reopen lifecycle or ownership decisions that belong to earlier phases.

## Why Phase 3 Exists

The live repo already contains a real Accounting controller surface. Phase 3 does not start from zero. It starts from a partially mature implementation with one especially important controller-surface gap and several hardening needs:

- queue tabs already expose `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, and `Failed`
- detail actions already expose approve, clarification, hold, and failed-item handoff to Admin
- approval already captures a `projectNumber`, advances the request to `ReadyToProvision`, and relies on the backend to auto-start provisioning
- `AwaitingExternalSetup` still lacks a forward action in the current detail surface
- current UI wording already reflects automatic provisioning start after approval
- status banners, state-display helpers, timeline behavior, and expert-gated audit visibility already exist and should be hardened rather than rebuilt
- Admin recovery routes and actions already exist and must stay out of Accounting

Without a precise Phase 3 package, a local code agent could either leave the controller dead-end unresolved or overcorrect by inventing a controller-side launch model or pulling Admin recovery behavior into Accounting.

## Authority and Preconditions

Use the following authority order while executing this phase:

1. live Accounting/backend code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living refs for controller review, Admin recovery, coordinator visibility, responsive failure handling, current provisioning behavior, and Project Setup connected-service posture
4. PH6 and earlier MVP plans as historical drift evidence only

Phase 3 assumes:

1. Phase 1 froze workflow and boundary intent well enough for implementation to proceed.
2. If a committed Phase 2 artifact in the current workspace changed lifecycle semantics and remains consistent with current repo truth, respect that change.
3. Otherwise, current repo truth remains the implementation authority.
4. Accounting remains the controller-facing workflow surface.
5. Admin remains the recovery and override surface.
6. The UI should consume the current backend contract rather than invent a competing lifecycle model.

## Required Current-State Inputs

At minimum, this phase should ground itself in the following sources:

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

### Living refs and current-state docs
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`

## In Scope

- `apps/accounting/src/router/*`
- `apps/accounting/src/pages/*`
- Accounting workflow components and helpers
- controller queue and detail behavior
- controller action affordances and UX
- status banners, state messaging, empty/error states, and audit visibility
- Accounting-side cross-app routing to Admin
- related tests
- Accounting-side docs and readiness reporting

## Out Of Scope

- backend lifecycle redesign
- provisioning saga redesign
- Admin recovery implementation
- requester/coordinator surface redesign outside boundary-verification needs
- host, tenant, deployment, or security configuration work
- broad schema changes unless required for direct UI contract compatibility

## Evidence Discipline

Every prompt in this package must separate:

- confirmed repo fact
- confirmed repo-doc intent
- inferred implementation recommendation
- unresolved gap or ambiguity

When a prompt identifies a gap, it must also state whether that gap is:

- a live UI gap
- a documentation gap
- a backend-contract gap
- an earlier-phase dependency
- a later-phase dependency outside Phase 3

## Implementation Stages

### Stage 1 — Repo-Truth Accounting Surface Audit

Establish the exact live gap list in the Accounting app against current repo truth and the governing workflow/boundary references.

**Primary output**

- authoritative gap inventory for queue, detail, status, audit, route, helper, and Admin-routing behavior

**Key focus**

- actual controller actions by state
- dead-end states
- wording drift versus current lifecycle behavior
- helper-level current-state truth (`stateDisplayHelpers`, `crossAppUrls`)
- existing status/audit behavior that should be hardened rather than reinvented
- authority routing and stale-doc classification

### Stage 2 — Queue and Detail Workflow Completion

Complete queue/detail workflow behavior using the Prompt-01 inventory instead of generic completion assumptions.

**Primary output**

- corrected queue/detail controller flow with missing or misleading behavior removed

**Key focus**

- queue tabs, filters, columns, and navigation continuity
- detail action visibility by state
- controller-safe affordances only
- no spillover into Admin recovery behavior
- direct alignment with the actual live state model and tests

### Stage 3 — External Setup Exit and Final Controller Handoff Completion

Resolve the `AwaitingExternalSetup` dead-end and any final controller-side handoff UX in a way that remains consistent with the frozen lifecycle contract and current backend behavior.

**Primary output**

- complete external-setup exit path and contract-safe final controller handoff behavior

**Key focus**

- `AwaitingExternalSetup -> ReadyToProvision` controller path
- project-number capture and validation UX
- wording aligned to actual backend auto-trigger behavior
- no accidental invention of a separate controller-side launch model
- no backend lifecycle redesign unless a tiny client-alignment change is strictly necessary

### Stage 4 — Status Feedback, Audit Trail, and UX Hardening

Harden controller-facing operational confidence using the status, banner, smart-empty-state, timeline, and audit features already present in the surface.

**Primary output**

- clearer controller feedback and read-only audit visibility across normal, warning, and failure states

**Key focus**

- labels, banners, and state messaging
- empty, loading, and error states
- history and audit visibility
- controller-safe next-step guidance
- no recovery-console behavior inside Accounting

### Stage 5 — Admin Routing and Boundary Verification

Verify that Accounting routes failed or exceptional cases correctly without absorbing Admin responsibilities.

**Primary output**

- clean Accounting-to-Admin routing with intact ownership boundaries

**Key focus**

- `Send to Admin` behavior
- `getAdminAppUrl()` behavior
- actual route target and parameter shape
- missing-target degradation
- no Admin recovery controls in Accounting
- doc alignment for boundary ownership

### Stage 6 — Final Documentation Reconciliation and Readiness Report

Reconcile the final implementation against current repo truth and produce the Phase 3 readiness closeout.

**Primary output**

- updated docs and final readiness report for later phases

**Key focus**

- repo-truth evidence
- closure statements
- remaining gaps or later-phase dependencies
- explicit Phase-3-vs-non-Phase-3 classification
- clear readiness recommendation

## Prompt Order

1. `Prompt-01_Phase-3-Repo-Truth-Accounting-Surface-Audit.md`
2. `Prompt-02_Phase-3-Queue-and-Detail-Workflow-Completion.md`
3. `Prompt-03_Phase-3-External-Setup-and-Final-Controller-Handoff-Completion.md`
4. `Prompt-04_Phase-3-Status-Feedback-Audit-Trail-and-Controller-UX-Hardening.md`
5. `Prompt-05_Phase-3-Admin-Routing-and-Cross-App-Boundary-Verification.md`
6. `Prompt-06_Phase-3-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Acceptance Standard for the Phase

Phase 3 is complete only when all of the following are true:

- the Accounting queue and detail flow are complete for the controller role
- `AwaitingExternalSetup` is no longer a controller dead-end unless a committed earlier-phase artifact in the current workspace explicitly preserves that limitation and current repo truth still supports it
- final controller-side wording is aligned with actual backend handoff behavior
- controller-facing status and audit context are operationally credible
- failure cases route cleanly to Admin without adding Admin actions to Accounting
- docs are updated to match repo truth and stale authority paths are classified
- a final readiness report exists stating what was completed, what remains, and whether the app is ready for later hardening phases

---

## Execution Progress

### Prompt-01 — Repo-Truth Accounting Surface Audit

- **Status:** COMPLETE
- **Date:** 2026-04-01
- **Deliverable:** `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md`
- **Summary:** Surface is substantially mature. One critical dead-end (`AwaitingExternalSetup` lacks forward action), one minor doc drift (`HbcSmartEmptyState` naming), no boundary violations. Prioritized gap inventory produced for Prompts 02–06. No blockers for Prompt-02.

### Prompt-02 — Queue and Detail Workflow Completion

- **Status:** COMPLETE
- **Date:** 2026-04-01
- **Summary:** Fixed `Submitted` state invisibility in queue (added to "Pending Review" tab filter) and added "Begin Review" action on detail page for `Submitted → UnderReview` transition. 3 new tests. No boundary violations. No blockers for Prompt-03.
