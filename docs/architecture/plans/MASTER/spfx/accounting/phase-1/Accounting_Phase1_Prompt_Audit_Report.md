# Accounting Phase 1 Prompt Package Audit Report

## Executive Summary

The attached Accounting Phase 1 prompt package is **mostly well-structured and directionally aligned** with the current HB Intel repo, but it is **not yet precise enough to be treated as a safe implementation guide without revision**.

The strongest parts of the package are:

- it correctly treats the live repo as the authority over the attached prompt package
- it correctly makes Phase 1 a **workflow-contract / boundary / documentation-freeze** phase rather than a broad implementation phase
- it correctly centers the major semantic fault line between `ReadyToProvision` and `Provisioning`
- it correctly identifies the importance of the current Accounting / Admin / Estimating / backend boundary
- it correctly calls out the live `AwaitingExternalSetup` posture as a material issue that later work must not hand-wave away

The main problems are not gross misunderstandings. They are **precision, completeness, and drift-control issues**:

1. the source list is missing some now-critical current-state backend files
2. the prompts do not force enough explicit reconciliation of the docs that still carry older or partially stale lifecycle language
3. the prompts do not sufficiently anchor the current auth and backend-host posture that now materially affects Project Setup behavior
4. a few prompt instructions are still vague enough that a local code agent could “freeze” a hybrid or partially stale contract instead of the actual current one
5. the README and package-level framing should be more explicit that some current living docs are themselves partially stale in detail even when they remain the right doc family to update

Bottom line:

- **Phase structure:** keep it
- **General dependency order:** keep it
- **Scope discipline:** keep it
- **Prompt wording and evidence requirements:** strengthen them
- **Required source set:** expand it
- **Drift handling:** make it more explicit and more aggressive

This revised package is designed to preserve the good structure while making the execution safer.

---

## Current Repo-Truth Workflow and Backend Summary

### 1. Authority hierarchy is clear in the repo

The current-state map explicitly says that `docs/architecture/blueprint/current-state-map.md` is the canonical present-truth source when current implementation facts conflict with older plans or historical docs. It also classifies the relevant current living surface docs and current package files that govern the Project Setup workflow today.

### 2. The Accounting controller surface is real and bounded

The Accounting app currently has:

- `ProjectReviewQueuePage.tsx`
- `ProjectReviewDetailPage.tsx`

The queue is tabbed by:

- `UnderReview`
- `NeedsClarification`
- `AwaitingExternalSetup`
- `Failed`

The detail page currently exposes these user actions:

- approve request
- request clarification
- place on hold
- send to admin (only when failed)

That means Accounting is a **controller review and handoff surface**, not a full recovery surface.

### 3. Approval currently requires a project number and uses `ReadyToProvision`

The current detail page does **not** approve with a bare state change. It collects a `projectNumber`, validates it against `##-###-##`, and then calls:

- `advanceState(requestId, 'ReadyToProvision', { projectNumber })`

That means any lifecycle documentation or prompt wording that talks about approve as a generic approval action without the project-number requirement is materially incomplete.

### 4. The backend currently auto-triggers the provisioning saga from approval

This is the most important lifecycle fact for this audit.

`backend/functions/src/functions/projectRequests/index.ts` currently does all of the following in the `advanceRequestState` handler:

- validates the requested transition
- resolves caller role from JWT app-role claims + ownership rules
- requires a valid `projectNumber` for `ReadyToProvision`
- persists the updated request
- when the new state is `ReadyToProvision`, constructs an `IProvisionSiteRequest`
- instantiates `SagaOrchestrator`
- fire-and-forget executes the saga
- skips the auto-trigger if provisioning status already exists and is not failed

So the repo truth is:

- the controller-side approval action sets `ReadyToProvision`
- the backend immediately auto-triggers the saga from that approval event
- the saga then owns the system-side progression into actual provisioning execution

### 5. The lifecycle model still explicitly contains both `ReadyToProvision` and `Provisioning`

The current package-level and backend lifecycle engines still define:

- `ReadyToProvision`
- `Provisioning`

as separate states, with `ReadyToProvision -> Provisioning` still present in the transition model.

So the correct present-truth explanation is **not** “`ReadyToProvision` no longer exists in practice.”  
It does exist in practice. But it now functions as an **approval-triggered handoff state that immediately auto-starts saga execution**, not as a long-lived controller-held launch gate.

### 6. System ownership is explicit for `ReadyToProvision` and `Provisioning`

`packages/provisioning/src/bic-config.ts` currently resolves both of these states to `null` owner:

- `ReadyToProvision`
- `Provisioning`

That is important because it means the shared ownership model already treats those states as system-owned rather than controller-owned human work states.

### 7. `AwaitingExternalSetup` remains in the lifecycle and queue model

The current lifecycle model still allows:

- `UnderReview -> AwaitingExternalSetup`
- `AwaitingExternalSetup -> ReadyToProvision`

The Accounting queue still has an `Awaiting External Setup` tab.

The BIC config still describes that state as blocked by external prerequisites.

But the current detail page does **not** expose a forward action from `AwaitingExternalSetup` to `ReadyToProvision`.

That is a real present-state gap between lifecycle contract and live UI affordance, and the prompt package is right to center it.

### 8. Admin recovery is already clearly separated from Accounting

The Admin oversight surface is currently the authoritative recovery surface for:

- force retry
- archive
- acknowledge escalation
- manual state override
- expert-tier diagnostics

The current-state map and admin-recovery-boundary reference both support that separation.

### 9. Estimating coordinator recovery remains limited and bounded

The Estimating coordinator surface handles limited retry / escalation behavior for failed provisioning, but it is not the authoritative admin recovery surface.

That means the Phase 1 package should preserve a three-way distinction:

- Accounting: review / approve / clarify / hold / route
- Estimating: requester visibility + bounded clarification / retry / escalation
- Admin: true operational recovery and override
- Backend / shared package: actual system transitions and orchestration

### 10. Current backend posture is more mature than the package source list implies

The backend no longer reflects only the older PH6-style posture. Current Project Setup behavior materially depends on:

- `withAuth()` wrapper
- JWT app-role and ownership authorization
- the project-setup domain host service factory
- current connected-service posture
- current role-based auth model that no longer uses env-var allowlists for authorization

That means the Phase 1 prompts must review more than just `projectRequests/index.ts` and `state-machine.ts`.

---

## Confirmed Accounting Prompt-Package Facts

The attached package currently does several things well.

### Confirmed strengths

- It correctly defines Phase 1 as a contract-freeze and documentation-reconciliation phase rather than a broad implementation phase.
- It correctly prioritizes live code and tests over historical docs.
- It correctly identifies `ReadyToProvision` versus `Provisioning` as a key semantic problem.
- It correctly highlights `AwaitingExternalSetup`.
- It correctly preserves Accounting / Admin / Estimating / backend boundary analysis as a first-order requirement.
- It correctly asks for a final closure report before later phases begin.

### Confirmed weaknesses

- It omits some files that are now material to current backend truth:
  - `backend/functions/src/hosts/project-setup/service-factory.ts`
  - `backend/functions/src/middleware/auth.ts`
  - `backend/functions/src/middleware/authorization.ts`
- It does not force enough direct reconciliation of docs already known to be partially stale in detail:
  - `docs/reference/spfx-surfaces/controller-review-surface.md`
  - `docs/reference/workflow-experience/setup-notification-registrations.md`
  - `docs/reference/provisioning/notification-event-matrix.md`
  - `docs/reference/provisioning/request-lifecycle.md`
  - `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- It uses one machine-specific canonical-copy note in the README that should be made repo-relative and environment-agnostic.
- It does not explicitly require the agent to separate:
  - current live action
  - valid backend-authorized transition
  - current UI omission / gap
- It does not explicitly require lifecycle freeze text to incorporate the **project-number capture requirement on approval**
- It does not explicitly require the agent to reconcile the current auth posture:
  - app-role based authz
  - `oid` ownership fallback
  - env vars used for notification routing only, not authorization

---

## Prompt-Package ↔ Repo Alignment Analysis

## 1. Package objective vs repo truth

**Assessment:** aligned, but needs tighter precision.

The package objective is correct: audit the accounting-side prompts against live repo truth and current backend configuration, then refine them so a local code agent does not implement stale semantics.

That is exactly the right objective for the current repo state.

## 2. Package workflow framing vs repo truth

**Assessment:** broadly aligned.

The package correctly frames these issues as needing explicit freeze:

- current lifecycle semantics
- provisioning trigger semantics
- surface boundaries
- validation / evidence expectations
- authoritative doc reconciliation

That matches the current repo.

## 3. Package lifecycle framing vs repo truth

**Assessment:** mostly aligned, but the wording should get sharper.

What is already correct:

- the package understands that the backend auto-starts provisioning from approval to `ReadyToProvision`
- the package understands that `Provisioning` is system-owned
- the package understands that older docs may still imply a distinct later launch action

What still needs tightening:

- the prompts should explicitly require the agent to explain that the approval action includes **project-number capture**
- the prompts should explicitly require the agent to preserve the fact that `ReadyToProvision` remains a real modeled state even though it is now an auto-triggered handoff state
- the prompts should explicitly require the agent to distinguish:
  - lifecycle model
  - backend handler behavior
  - BIC owner semantics
  - current UI affordances

## 4. Package boundary framing vs repo truth

**Assessment:** aligned, but underspecified in one key place.

The package is right to ask:

- what Accounting owns
- what Estimating owns
- what Admin owns
- what backend orchestration owns
- what the shared package owns

But it needs an additional explicit boundary question:

- which transitions are **valid and controller-authorized in backend contract terms** but **not currently exposed as live Accounting UI actions**

Without that question, the agent may freeze a false equivalence between “allowed by lifecycle model” and “implemented in current Accounting UI.”

`AwaitingExternalSetup -> ReadyToProvision` is the clearest example.

## 5. Package backend-configuration framing vs repo truth

**Assessment:** partially aligned, incomplete source set.

The package already points to the connected-service posture doc, which is good.

But the source list should also force review of:

- project-setup domain service factory
- current auth wrapper
- current authorization middleware

Those files are no longer peripheral. They materially define how the backend behaves in production posture terms.

## 6. Package doc-reconciliation framing vs repo truth

**Assessment:** aligned but not aggressive enough.

The package correctly calls for doc reconciliation.  
What it does not do strongly enough is force the agent to explicitly classify some specific docs that are now known to be risky.

The revised prompts should explicitly require classification and reconciliation of:

- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`

---

## Stale-Assumption and Authority-Drift Analysis

## 1. Historical PH6 drift remains real

`PH6.8-RequestLifecycle-StateEngine.md` still contains language that reads as if `ReadyToProvision` is where the controller can later trigger provisioning, including notification wording that says the controller is notified they can trigger.

That is not the best current explanation anymore.

It is still useful as historical evidence and partial lineage, but it is not safe as present-truth authority for lifecycle semantics.

## 2. Notification docs still contain stale or incomplete lifecycle wording

Two notification docs are especially risky:

### `docs/reference/workflow-experience/setup-notification-registrations.md`

This still says:

- `ready-to-provision` = request reviewed, ready for external setup and provisioning trigger
- fired when external setup complete, provisioning queued

That no longer cleanly matches the current repo behavior where controller approval to `ReadyToProvision` auto-triggers the saga.

### `docs/reference/provisioning/notification-event-matrix.md`

This is older in multiple ways:

- still framed as an 8-event contract
- still references env-var controller/admin recipients as if that were the main resolution model
- still uses older notification-tier/channel assumptions
- does not reflect the newer separation between notification routing and authorization

This doc is a strong drift source and should be explicitly downgraded or annotated.

## 3. The current controller surface doc is authoritative in family, but partially stale in detail

`docs/reference/spfx-surfaces/controller-review-surface.md` is still the correct living reference family for the Accounting surface, but its action mapping is not fully current.

It says approve is:

- `advanceState(id, 'ReadyToProvision')`

But the actual detail page requires:

- `advanceState(requestId, 'ReadyToProvision', { projectNumber })`

That is a meaningful contract detail because approval is not valid without the project number.

## 4. The lightweight request-lifecycle reference is incomplete for current production posture

`docs/reference/provisioning/request-lifecycle.md` is not wildly wrong, but it is too thin for the current Project Setup contract.

It lacks:

- role-auth behavior
- auto-trigger explanation
- system ownership explanation
- `AwaitingExternalSetup` live-surface gap
- explicit separation of user transition vs saga/system transition

It is therefore useful but incomplete.

## 5. The package README currently overcommits on canonical-copy certainty

The current README includes a machine-specific duplicate-copy statement.

That is not ideal for a reusable prompt package that may run in a different workspace or a fresh local checkout.

The revision should keep the canonical-copy check but make it:

- repo-relative
- workspace-agnostic
- evidence-based rather than machine-path-specific

---

## Phase Order and Dependency-Flow Analysis

## Overall verdict

The six-prompt sequence is correct and should be preserved.

## Prompt order assessment

### Prompt-01 — Repo-Truth Workflow Contract Audit  
**Keep first.**  
This is the correct starting point.

### Prompt-02 — Request Lifecycle and Provisioning Trigger Freeze  
**Keep second.**  
Lifecycle semantics should freeze before boundary docs are reconciled.

### Prompt-03 — Application Boundary and Role Responsibility Freeze  
**Keep third.**  
This depends on Prompt-01 and Prompt-02 outputs.

### Prompt-04 — Validation, Audit, and Evidence Contract Freeze  
**Keep fourth.**  
This depends on the frozen workflow and ownership model.

### Prompt-05 — Authoritative Documentation Reconciliation  
**Keep fifth.**  
This should happen after the actual decisions are frozen, not before.

### Prompt-06 — Final Closure and Readiness Report  
**Keep last.**  
Correct.

## Dependency-flow improvements needed

The ordering is good, but several prompts should explicitly depend on newly added source files and freeze decisions:

- Prompt-01 should capture auth/service posture and doc drift inventory
- Prompt-02 should freeze the exact approval→auto-trigger→system-progression explanation
- Prompt-03 should explicitly classify missing UI affordances vs valid transition rights
- Prompt-04 should include role/auth evidence expectations
- Prompt-05 should explicitly reconcile the known drift docs
- Prompt-06 should verify that the revised package eliminates the identified drift risks

---

## Gap Analysis

## Gap 1 — Missing backend-host posture sources in the prompt package

**Severity:** High

The current prompt package does not force review of:

- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`

These now materially define:

- domain host selection
- auth wrapping
- JWT app-role authorization
- ownership fallback
- notification env vars vs authz separation

## Gap 2 — Inadequate reconciliation of known drift docs

**Severity:** High

The package references drift sources generally, but it does not explicitly force classification of the known risky docs listed above.

That leaves too much room for a local agent to “review broadly” without actually neutralizing the highest-risk stale guidance.

## Gap 3 — Approval semantics are not frozen precisely enough

**Severity:** High

The current package does not force the lifecycle freeze to explicitly include:

- project-number capture
- approval call shape
- auto-trigger guard conditions
- fire-and-forget saga initiation
- distinction between persisted request state and provisioning-status existence

## Gap 4 — `AwaitingExternalSetup` gap is identified but not operationalized tightly enough

**Severity:** Medium-High

The package recognizes the gap, but it should explicitly require the agent to decide and document:

- current valid backend transition from that state
- current live Accounting UI affordance from that state
- whether the absence of a forward action is a documented gap vs an intended boundary
- what later phases must assume until the gap is resolved

## Gap 5 — Auth posture is under-specified in Prompt-04 and Prompt-05

**Severity:** Medium

The current package is focused on lifecycle and validation, but current production-readiness posture is materially shaped by:

- claims-based authz
- delegated scope
- app-only workload rules
- ownership checks
- notification env vars used only for recipient routing

This does not need to dominate Phase 1, but it must be anchored well enough that later docs do not regress to env-var allowlist assumptions.

## Gap 6 — Package README uses environment-specific copy claims

**Severity:** Low-Medium

This is not a contract blocker, but it weakens portability and makes the package less clean as a reusable implementation guide.

---

## Risk Analysis

## Primary execution risk

A local code agent could execute the current package and produce a documentation set that is **mostly right but still not safe**, because it could:

- preserve older “controller later triggers provisioning” phrasing in some docs
- miss that current approve flow requires project-number capture
- miss current auth/service-factory posture
- treat valid lifecycle transitions as equivalent to currently exposed Accounting actions
- classify older notification docs too gently

That would create a dangerous false sense of closure.

## Secondary risk

The current package could allow the agent to reconcile docs without explicitly cleaning up the highest-risk drift sources, leaving future phases exposed to contradictory instructions.

## Lower-order risk

The package could also overcorrect and rewrite too broadly if the prompts are not explicit enough about:

- preferring docs updates over behavior changes
- preserving ambiguity where it is real
- avoiding speculative implementation in Phase 1

---

## Package-Quality / Execution-Readiness Assessment

## Current package status

**Assessment:** usable as a draft, not safe enough as-is for strict execution.

### Ratings

- **Objective quality:** Strong
- **Phase structure:** Strong
- **Order / dependency flow:** Strong
- **Repo-truth orientation:** Strong
- **Source-list completeness:** Moderate
- **Drift-control precision:** Moderate
- **Backend posture precision:** Moderate
- **Boundary precision:** Moderate
- **Execution safety for a local code agent:** Moderate

## Revised package status

**Assessment:** safe enough to use as the working Phase 1 package.

The revised package strengthens:

- current-source coverage
- exact lifecycle freeze questions
- auth/service posture anchoring
- explicit drift-doc reconciliation
- UI-gap vs backend-contract separation
- final closure verification

---

## Prioritized Refinement List

## Priority 1 — Expand the required current-state source set

Add:

- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

## Priority 2 — Force explicit reconciliation of known drift docs

Require direct classification of:

- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`

## Priority 3 — Tighten lifecycle freeze wording

Require the freeze to explicitly answer:

- what exact approve action the Accounting detail page performs
- what exact backend event auto-triggers the saga
- what exact role `ReadyToProvision` still serves in the persisted lifecycle
- how `ReadyToProvision` and `Provisioning` differ in current contract terms

## Priority 4 — Tighten `AwaitingExternalSetup` analysis

Require the agent to separate:

- valid transition in lifecycle contract
- current controller authorization
- current live Accounting UI affordance
- unresolved UI gap or carry-forward note

## Priority 5 — Tighten auth / backend posture anchoring

Require the revised prompts to explicitly preserve:

- claims-based role resolution
- ownership fallback
- notification env vars are not authz
- domain-scoped service factory posture

## Priority 6 — Clean up package portability

Make canonical-copy checks repo-relative and workspace-agnostic.

---

## Explicit Unresolved Questions

These are not blockers to revising the package, but they should remain explicit in the audit.

1. **Should `AwaitingExternalSetup -> ReadyToProvision` remain an Accounting-surface action in the intended future UX, or move to another operational surface once external prerequisites are complete?**  
   Current backend and lifecycle contract allow it; current Accounting UI does not expose it.

2. **Should `ReadyToProvision` remain visible as a durable UI state at all once the auto-trigger explanation is fully reconciled, or should later phases treat it as a short-lived but still persisted handoff state?**  
   Current repo truth supports the latter description, but a future UX simplification decision could still be made.

3. **How aggressively should the repo retain legacy notification docs that are still useful as historical evidence but materially stale in present-state terms?**  
   Phase 1 should classify them; later documentation governance may decide whether to annotate or retire them.

---

## Final Assessment

The attached package is **worth preserving**, but it needed revision before execution.

The revised package included with this audit keeps the good structure and raises the precision bar in the specific places the current repo now requires:

- lifecycle trigger semantics
- current Accounting / Admin / Estimating / backend boundary
- `AwaitingExternalSetup` contract vs UI gap
- auth / service-factory posture
- explicit stale-doc neutralization

That is the right shape for a safe Phase 1 package.
