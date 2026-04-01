# Accounting Phase 2 Prompt Package Audit Report

## Objective

Audit the attached **Phase 2 — Backend Lifecycle Hardening** prompt package against current repo truth, then refine the package so a local code agent executing Phase 2 will harden the backend against the **actual** Project Setup lifecycle, provisioning trigger model, run/status persistence model, and current Accounting compatibility constraints.

## Executive Summary

The attached Phase 2 package is directionally strong. Its overall sequence is correct, its backend-first posture is appropriate, and it already aims at the right repo zones: request lifecycle, saga orchestration, validation, idempotency, operational status, and Accounting compatibility.

The package still needed refinement in five important areas:

1. it did not clearly distinguish **request-state lifecycle** from **provisioning-run status lifecycle**
2. it treated “one launch event” too loosely and risked collapsing:
   - controller approval auto-launch
   - direct provisioning endpoint launch
   - admin retry / recovery paths
3. it under-specified some current authoritative files, especially:
   - `backend/functions/src/middleware/authorization.ts`
   - `apps/accounting/src/router/routes.ts`
   - package-level script definitions used in verification
4. it left room to overstate server-side **project-number uniqueness** and **launch-response richness** beyond what current code actually guarantees
5. it retained a machine-specific package-copy statement in the README and a meta-deliverable ambiguity in the implementation plan

I rebuilt the package so the local code agent is more likely to produce Phase 2 work that aligns with the live repo instead of older PH6-era simplifications.

---

## Current Repo-Truth Backend Summary

The current repo shows the following backend and Accounting-side behavior:

- Accounting approval currently calls `advanceState(requestId, 'ReadyToProvision', { projectNumber })`, and the detail page presents this as approval that starts provisioning automatically.
- The backend `PATCH /api/project-setup-requests/{requestId}/state` handler validates the transition, validates project-number format when entering `ReadyToProvision`, persists the request update, and then auto-starts the saga if there is no existing provisioning status or the latest status is `Failed`.
- `SagaOrchestrator.execute()` immediately persists a durable provisioning status record keyed by `projectId` + `correlationId`, then reconciles the request record into `Provisioning`.
- The saga later reconciles the request to `Completed` or `Failed` and persists ongoing step/status updates to Table Storage.
- Admin recovery endpoints already exist for:
  - run listing
  - retry
  - archive
  - escalation acknowledgment
  - manual status override
- The Accounting UI still has a real `AwaitingExternalSetup` gap: the queue supports the state, but the detail page does not expose a forward action from that state.
- Current repo truth contains a meaningful distinction between:
  - **request-state lifecycle**
  - **provisioning-run lifecycle / overallStatus**
  These must not be flattened into one model during Phase 2 hardening.

---

## Confirmed Package Strengths

### 1. Correct phase intent

The original package correctly treated Phase 2 as an implementation-forward backend hardening phase rather than a Phase 1-style contract-only pass.

### 2. Correct macro sequence

The six-stage sequence is still right:

1. repo-truth audit
2. launch/lifecycle contract remediation
3. validation/idempotency hardening
4. run/status/observability hardening
5. Accounting compatibility verification
6. final documentation reconciliation and closure

### 3. Correct authority posture

The package already gave appropriate precedence to:

1. live repo code and tests
2. `current-state-map.md`
3. living reference docs
4. PH6 and older MVP plans as historical drift inputs

That core authority model remains sound.

---

## Prompt-Package ↔ Repo Alignment Analysis

## File-by-file assessment

### `Phase-2_Backend-Lifecycle-Hardening_Implementation-Plan.md`

**Assessment:** Strong structure, but needed sharper framing.

**What was right**
- Backend-authoritative goal is correct.
- Current repo-truth summary is broadly accurate.
- Staged implementation order is correct.

**What needed revision**
- The plan did not clearly separate:
  - request-state lifecycle
  - provisioning-run / status lifecycle
- The deliverables section referenced a package-audit artifact that should not be treated as an in-repo implementation deliverable for the local code agent.
- The acceptance criteria needed to explicitly require that controller auto-launch, direct provisioning endpoint behavior, and admin retry/recovery remain distinguishable.
- Required inputs needed to include authorization and router files that materially affect boundary and compatibility truth.

### `Prompt-01_Phase-2-Backend-Lifecycle-Repo-Truth-and-Gap-Audit.md`

**Assessment:** Good backbone, but missing some critical audit angles.

**What was right**
- Good audit-first discipline.
- Good emphasis on contradictions and stale authority paths.
- Good requirement to produce a Phase 2 report if it does not yet exist.

**What needed revision**
- It did not explicitly require the agent to distinguish request-state lifecycle from provisioning-run lifecycle.
- It omitted `backend/functions/src/middleware/authorization.ts`.
- It did not explicitly inspect Accounting routing and package scripts.
- It did not ask the agent to compare:
  - controller approval auto-launch
  - direct `provision-project-site`
  - admin retry/recovery entry points

### `Prompt-02_Phase-2-Backend-State-Transition-and-Launch-Contract-Remediation.md`

**Assessment:** Most important prompt in the package; also the one with the most risk of accidental oversimplification.

**What was right**
- Correctly starts from current repo truth.
- Correctly treats any reversal away from current semantics as a deliberate architecture change.
- Correctly centers the controller approval → `ReadyToProvision` → auto-start path.

**What needed revision**
- “Exactly one unambiguous provisioning launch event” needed clarification.
  The repo has:
  - a controller-facing approval-triggered launch path
  - a direct provisioning endpoint
  - admin retry/recovery paths
  The right Phase 2 goal is one unambiguous **controller-facing** launch contract, while explicitly classifying the other launch entry points rather than pretending they do not exist.
- The prompt needed to explicitly prohibit flattening admin retry into the request-state graph.

### `Prompt-03_Phase-2-Backend-Validation-Idempotency-and-Uniqueness-Hardening.md`

**Assessment:** Sound direction, but uniqueness language needed tightening.

**What was right**
- Strong backend-authoritative posture.
- Good emphasis on transition guards and duplicate-run prevention.
- Good caution against overstating downstream safeguards.

**What needed revision**
- Needed explicit wording that **project-number uniqueness** must only be claimed if current backend lifecycle code or the authoritative repository layer actually performs the check.
- Needed stronger instruction to record a gap honestly if uniqueness remains external, partial, or not yet implemented.
- Needed stronger emphasis on evidence for blocked launch attempts and conflict responses.

### `Prompt-04_Phase-2-Provisioning-Run-Status-Correlation-and-Observability-Hardening.md`

**Assessment:** Good scope, but needed more precise response-contract framing.

**What was right**
- Correct focus on durable status over UI state.
- Correct emphasis on correlation, diagnostics, and operational evidence.
- Good attention to admin run/status surfaces.

**What needed revision**
- Needed to distinguish:
  - controller approval response contract
  - direct provisioning endpoint response contract
  - durable status lookup contract
- The current controller path does **not** return a run reference from the `PATCH /state` response; it returns the updated request while the durable status record is created asynchronously. The prompt needed to force the agent to either:
  - preserve and document that contract honestly, or
  - deliberately extend it
- Needed to force review of current persisted fields versus fields implied by admin routes or docs.

### `Prompt-05_Phase-2-Accounting-Workflow-Compatibility-and-Contract-Verification.md`

**Assessment:** Mostly solid, but needed a little more route and semantics precision.

**What was right**
- Correctly treated this as a compatibility pass, not a redesign phase.
- Correctly isolated Phase 3 follow-up work.

**What needed revision**
- Needed explicit review of:
  - current `/project-review` route contract
  - current success toasts / banners / action wording under auto-trigger semantics
  - `AwaitingExternalSetup` as a backend-safe but UI-incomplete path
- Needed to make “no new explicit launch button unless Phase 2 deliberately changes the contract” even more explicit.

### `Prompt-06_Phase-2-Final-Documentation-Reconciliation-and-Readiness-Report.md`

**Assessment:** Strong closure structure.

**What was right**
- Good closure matrix.
- Good stale-doc classification behavior.
- Good separation of Phase 3 follow-up and external dependencies.

**What needed revision**
- Needed to require explicit classification of stale docs that are especially risky for this phase, including:
  - `PH6.11-Accounting-App.md`
  - `docs/maintenance/provisioning-runbook.md`
  - `docs/reference/provisioning/state-machine.md`
- Needed to require explicit closure statements for the request-state vs provisioning-run distinction.

### `README_Phase-2-Backend-Lifecycle-Hardening.md`

**Assessment:** Good baseline summary, but one machine-specific statement had to be fixed.

**What was right**
- Good summary of current repo-truth baseline.
- Good domain-boundary framing.
- Good execution order.

**What needed revision**
- Replace `/Users/bobbyfetting/hb-intel` style package-copy language with repo-relative copy guidance.
- Add explicit distinction between request lifecycle and provisioning-run lifecycle.
- Add explicit note that current docs and runbooks contain drift that Phase 2 must reconcile.

---

## Stale-Assumption / Authority-Drift Findings

The repo currently contains meaningful drift that the revised package now directs the agent to handle more explicitly.

### 1. Request state machine vs provisioning recovery path drift

The backend request state machine still defines `Failed -> UnderReview` as the valid request transition path, while the provisioning state-machine reference doc describes `Failed -> Provisioning` for admin retry. That is not the same plane of state and should not be treated as one unified request-state graph.

### 2. Runbook drift

The current runbook still describes operational steps in ways that do not cleanly match current routes, current admin surface ownership, or current persistence details.

### 3. PH6.11 drift

`PH6.11-Accounting-App.md` still describes a controller-side “Complete Project Setup” launch interaction that no longer matches the current Accounting detail page and backend auto-trigger semantics.

### 4. Launch-contract ambiguity risk

Without refinement, Prompt-02 could encourage an agent to erase valid distinctions between:
- approval-triggered launch
- direct provisioning endpoint launch
- retry/recovery launch

---

## Phase Order / Dependency-Flow Analysis

The original phase order is correct and I preserved it.

The main dependency clarification I added is this:

- Prompt-01 must produce a baseline that explicitly separates **request-state** truth from **run/status** truth
- Prompt-02 must freeze the controller-facing launch contract **without** accidentally rewriting admin recovery semantics
- Prompt-03 and Prompt-04 then harden the two different layers:
  - request validation / trigger / idempotency
  - durable run/status / correlation / supportability
- Prompt-05 verifies the live Accounting surface against the frozen backend contract, not against PH6 UI assumptions
- Prompt-06 closes the loop by reclassifying stale docs and explicitly separating Phase 3 UI work from completed backend work

---

## Risk Analysis

## Highest risks if the original package were executed without revision

### Risk 1 — lifecycle flattening

A local code agent could conflate request-state transitions with provisioning-status transitions and inadvertently codify the wrong model.

### Risk 2 — launch-path flattening

A local code agent could over-correct toward a single launch path in a way that breaks valid admin/manual entry points or documents them incorrectly.

### Risk 3 — overstated uniqueness and launch-response claims

A local code agent could claim Phase 2 implemented project-number uniqueness or rich launch response payloads without actually grounding that in the current repository and persistence layer.

### Risk 4 — PH6.11 / runbook recontamination

A local code agent could preserve older controller-launch wording or older ops guidance because the package did not explicitly force those docs into the stale-authority set.

### Risk 5 — package-copy and deliverable ambiguity

The original README and implementation plan could send the agent toward machine-specific assumptions or unnecessary meta artifacts.

---

## Package-Quality / Execution-Readiness Assessment

**Original package quality:** Good  
**Original package execution safety:** Moderate  
**Revised package execution safety:** High

Why the revised package is safer:

- it preserves the good phase structure
- it sharpens the exact lifecycle distinctions the agent must respect
- it makes repo-truth source review more complete
- it reduces the chance of false closure around uniqueness, launch response, or retry semantics
- it removes packaging ambiguity unrelated to the actual backend hardening work

---

## Prioritized Refinement List

1. clarify request-state lifecycle versus provisioning-run lifecycle everywhere it matters
2. refine Prompt-02 so “one unambiguous launch contract” means the controller-facing approval path, not a flattening of all backend launch entry points
3. tighten uniqueness/idempotency wording to prevent overclaiming
4. tighten Prompt-04 so launch-response hardening is grounded in the actual current async/durable-status model
5. add missing repo-truth files:
   - `backend/functions/src/middleware/authorization.ts`
   - `apps/accounting/src/router/routes.ts`
   - package script files where verification matters
6. remove machine-specific package-copy wording from the README
7. remove or reframe the implementation-plan meta-deliverable so the local code agent is not asked to create an unnecessary prompt-package-audit artifact inside the repo

---

## Explicit Unresolved Questions

These remain appropriate open questions for the actual Phase 2 implementation work:

1. Should Phase 2 add server-side project-number uniqueness enforcement inside the request lifecycle path, or should it only document that this remains an external / repository-layer gap?
2. Should the controller approval `PATCH /state` response remain request-only with durable-status lookup handled separately, or should Phase 2 deliberately extend the contract to return run metadata?
3. Should the direct `POST /provision-project-site` endpoint remain as-is for non-controller / operational entry points, or should it be narrowed and reclassified more explicitly in docs?
4. Should admin retry continue to reconcile request state directly via saga execution, or should Phase 2 introduce a more explicit request-state recovery bridge?

---

## Files Reviewed During This Audit

### Attached prompt-package files
- `Phase-2_Backend-Lifecycle-Hardening_Implementation-Plan.md`
- `Prompt-01_Phase-2-Backend-Lifecycle-Repo-Truth-and-Gap-Audit.md`
- `Prompt-02_Phase-2-Backend-State-Transition-and-Launch-Contract-Remediation.md`
- `Prompt-03_Phase-2-Backend-Validation-Idempotency-and-Uniqueness-Hardening.md`
- `Prompt-04_Phase-2-Provisioning-Run-Status-Correlation-and-Observability-Hardening.md`
- `Prompt-05_Phase-2-Accounting-Workflow-Compatibility-and-Contract-Verification.md`
- `Prompt-06_Phase-2-Final-Documentation-Reconciliation-and-Readiness-Report.md`
- `README_Phase-2-Backend-Lifecycle-Hardening.md`

### Repo-truth files reviewed
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/state-machine.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/hosts/project-setup/index.ts`
- `backend/functions/src/hosts/project-setup/service-factory.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/authorization.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/state-machine.ts`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/router/routes.ts`
- `apps/accounting/package.json`
- `backend/functions/package.json`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/developer/project-setup-connected-service-posture.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/provisioning/notification-event-matrix.md`
- `docs/reference/workflow-experience/setup-notification-registrations.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- `docs/architecture/plans/PH6.11-Accounting-App.md`

---

## Result

The revised package keeps the original six-stage structure, but it is more precise, more evidence-driven, and less likely to steer a local code agent into stale lifecycle assumptions or overstated backend claims.
