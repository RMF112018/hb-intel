# Phase 3 — Accounting App Functional Completion

## Purpose

This package drives **Phase 3 — Accounting App Functional Completion** for the HB Intel Project Setup workflow.

Phase 3 is an **implementation-forward Accounting surface completion phase**, not a backend redesign phase and not a repeat of Phase 1 contract freeze. It should consume the workflow and ownership decisions already frozen in Phase 1 and any lifecycle hardening completed in Phase 2, while staying anchored to live repo truth when older plans or prompts drift.

The goal of this phase is to bring the **Accounting SPFx app** to a functionally complete controller surface for Project Setup by:

- completing the queue and detail workflow where gaps still exist
- closing the current `AwaitingExternalSetup` dead-end in a contract-safe way
- hardening status, audit, and controller feedback behavior that already exists in partial form
- preserving the Admin recovery boundary while ensuring failed-item routing works cleanly

## Canonical Working Copy

Use the in-repo package at:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-3/`

Targeted lookup surfaced this package as the canonical working copy for Phase 3.

## Package Contents

1. `Phase-3_Accounting-App-Functional-Completion_Implementation-Plan.md`
2. `Prompt-01_Phase-3-Repo-Truth-Accounting-Surface-Audit.md`
3. `Prompt-02_Phase-3-Queue-and-Detail-Workflow-Completion.md`
4. `Prompt-03_Phase-3-External-Setup-and-Launch-Action-Completion.md`
5. `Prompt-04_Phase-3-Status-Feedback-Audit-Trail-and-Controller-UX-Hardening.md`
6. `Prompt-05_Phase-3-Admin-Routing-and-Cross-App-Boundary-Verification.md`
7. `Prompt-06_Phase-3-Final-Documentation-Reconciliation-and-Readiness-Report.md`

## Authority Order

When sources disagree, use this order:

1. live repo code, tests, manifests, and current UI behavior
2. `docs/architecture/blueprint/current-state-map.md`
3. living reference docs for current SPFx surfaces, provisioning behavior, and Project Setup host posture
4. historical PH6, MVP, and earlier workflow-planning docs as drift evidence only

Historical plans may still be useful for intent, but they are not peer authority with current-state code and living references.

## Current Repo-Truth Baseline

This package should start from the confirmed current-state baseline:

- Accounting queue already exposes `AwaitingExternalSetup` and `Failed` filtering.
- Accounting detail already supports controller approve, clarification, hold, and failed-item route-to-Admin behavior.
- Current Accounting messaging already reflects that approval advances to `ReadyToProvision` and provisioning begins automatically under the live backend contract.
- `AwaitingExternalSetup` is a real live-surface gap because the current detail page does not expose a forward action from that state.
- Admin already owns retry, archive, escalation acknowledgment, and state override behavior.
- Accounting already has partial status, banner, timeline, and expert-gated audit-trail behavior, so this phase should harden and complete the surface rather than behave like a blank-slate build.

## Required Execution Order

Run the prompts in numeric order.

- **Prompt-01** establishes repo truth, authority routing, and the actual Phase 3 gap list.
- **Prompt-02** completes queue/detail controller behavior that is missing or incomplete.
- **Prompt-03** resolves the external-setup exit path and any controller-side handoff wording in a way that remains consistent with the frozen backend contract.
- **Prompt-04** hardens status, audit visibility, and controller-facing UX using the existing surface as the starting point.
- **Prompt-05** verifies Admin routing and cross-app boundary discipline.
- **Prompt-06** reconciles documentation and produces the final readiness report.

Do not skip ahead unless a prior prompt explicitly records that its blocking dependency is resolved.

## Package-Wide Rules

Apply these instructions throughout the phase:

1. Treat the live repo as the primary implementation authority.
2. Do not re-read files already in active context unless needed to verify a contradiction, capture exact evidence, or confirm a change.
3. Distinguish clearly between:
   - confirmed repo fact
   - confirmed repo-doc intent
   - inferred implementation recommendation
   - unresolved gap or ambiguity
4. Do not redesign lifecycle semantics or Admin ownership in this phase unless a prompt explicitly confirms that Phase 2 changed the governing contract.
5. Do not move Admin-only recovery capabilities into Accounting.
6. Do not move requester or coordinator responsibilities into Accounting.
7. Prefer extension of existing routes, pages, helpers, and tests over parallel patterns.
8. Update documentation and report artifacts as part of the implementation instead of deferring documentation to the end.
9. If a referenced report file does not yet exist, create it as part of the prompt instead of treating its absence as repo truth.

## Recommended Working Outputs

As the prompts execute, the code agent should update or create artifacts such as:

- Accounting routes, pages, and workflow components
- controller-facing status and audit helpers
- cross-app routing helpers
- Accounting tests
- living reference doc updates when repo truth changes
- the Phase 3 functional completion report

## Expected End State of Phase 3

By the end of this phase, the Accounting app should support a functionally complete controller workflow with no intentional dead-end states, no misleading handoff wording, clear status and audit context, and clean routing to Admin without absorbing Admin recovery responsibilities.

Phase 3 is complete when the Accounting surface is functionally ready for later production-hardening work, even if broader host, deployment, or tenant-readiness work remains outside this phase.
