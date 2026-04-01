# Phase 1 Prompt Package Audit And Reconciliation

## 1. Executive Summary

The Phase 1 prompt package was **partially sound** at the start of this audit.

It already aimed at the right high-level problem set:

- workflow ambiguity
- boundary freeze
- validation/evidence freeze
- doc reconciliation

It was materially under-specified, however, in four ways that would have made mis-execution likely:

- it did not clearly enforce authority order between live repo truth, current-state docs, living references, and older PH6 artifacts
- it did not strongly separate confirmed repo fact from doc intent, inference, and unresolved ambiguity
- it still carried wording that could let a later agent re-import stale lifecycle semantics
- it did not force later prompts to keep contract freeze separate from broad implementation

The package is now safe to execute **to the best available evidence** for a disciplined Phase 1 contract-freeze effort.

## 2. Repo-Truth Alignment Findings

### What Was Already Aligned

- The package correctly recognized that Phase 1 should focus on workflow contract and boundary freeze rather than broad delivery.
- The package correctly identified lifecycle semantics, boundary ownership, validation/evidence, and doc reconciliation as the right dependency flow.
- The package correctly identified `AwaitingExternalSetup`, `ReadyToProvision`, and provisioning-trigger semantics as core concerns.

### What Was Misaligned

- The package did not strongly route later agents to the live current-state authority set before reading PH6 lifecycle plans.
- Prompt-02 still allowed the older “distinct controller launch action” mental model to remain too plausible.
- Prompt-03 did not force a distinction between visible action, authoritative owner, and system transition.
- Prompt-04 risked being read as an implementation prompt for full evidence persistence rather than a contract-freeze prompt.
- Prompt-05 did not clearly classify stale docs or force an authoritative source list for later phases.
- Prompt-06 did not require explicit answers to the core audit questions and did not force preserved ambiguity to remain visible.

### Repo Facts That Required Changes

- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` currently exposes approve, clarification, hold, and failed-item route-to-admin, but no forward action from `AwaitingExternalSetup`.
- `backend/functions/src/functions/projectRequests/index.ts` auto-triggers the provisioning saga when the request moves to `ReadyToProvision`.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` reconciles the request into `Provisioning`.
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md` and live Admin code already place retry, archive, escalation acknowledgment, and state override in Admin, not Accounting.
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` shows Estimating already owns limited retry/escalation entry behavior that must be part of boundary freeze.
- Older lifecycle and notification docs still preserve earlier semantics strongly enough to mislead a fresh implementation agent if the prompt package does not explicitly downgrade them.

## 3. Prompt-By-Prompt Change Log

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/README_Phase-1-Workflow-Contract-and-Boundary-Freeze.md`

- Changed:
  - added canonical-copy statement
  - added explicit authority order
  - added confirmed repo-truth baseline facts
  - added package-wide evidence discipline and anti-implementation drift rules
- Why:
  - the README was directionally correct but too weak to keep a fresh agent from treating old PH6 docs as peer authority
- Change type:
  - corrective
  - strengthening
  - narrowing

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Phase-1_Workflow-Contract-and-Boundary-Freeze_Implementation-Plan.md`

- Changed:
  - reframed the plan around current repo truth and present authority order
  - replaced generic lifecycle language with the actual approval-to-`ReadyToProvision` auto-trigger flow
  - added explicit inputs, stage goals, and anti-drift standards
- Why:
  - the original plan named the right topics but did not protect later execution from stale semantics or over-broad implementation
- Change type:
  - corrective
  - strengthening
  - sequencing-related

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-01_Phase-1-Repo-Truth-Workflow-Contract-Audit.md`

- Changed:
  - expanded audit scope to the current-state map and active Accounting/Admin/Estimating references
  - added canonical-copy check
  - required classification of findings as fact, doc intent, inference, or unresolved ambiguity
  - required stale-authority-path analysis
- Why:
  - the audit prompt needed stronger evidence discipline and stronger routing to the actual current authority set
- Change type:
  - strengthening
  - narrowing

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-02_Phase-1-Request-Lifecycle-and-Provisioning-Trigger-Freeze.md`

- Changed:
  - reframed lifecycle freeze around controller transition to `ReadyToProvision`, backend auto-trigger, and saga reconciliation to `Provisioning`
  - removed the implicit assumption of a distinct controller-side launch button
  - forced treatment of PH6 and notification docs as drift candidates
  - required explicit handling of `ReadyToProvision` as durable state, short-lived handoff, or both
- Why:
  - this was the most important correction needed to keep later work aligned with live backend behavior
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-03_Phase-1-Application-Boundary-and-Role-Responsibility-Freeze.md`

- Changed:
  - added Estimating coordinator visibility/retry reference as required input
  - required separate matrices for visible action, authoritative owner, and system transition
  - tightened scope around actual live responsibilities across Accounting, Estimating, Admin, backend, and `@hbc/provisioning`
- Why:
  - boundary confusion in this area is likely unless the prompt forces a distinction between UI behavior and system ownership
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-04_Phase-1-Validation-Audit-and-Evidence-Contract-Freeze.md`

- Changed:
  - narrowed the prompt to contract freeze
  - required separation between assistive validation, authoritative backend validation, current persistence, and missing-but-required later evidence
  - explicitly named the current repo gap around controller-action evidence persistence
- Why:
  - the original wording risked turning Phase 1 into broad implementation under the label of “freeze”
- Change type:
  - narrowing
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-05_Phase-1-Authoritative-Documentation-Reconciliation.md`

- Changed:
  - added strict documentation precedence
  - required classification of stale docs
  - required a current authoritative source list for later phases
  - redirected the prompt toward current-state and living docs before PH6 artifacts
- Why:
  - reconciliation work would not be safe unless later agents can tell which docs now govern future implementation
- Change type:
  - corrective
  - strengthening

### `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Prompt-06_Phase-1-Final-Closure-and-Go-Forward-Readiness-Report.md`

- Changed:
  - required explicit answers to the ten core audit questions
  - added “Ambiguities Intentionally Preserved”
  - strengthened closure criteria so authority confusion or drift risk prevents false closure
- Why:
  - the original closure prompt could still have produced a reassuring summary without proving that the package was actually safe to execute
- Change type:
  - strengthening
  - closure-related

## 4. Remaining Risks

- The repo still contains legitimate lifecycle ambiguity around how `ReadyToProvision` should be described in durable business terms even though the current backend handoff behavior is clear. Later prompts should freeze that language carefully instead of pretending the current repo already expresses it perfectly.
- The `AwaitingExternalSetup` forward path remains a real live-surface gap. The package now preserves it explicitly; Phase 1 should not paper over it.
- Older PH6 and notification docs still exist outside this package. This package now tells later prompts to classify and reconcile them, but the broader historical doc library still requires disciplined handling.
- Controller action evidence persistence is still not a fully frozen current implementation story. Phase 1 should define the contract and gaps rather than imply that the persistence is already comprehensive.

## 5. Final Recommendation

The updated package should now be executed as-is for Phase 1.

Manual review is not strictly required before execution, but reviewers should pay particular attention during Prompt-02 and Prompt-04 because those prompts carry the highest risk of either:

- re-importing stale lifecycle semantics, or
- drifting from contract freeze into implementation work

Canonical package updated:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-1/`

Duplicate copies found:

- none during the targeted workspace search under `/Users/bobbyfetting`
