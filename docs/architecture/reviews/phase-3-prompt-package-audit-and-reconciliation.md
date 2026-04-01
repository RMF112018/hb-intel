# Phase 3 Prompt Package Audit and Reconciliation

## 1. Executive Summary

The Phase 3 package was **partially sound but materially under-specified** relative to current repo truth.

It was directionally correct that Phase 3 should remain implementation-forward and focused on Accounting functional completion, but the package did not make authority order explicit, understated how much Accounting workflow/status/audit structure already exists in the live repo, and left too much room for a future agent to drift back into older PH6-style assumptions about launch semantics and boundary ownership.

After the updates in this audit, the package is **safe to execute** to the best available evidence, provided executing agents continue to honor live repo truth and any Phase 2 lifecycle decisions that may have altered the current baseline.

## 2. Repo-Truth Alignment Findings

### Already Aligned

- The package was correctly framed as an Accounting-surface phase rather than an Admin recovery or backend redesign phase.
- Prompt ordering was broadly correct: audit first, then queue/detail, then external setup, then status/audit UX, then Admin boundary verification, then final reconciliation.
- The package already recognized the importance of failed-item routing to Admin and keeping Accounting out of recovery-console scope.

### Misaligned or Under-Specified

- The package did not explicitly define source precedence. It needed to tell future agents to start with live code, then `current-state-map.md`, then living refs, with PH6 and older plans treated as drift evidence.
- The package described Phase 3 as if Accounting still needed broad functional invention. Current repo truth shows substantial queue/detail, banner, timeline, and audit behavior already exists.
- Prompt wording around “launch” risked implying a distinct controller-side launch model even though the current UI already reflects automatic provisioning start after approval to `ReadyToProvision`.
- The package did not strongly enough preserve the real current gap around `AwaitingExternalSetup`, where the queue supports the state but the detail surface lacks a forward action.
- Prompt routing was too narrow. It needed current Admin, Estimating, provisioning, and connected-service posture refs to keep later implementation aligned with actual ownership boundaries and current platform posture.
- The package referenced `docs/architecture/reviews/accounting-phase-3-functional-completion-report.md` throughout without clarifying that the file does not yet exist and is an expected deliverable to create during execution.

### Repo Facts That Required Changes

- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` already exposes queue tabs for `AwaitingExternalSetup` and `Failed`.
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` already supports approve, clarify, hold, and `Send to Admin` behavior, plus status banners and expert-gated audit visibility.
- The current detail surface has no forward action from `AwaitingExternalSetup`.
- Current Accounting messaging already reflects automatic provisioning start after approval.
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md` and the live Admin app already establish Admin as the owner of retry, archive, escalation acknowledgment, and state override.
- `docs/architecture/blueprint/current-state-map.md` classifies the living SPFx refs as current authority and PH6 plans as historical foundational material.

## 3. Prompt-by-Prompt Change Log

### `README_Phase-3-Accounting-App-Functional-Completion.md`

- Added explicit authority order and canonical-copy framing.
- Added a current repo-truth baseline for queue behavior, detail actions, automatic provisioning messaging, the `AwaitingExternalSetup` gap, and Admin ownership.
- Added package-wide evidence discipline and a guardrail against silently redesigning lifecycle semantics or Admin ownership.
- Change type: corrective, strengthening, narrowing.

### `Phase-3_Accounting-App-Functional-Completion_Implementation-Plan.md`

- Reframed the plan around current repo truth instead of a broad “build everything” posture.
- Added explicit preconditions, authority hierarchy, evidence discipline, and a more accurate stage description for external setup and controller handoff.
- Tightened acceptance criteria so dead-end-state resolution and doc-authority classification are explicit.
- Change type: corrective, strengthening, narrowing.

### `Prompt-01_Phase-3-Repo-Truth-Accounting-Surface-Audit.md`

- Expanded required sources to include current Admin, Estimating, provisioning, and connected-service posture references.
- Required classification of findings into repo fact, repo-doc intent, recommendation, and unresolved gap.
- Added stale-authority classification and canonical-copy confirmation.
- Explicitly required the prompt to detect that the execution report path does not yet exist and must be created when Phase 3 runs.
- Change type: corrective, strengthening.

### `Prompt-02_Phase-3-Queue-and-Detail-Workflow-Completion.md`

- Reframed queue/detail work around actual repo-truth gaps instead of generic workflow completion.
- Added verification instructions using valid current Accounting commands: `build`, `lint`, and `test`.
- Added a guardrail against queue/detail work drifting into Admin recovery or lifecycle redesign.
- Change type: strengthening, narrowing.

### `Prompt-03_Phase-3-External-Setup-and-Launch-Action-Completion.md`

- Reframed the prompt around the real current `AwaitingExternalSetup` dead-end.
- Corrected the wording so the prompt does not assume a separate controller-side launch action exists unless earlier phases explicitly changed the contract.
- Added current provisioning refs as required authorities and required preserved dependency reporting when Phase 2 outcomes matter.
- Change type: corrective, strengthening.

### `Prompt-04_Phase-3-Status-Feedback-Audit-Trail-and-Controller-UX-Hardening.md`

- Reframed the prompt from a near blank-slate UX build to an audit-and-harden pass over existing banners, display helpers, timeline behavior, and audit visibility.
- Required separation of status visibility, audit visibility, and controller UX polish so later implementation stays disciplined.
- Normalized verification instructions to valid Accounting commands.
- Change type: corrective, strengthening, narrowing.

### `Prompt-05_Phase-3-Admin-Routing-and-Cross-App-Boundary-Verification.md`

- Tightened the prompt around controller-visible handoff rather than Admin-feature redesign.
- Required explicit verification of current `Send to Admin` behavior, generated Admin URLs, and safe degradation when Admin configuration is absent.
- Added a clearer distinction between Accounting-visible routing and Admin-owned recovery actions.
- Change type: strengthening, narrowing.

### `Prompt-06_Phase-3-Final-Documentation-Reconciliation-and-Readiness-Report.md`

- Added explicit doc-precedence and source-classification rules.
- Required separation of completed Phase 3 outcomes from later backend, host-boundary, or follow-on dependencies.
- Normalized verification instructions and strengthened closure reporting requirements.
- Change type: corrective, strengthening.

## 4. Remaining Risks

- Phase 3 still depends on whatever lifecycle contract Phase 2 ultimately froze. The updated package now treats current repo truth as the starting point, but a later Phase 2 decision could still alter the final controller-side handoff behavior.
- The `AwaitingExternalSetup` forward path remains a legitimate live-surface gap; the package now preserves it explicitly instead of assuming it was already solved.
- Historical PH6 and MVP docs were not broadly rewritten in this audit. The updated package now routes agents to classify those sources rather than trust them by default.
- The package directory is currently untracked in git, so this audit relied on the files themselves as the starting baseline rather than tracked history.

## 5. Final Recommendation

The updated Phase 3 package should now be executed **as-is**.

Manual review is optional but most valuable for:

- `Prompt-03`, because it sits closest to the lifecycle-handoff semantics that depend on earlier phase outcomes
- `Prompt-06`, because it is responsible for preventing historical-doc drift from re-entering the final readiness story

For the rest of the package, the updated instructions are materially stronger, better scoped, and better aligned with current repo truth than the starting version.
