# Accounting Phase 3 Prompt Package Audit Report

## Executive Summary

The attached Phase 3 package is **directionally strong and mostly well ordered**, but it is **not yet precise enough to be a safe implementation guide without revision**.

What is already good:

- it correctly treats Phase 3 as an **implementation-forward Accounting surface completion phase**
- it correctly keeps backend lifecycle redesign and Admin recovery out of scope
- it correctly centers the live `AwaitingExternalSetup` dead-end as the most important controller-surface gap
- it correctly preserves the Admin boundary and expects controller-safe routing rather than Admin recovery controls in Accounting
- it correctly assumes the live UI already contains real status, audit, and lifecycle messaging that should be hardened rather than rebuilt

What needed correction:

1. the package does not point strongly enough at the **actual current-state implementation files** that govern the controller surface
2. Prompt-03 still carries **“launch action” language** that can mislead a local code agent into inventing a separate controller-side provisioning launch model
3. the package does not force enough explicit reconciliation of the **controller surface doc drift** that still omits the approval-time `projectNumber` requirement
4. the package does not separate strongly enough:
   - live UI action
   - contract-valid backend transition
   - system-owned lifecycle progression
5. the package is too soft about the possibility that earlier phases may have changed the lifecycle contract; for implementation work, the package should default to **current repo truth unless a committed earlier-phase artifact in the workspace proves otherwise**
6. several current-state support files and living references that materially affect the controller UX are not named explicitly enough

Bottom line:

- **Phase shape:** keep it
- **Prompt order:** keep it
- **Boundary discipline:** keep it
- **Current-state source list:** expand it
- **Prompt-03 framing:** tighten it substantially
- **Verification and closure language:** strengthen it
- **Doc reconciliation obligations:** make them more explicit

This revised package preserves the intended six-stage structure while making the implementation guidance safer and more precise.

---

## Current Repo-Truth Workflow and Surface Summary

### 1. Current-state authority is explicit

The current-state map is the governing source for what the repo contains today when historical plans or older references differ. It also explicitly lists the Accounting controller pages, current SPFx surface docs, the provisioning state machine docs, and the cross-app URL helpers as present-state artifacts.

### 2. The Accounting controller surface is real, bounded, and already partially mature

The live Accounting routes are currently:

- `/project-review`
- `/project-review/$requestId`

The queue page already exposes state-filtered controller tabs for:

- `UnderReview`
- `NeedsClarification`
- `AwaitingExternalSetup`
- `Failed`

The queue already renders real columns and row navigation, including project number, department, state, submitter, submitted date, current owner, and an Open action.

### 3. The review detail page is already an implemented controller surface

The live detail page already supports controller actions, but only when the request is in `UnderReview`:

- Approve Request
- Request Clarification
- Place on Hold

It also supports failed-item handoff to Admin through a separate failed-state action.

### 4. Approval is not a generic action — it requires project-number capture

The detail page currently validates project number format using `##-###-##` and then advances the request to `ReadyToProvision` with the project number included in the API payload.

That means any prompt or doc that describes approval without the project-number requirement is materially incomplete.

### 5. The backend still auto-starts provisioning from controller advancement to `ReadyToProvision`

The backend `advanceRequestState` handler still does all of the following:

- validates the transition
- resolves role authorization
- requires a valid project number when moving to `ReadyToProvision`
- persists the request
- auto-triggers the provisioning saga when the new state is `ReadyToProvision`
- suppresses a new auto-trigger if an existing non-failed provisioning status already exists

This remains the most important lifecycle fact Phase 3 must respect.

### 6. `AwaitingExternalSetup` remains contract-valid but is still a live UI dead-end

The provisioning state-machine reference still treats:

- `AwaitingExternalSetup -> ReadyToProvision`

as a valid controller transition requiring a valid project number.

But the current Accounting detail page exposes no forward action when a request is already in `AwaitingExternalSetup`.

That is the clearest real Phase 3 implementation gap in the live surface.

### 7. `ReadyToProvision` and `Provisioning` remain distinct, and system ownership is explicit

The state-machine reference still defines `ReadyToProvision` and `Provisioning` as separate states. The BIC config treats both as system-owned (`null` owner), and the live detail page already reflects the automatic handoff model through post-approval lifecycle banners.

So the correct present-state framing is:

- controller approves and assigns project number
- backend moves the request into `ReadyToProvision`
- backend auto-starts the saga
- system then progresses into `Provisioning`

There is no separate controller-side “launch” button in the live detail page.

### 8. Failed-state Admin routing is already boundary-safe in the live UI

When a request is failed, the live detail page shows `Send to Admin` only for failed requests, generates a URL using `getAdminAppUrl()`, opens `/provisioning-oversight?projectId=...`, and degrades safely to a warning banner when `VITE_ADMIN_APP_URL` is missing or invalid.

### 9. Status, timeline, and audit behavior already exist and should be hardened, not reinvented

The live detail page already contains:

- state context text
- post-approval lifecycle banners
- `HbcStatusTimeline`
- expert-gated `HbcAuditTrailPanel`
- action-error banner handling
- empty / not-found / load-error handling through `WorkspacePageShell`

The queue page already uses `HbcSmartEmptyState` rather than a blank-slate pattern.

### 10. One of the key living docs is already partially stale in detail

The controller-review-surface doc is still the right living doc family, but its API mapping is stale in a meaningful way:

- it still describes Approve as `advanceState(id, 'ReadyToProvision')`

while the live detail page requires:

- `advanceState(requestId, 'ReadyToProvision', { projectNumber })`

That specific drift matters because it could cause a local code agent to preserve an incorrect approval contract.

---

## Confirmed Phase 3 Prompt-Package Facts

The uploaded Phase 3 package already gets a lot right.

### Confirmed strengths

- It frames Phase 3 as implementation-forward rather than another contract-freeze phase.
- It preserves the current-state-map in the authority chain.
- It keeps Admin recovery out of Accounting.
- It identifies `AwaitingExternalSetup` as the live dead-end to close.
- It recognizes that the Accounting surface already has partial status, banner, timeline, and audit functionality.
- It keeps a six-prompt sequence with sensible dependency flow.
- It pushes documentation and readiness reporting into the phase instead of treating them as an afterthought.

### Confirmed weaknesses

- It does not explicitly anchor enough of the Phase 3 work in the actual live controller-surface helpers:
  - `apps/accounting/src/utils/crossAppUrls.ts`
  - `apps/accounting/src/utils/stateDisplayHelpers.ts`
- It does not explicitly include the current backend request-state endpoint and BIC config often enough in the implementation prompts that depend on them.
- Prompt-03 still uses “Launch Action” in the filename/title, which is stale framing against the live backend contract.
- It does not force explicit cleanup of the controller-review doc drift around project-number capture.
- It is too soft about the “Phase 2 may have changed semantics” premise for implementation execution; current repo truth should remain the default unless committed earlier-phase evidence in the current workspace proves otherwise.
- It does not point strongly enough at the current responsive/cross-app support docs that now govern degraded-path behavior and controller-safe cross-app routing.

---

## Prompt-Package ↔ Repo Alignment Analysis

## 1. README alignment

**Assessment:** good foundation, needs precision improvements.

The README correctly states that Phase 3 is an implementation-forward controller-surface completion phase and that it should stay anchored to live repo truth. It also correctly identifies the live `AwaitingExternalSetup` gap and the existing Admin boundary.

What needs improvement:

- the canonical-copy language should be workspace-agnostic rather than sounding like a prior targeted lookup already settled the matter forever
- the README should explicitly say that **current repo truth controls unless a committed earlier-phase artifact in the current workspace proves a different frozen contract**
- it should explicitly call out the most important current-state support files:
  - `routes.ts`
  - `crossAppUrls.ts`
  - `stateDisplayHelpers.ts`
  - controller and Admin surface docs
  - backend `projectRequests/index.ts`
  - provisioning `bic-config.ts`

## 2. Implementation-plan alignment

**Assessment:** mostly aligned.

The implementation plan gets the major stage order right:

1. repo-truth gap inventory
2. queue/detail completion
3. external-setup dead-end closure
4. status/audit hardening
5. Admin routing/boundary verification
6. final reconciliation/readiness

That is the correct implementation order.

What needs improvement:

- the plan should more explicitly state that Phase 3 cannot assume a distinct controller-side provisioning launch model
- it should more explicitly distinguish contract-valid transitions from live UI actions
- it should include the current helper and backend files that materially shape controller behavior

## 3. Prompt-01 alignment

**Assessment:** strong, but missing a few current-state anchors.

Prompt-01 already does the right kind of audit. It asks for routes, queue/detail behavior, visible actions, dead-end states, status/audit behavior, and stale authority paths.

What needs improvement:

- add explicit review of:
  - `apps/accounting/src/router/routes.ts`
  - `apps/accounting/src/utils/crossAppUrls.ts`
  - `apps/accounting/src/utils/stateDisplayHelpers.ts`
  - `backend/functions/src/functions/projectRequests/index.ts`
  - `packages/provisioning/src/bic-config.ts`
  - `docs/reference/spfx-surfaces/responsive-failure-catalog.md`
- require explicit separation of:
  - live UI action
  - backend-valid transition
  - system-owned progression
- require explicit classification of the controller-review doc drift around approval payload shape

## 4. Prompt-02 alignment

**Assessment:** aligned, but should be slightly tighter.

Prompt-02 correctly focuses on queue/detail completion and avoids relitigating ownership or redesigning lifecycle semantics.

What needs improvement:

- make it explicit that “complete or correct detail-page action visibility by request state” means:
  - remove misleading affordances
  - add missing controller-safe affordances only where the backend contract already supports them
- require direct verification against:
  - current route behavior
  - current state handling
  - current test gaps

## 5. Prompt-03 alignment

**Assessment:** the most important revision target.

The live repo does not support a separate controller-side launch model. The prompt’s body partly acknowledges that, but the title/filename framing still creates drift risk.

What needs improvement:

- remove “Launch Action” language from the title and objective
- explicitly anchor the work in:
  - `AwaitingExternalSetup -> ReadyToProvision`
  - approval-time `projectNumber` capture
  - backend auto-trigger semantics
- require the prompt to treat the missing `AwaitingExternalSetup` forward action as:
  - a controller-surface completion task
  - not a backend lifecycle redesign task
- require direct review of:
  - `backend/functions/src/functions/projectRequests/index.ts`
  - `docs/reference/provisioning/state-machine.md`
  - `packages/provisioning/src/bic-config.ts`

## 6. Prompt-04 alignment

**Assessment:** strong and mostly current-state aware.

Prompt-04 already starts from existing banners, `HbcAuditTrailPanel`, timeline behavior, and controller-safe status messaging. That is correct.

What needs improvement:

- explicitly include the queue page’s `HbcSmartEmptyState`
- explicitly require alignment with current `stateDisplayHelpers.ts`
- explicitly prohibit any language that implies Admin recovery operations in controller messaging

## 7. Prompt-05 alignment

**Assessment:** strong, but it should be even more explicit about the actual current route target.

Prompt-05 already names the right boundary concern and the right helper file.

What needs improvement:

- require verification of the exact current route target:
  - `/provisioning-oversight?projectId=...`
- require explicit verification that missing/invalid `VITE_ADMIN_APP_URL` degrades to a warning banner instead of broken navigation
- require explicit comparison to the Admin route doc so the local code agent does not invent alternate route patterns

## 8. Prompt-06 alignment

**Assessment:** strong.

Prompt-06 already does the right final reconciliation work.

What needs improvement:

- explicitly classify remaining gaps as:
  - Phase 3 incomplete work
  - earlier-phase dependency
  - later-phase dependency
  - backend/host readiness item outside Phase 3
- require a direct yes/no answer on whether the controller workflow is functionally complete in the live UI after execution

---

## Stale-Assumption and Authority-Drift Analysis

## 1. “Launch action” language is the biggest wording drift risk

The live backend auto-starts provisioning from the controller transition into `ReadyToProvision`. The phrase “Launch Action” is therefore dangerous shorthand in Phase 3 because it can prompt a local code agent to invent either:

- a separate explicit controller-side launch button, or
- wording that implies the controller still owns the actual provisioning start event

That is no longer the best current-state framing.

## 2. The controller-review-surface doc is authoritative in family, but stale in detail

This is the most important doc drift in Phase 3.

It still omits the required `projectNumber` payload on approval, and it still names `HbcEmptyState` where the live queue page uses `HbcSmartEmptyState`.

That doc should remain in the authority set, but the prompt package should force it to be reconciled.

## 3. Phase 3 should not rely on ambiguous “maybe Phase 2 changed it” execution logic

That sentence is acceptable as a caveat, but not as a dominant execution rule. For implementation work, the package should tell the local code agent:

- use current repo truth unless a committed earlier-phase artifact in the current workspace explicitly froze a different contract and that contract is still consistent with the repo

That is a safer instruction.

## 4. Some current supporting files are missing from the package’s mental model

The controller surface is not just pages and tests. Current UX and degraded-path behavior materially depend on:

- `stateDisplayHelpers.ts`
- `crossAppUrls.ts`
- responsive / failure-mode reference docs
- BIC config
- the backend `advanceRequestState` contract

If those are not named explicitly, a local code agent can still produce a superficially correct but subtly drifted implementation.

---

## Phase Order and Dependency-Flow Analysis

## Overall verdict

The six-stage flow is correct and should be preserved.

## Stage order assessment

### Stage 1 — Repo-Truth Accounting Surface Audit  
**Keep first.**  
Correct.

### Stage 2 — Queue and Detail Workflow Completion  
**Keep second.**  
Correct.

### Stage 3 — External Setup Exit and Final Controller Handoff Completion  
**Keep third.**  
Correct, but reframe away from “launch.”

### Stage 4 — Status Feedback, Audit Trail, and Controller UX Hardening  
**Keep fourth.**  
Correct.

### Stage 5 — Admin Routing and Boundary Verification  
**Keep fifth.**  
Correct.

### Stage 6 — Final Documentation Reconciliation and Readiness Report  
**Keep last.**  
Correct.

## Dependency improvements needed

- Prompt-01 should feed a more explicit implementation inventory into Prompts 02–05
- Prompt-03 should explicitly depend on Prompt-01 findings and current backend transition truth
- Prompt-05 should explicitly depend on live route and helper verification rather than generic cross-app assumptions
- Prompt-06 should explicitly classify remaining work by dependency class

---

## Gap Analysis

## Gap 1 — Prompt-03 still carries stale “launch action” framing

**Severity:** High

This is the biggest wording risk in the package because it can pull a local code agent toward the wrong lifecycle mental model.

## Gap 2 — Current helper and backend files are under-specified

**Severity:** High

The package should more explicitly name:

- `apps/accounting/src/utils/crossAppUrls.ts`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/bic-config.ts`

## Gap 3 — Controller-surface doc drift is not operationalized strongly enough

**Severity:** High

The package does not yet force a local code agent to explicitly reconcile the stale `controller-review-surface.md` approval mapping and empty-state description.

## Gap 4 — Live UI action vs valid backend transition vs system-owned progression is not explicit enough

**Severity:** Medium-High

This matters especially for:

- `AwaitingExternalSetup -> ReadyToProvision`
- `ReadyToProvision -> Provisioning`

## Gap 5 — Cross-app degraded-path behavior is not grounded in the current helper and route contract strongly enough

**Severity:** Medium

Prompt-05 is good, but it should explicitly verify the exact route target and invalid-config fallback behavior.

## Gap 6 — Canonical-copy handling should be more workspace-agnostic

**Severity:** Low-Medium

Not a workflow blocker, but worth cleaning for portability and reuse.

---

## Risk Analysis

## Primary risk

A local code agent could execute the current package and deliver a mostly good controller surface while still:

- preserving stale “launch” language
- missing the `AwaitingExternalSetup` forward-action contract details
- updating docs without reconciling the approval payload shape
- failing to verify the current degraded-path Admin routing behavior
- conflating backend-valid transitions with live UI affordances

## Secondary risk

A local code agent could over-implement Phase 3 by treating the dead-end-state issue as a reason to redesign backend lifecycle semantics instead of completing the current controller surface against the already-live contract.

## Lower-order risk

Because the controller surface already has meaningful status and audit elements, a vague Phase 3 prompt could cause redundant or parallel UX patterns rather than hardening the existing ones.

---

## Package-Quality / Execution-Readiness Assessment

## Current package status

**Assessment:** good draft, not safe enough as-is.

### Ratings

- **Objective quality:** Strong
- **Stage sequencing:** Strong
- **Repo-truth orientation:** Strong
- **Boundary discipline:** Strong
- **Current-source completeness:** Moderate
- **Lifecycle precision:** Moderate
- **Controller-surface precision:** Moderate
- **Execution safety for a local code agent:** Moderate

## Revised package status

**Assessment:** safe enough to use as the working Phase 3 package.

The revised package strengthens:

- current-state source coverage
- Prompt-03 framing
- controller-surface doc reconciliation
- backend contract alignment
- degraded-path Admin routing verification
- final readiness classification

---

## Prioritized Refinement List

## Priority 1 — Remove “launch action” framing from Prompt-03

Refocus Prompt-03 on:

- external-setup exit
- final controller handoff
- project-number capture
- automatic provisioning start
- no invented controller-side launch model

## Priority 2 — Expand the current-state source list

Explicitly add:

- `apps/accounting/src/router/routes.ts`
- `apps/accounting/src/utils/crossAppUrls.ts`
- `apps/accounting/src/utils/stateDisplayHelpers.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/bic-config.ts`
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

## Priority 3 — Force doc drift reconciliation for controller-review-surface

Require the package to reconcile:

- approval payload shape
- queue empty-state pattern
- any remaining stale lifecycle wording

## Priority 4 — Tighten Stage 1 and Stage 3 around transition semantics

Require explicit distinction between:

- what the backend allows
- what the current UI exposes
- what the system owns after controller handoff

## Priority 5 — Tighten Stage 5 around actual route and degraded-path behavior

Require explicit verification of:

- `/provisioning-oversight?projectId=...`
- `getAdminAppUrl()`
- null/invalid Admin URL degradation

## Priority 6 — Make earlier-phase dependency logic safer

Tell the local code agent to use committed earlier-phase artifacts only when they exist in the current workspace and remain consistent with current repo truth.

---

## Explicit Unresolved Questions

1. **Should the controller surface expose a dedicated forward action while in `AwaitingExternalSetup`, or should a different UX pattern be used to re-enter the approval-with-project-number step?**  
   The backend contract allows the transition, but the exact surface pattern still needs implementation choice.

2. **Should the controller detail page continue to present `ReadyToProvision` as a visible transient state, or should later UX hardening collapse that perception further while preserving the real persisted state?**  
   Current repo truth supports the persisted transient state; the UX choice could still be refined later.

3. **How aggressively should the repo reconcile or annotate living docs that are still mostly correct but now contain a few materially stale details?**  
   Phase 3 should at least neutralize the highest-risk drift, especially in the controller-review-surface doc.

---

## Final Assessment

The uploaded Phase 3 package is worth preserving. The structure is good. The order is good. The scope discipline is mostly good.

The revisions needed were mainly about **precision and implementation safety**:

- better current-state source coverage
- less ambiguous lifecycle wording
- more explicit doc-drift cleanup
- sharper verification of current controller-surface behavior
- stronger protection against a local code agent inventing a separate controller-side launch model

That is exactly what the revised package below is designed to fix.
