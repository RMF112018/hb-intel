# Accounting Phase 4 Prompt Package Audit Report

## Executive Summary

The attached **Phase 4 — Provisioning Status and Saga Interaction Hardening** package is **directionally strong and sequenced well**, but it is **not precise enough to be used safely as-is** against the current HB Intel repo.

The package gets the big picture right:

- it focuses on the asynchronous execution-read boundary rather than broad lifecycle redesign
- it correctly treats durable status, SignalR, polling, retry, failure, and surface compatibility as the main concerns
- it uses a sensible stage order
- it keeps repo truth ahead of prompt-package assumptions

The main problems are **precision and repo-fit**, not overall shape.

### Bottom-line assessment

- **Phase structure:** keep
- **Prompt order:** keep
- **High-level objective:** keep
- **Scope discipline:** mostly keep
- **Repo-truth source list:** expand
- **Status-model wording:** tighten
- **Surface-consumer framing:** correct
- **Failure/retry/admin-action coverage:** strengthen

The live repo already implements a fairly specific provisioning-status model. The current prompt package is too abstract in a few places and risks steering a local code agent toward the wrong hardening target.

The biggest examples are:

1. it sometimes implies a **single durable status resource** where the repo currently persists **one status row per run** and exposes the **latest run as the project-level read model**
2. it overstates **Accounting** as a direct provisioning-status consumer when the live repo shows that **Admin is a direct consumer** and **Accounting is primarily an indirect consumer via request-state reconciliation and banner text**
3. it under-specifies the admin-side mutations that can create **request/status drift** if not deliberately audited
4. it does not force enough attention on the **actual client realtime seam** (`useProvisioningSignalR`, store merge, requester-facing progress view)

The revised package below preserves the useful structure while making the prompts safer and more repo-accurate.

---

## Current Repo-Truth Baseline

## 1. The authoritative status model is already concrete

The current model definitions already specify the provisioning status contract in detail, including:

- `projectId`
- `correlationId`
- `overallStatus`
- `currentStep`
- `steps`
- `startedAt`, `completedAt`, `failedAt`
- `step5DeferredToTimer`
- `step5TimerRetryCount`
- `retryCount`
- escalation and failure-class fields

That means Phase 4 should start from an **existing concrete status contract**, not from a blank design space.

## 2. Physical persistence is per-run, not one-row-per-project

The current Azure Table adapter stores provisioning status with:

- `PartitionKey = projectId`
- `RowKey = correlationId`

The adapter then exposes:

- `getProvisioningStatus(projectId)` as an alias to `getLatestRun(projectId)`
- `getLatestRun(projectId)` by selecting the latest row by `startedAt`
- `listAllRuns(status?)` across all persisted runs
- `listFailedRuns()`
- `listPendingStep5Jobs()`

This is critical.

The repo does **not** currently persist a single mutable status row keyed only by project.  
It persists **one durable status entity per run**, while offering a **latest-run project view** for project-scoped reads.

Phase 4 prompts must not accidentally force a local code agent to “fix” that into a different architecture unless the repo truth and decision record explicitly require such a change.

## 3. Saga launch already creates a durable run record and reconciles request state

The current saga orchestrator:

- creates an `IProvisioningStatus` object at saga start
- immediately upserts it to table storage
- reconciles the linked project setup request to `Provisioning`
- pushes best-effort SignalR progress events
- updates status after each step
- reconciles the request again on success/failure
- closes SignalR groups on terminal outcomes

The request-approval handler also auto-triggers the saga when a controller advances a request to `ReadyToProvision`.

So the core status/write/read loop already exists. Phase 4 should **harden and clarify it**, not invent it.

## 4. Retry creates a new run identity

The retry path currently:

- loads the latest status by `projectId`
- increments `retryCount`
- creates a new provisioning request with a **new `correlationId`**
- launches `execute()` again

So retry semantics already mean **new run identity under the same project**.

That is another reason Prompt-02 must not speak as though there is only one physical status record.

## 5. Timer-driven Step 5 follow-on is already part of the durable status contract

The timer handler already:

- queries deferred jobs via `step5DeferredToTimer` + `overallStatus === 'WebPartsPending'`
- retries Step 5
- preserves timer retry count
- sets `Completed`, `Failed`, or keeps `WebPartsPending`
- reconciles request state on terminal timer success/failure
- pushes best-effort SignalR updates

So Phase 4 must explicitly include timer follow-on behavior as part of the real status model.

## 6. SignalR is already best-effort, not the sole source of truth

The backend SignalR push service is already written as a best-effort enhancement layer:

- saga and timer pushes are wrapped in non-critical / catch-and-warn paths
- completion/failure cleanup closes project SignalR groups
- negotiate returns project group membership and optional admin group membership

The frontend `useProvisioningSignalR` hook already includes:

- automatic reconnect
- connection-state tracking
- store updates through `handleProgressEvent`

The requester-facing progress view already treats API status as the baseline and realtime as an overlay.

That means the package is right to focus on authoritative polling/status reads — but it should name the **actual live seams**, not speak only in generalities.

## 7. Direct vs indirect status consumers are different in the live repo

This is one of the most important repo-truth corrections for the package.

### Direct status consumers today

- backend admin routes read and mutate durable provisioning status
- `ProvisioningOversightPage` directly consumes provisioning-status APIs
- requester/PWA progress surfaces directly consume status API + SignalR/store

### Indirect compatibility consumer today

- `ProjectReviewDetailPage` in Accounting does **not** directly fetch provisioning status or SignalR
- instead, it consumes project setup request state and shows request-state-compatible lifecycle banners (`ReadyToProvision`, `Provisioning`, `Completed`, `Failed`)

So Phase 4 cannot honestly treat Accounting and Admin as symmetrical status consumers.

Admin is a **direct status consumer**.  
Accounting is an **indirect compatibility surface** whose request-state messaging and boundary behavior must remain aligned with provisioning truth.

## 8. Admin-side status mutations create a real drift-risk area

The current admin-side routes mutate durable provisioning status directly:

- `archiveFailure`
- `acknowledgeEscalation`
- `forceStateTransition`

But unlike saga/timer completion and failure paths, these routes do not clearly reconcile the linked project setup request record.

That is a real Phase 4 concern.

The current package mentions retry/escalation/failure/completed interactions, but it does not push hard enough on **admin action side effects** and potential **request/status divergence**.

---

## What the Uploaded Phase 4 Package Gets Right

## Strong points

### 1. Phase order is correct

The package’s order is strong:

1. repo-truth audit
2. durable contract / correlation hardening
3. realtime / polling hardening
4. failure / retry / terminal hardening
5. surface compatibility verification
6. final reconciliation

That is the correct dependency flow.

### 2. Scope discipline is mostly good

The package generally stays inside:

- durable status contract
- saga/runtime interaction
- realtime vs polling
- failure/retry semantics
- Accounting/Admin compatibility

It does not drift into broad lifecycle redesign or UI redesign.

### 3. It correctly centers repo truth

The prompts consistently instruct the agent to treat the live repo as authoritative and to avoid silently re-opening earlier-phase lifecycle semantics.

That is the right posture.

### 4. It correctly treats status endpoint primacy as a goal

The current repo already suggests this direction, and the package is right to strengthen it.

---

## Where the Uploaded Phase 4 Package Drifts from Repo Truth

## Drift 1 — “Single canonical durable status resource” wording is too strong

**Severity:** High

Prompt-02 says:

- the launch event creates or updates a single canonical durable status resource

That wording is not a safe description of the live repo.

The current implementation is better described as:

- **one durable status entity per run**
- **latest-run read model per project**
- **run history remains queryable**
- **project-scoped reads return the latest durable run**

The revised prompt package should harden the contract **without prematurely collapsing the storage model** unless repo evidence clearly justifies that change.

## Drift 2 — Missing concrete model/storage files in the required source set

**Severity:** High

The uploaded package under-specifies the actual current status seam because it omits now-critical files such as:

- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`

Without these files, a local code agent could easily harden the wrong abstraction layer.

## Drift 3 — Prompt-03 is too abstract about client consumption

**Severity:** Medium-High

The current repo already has specific realtime / polling / client merge seams:

- `useProvisioningSignalR`
- provisioning store merge behavior
- requester-facing progress view polling fallback

The uploaded package never forces the agent to inspect those seams directly.

That is risky because “client status consumption hardening” becomes too generic.

## Drift 4 — Prompt-05 overstates Accounting as a direct status consumer

**Severity:** High

The uploaded Phase 4 package is framed around Accounting and Admin status consumption, but the live repo shows:

- **Admin:** direct status consumer
- **Accounting:** indirect request-state compatibility surface

That distinction matters.

If not corrected, a local code agent might try to retrofit direct status consumption into Accounting when the real repo need is:

- ensure request-state banners and controller messaging remain consistent with provisioning truth
- ensure Admin remains the direct recovery/status console

## Drift 5 — Failure/retry hardening does not strongly enough include admin-side mutation drift

**Severity:** High

The package discusses:

- failure
- retry
- escalation
- terminal states

But it does not explicitly force the agent to verify whether these specific admin routes preserve request/status consistency:

- `archiveFailure`
- `acknowledgeEscalation`
- `forceStateTransition`

That gap matters because these are real status mutations outside the core saga/timer reconciliation path.

## Drift 6 — Direct client consumers outside Accounting/Admin are easy to miss

**Severity:** Medium

Prompt-03 should at least inspect the real requester/PWA progress consumer path when hardening SignalR and polling behavior, because that is where direct client status consumption currently lives.

This does **not** mean Phase 4 becomes a requester-surface redesign phase.  
It means the repo-truth client seam must be reviewed so backend/status hardening does not break the live direct consumer.

## Drift 7 — Verification instructions should explicitly mention latest-run semantics

**Severity:** Medium

The uploaded prompts ask for durable status creation and correlation evidence, but they should also require explicit proof of:

- per-run row creation
- latest-run selection behavior
- retry correlation behavior
- timer deferred-job query behavior

Otherwise verification remains too high-level.

---

## Required Revisions by Prompt

## Prompt-01 — Repo-Truth Provisioning Status and Saga Audit

**Keep, but expand and sharpen.**

Add required inspection of:

- status model file
- API client
- Zustand store
- SignalR hook
- table-storage service
- signalr push service
- requester/PWA direct status consumer
- admin tests
- saga tests, if present

Require explicit answers for:

- physical persistence model vs logical canonical read model
- direct vs indirect consumers
- request reconciliation points
- admin mutation drift risks
- retry/new-run identity behavior

## Prompt-02 — Durable Status Contract and Run Correlation Hardening

**Keep, but correct the wording.**

Replace “single canonical durable status resource” language with something like:

- canonical **durable run-status contract**
- explicit **projectId / correlationId / latest-run** semantics
- preserve or deliberately change the per-run persistence model only with evidence

Require the agent to decide and document whether the repo should keep:

- per-run rows + latest-run endpoint

or deliberately move to another model — but only with explicit justification.

## Prompt-03 — SignalR, Polling, and Client Status Consumption Hardening

**Keep, but make it concrete.**

Require inspection of:

- backend negotiate route
- push-service payload shape
- `useProvisioningSignalR`
- provisioning store merge rules
- requester/PWA progress view fallback behavior

Also explicitly require that terminal-state handling includes connection and stale-event behavior.

## Prompt-04 — Failure, Terminal State, and Retry Interaction Hardening

**Keep, but broaden the required mutation review.**

Explicitly include:

- timer Step 5 completion/failure
- admin archive
- escalation acknowledgment
- force-state override
- retry/new-correlation run behavior
- request/status drift checks after each

## Prompt-05 — Accounting and Admin Status Workflow Compatibility Verification

**Keep the phase purpose, but correct the consumer framing.**

Require the agent to separate:

- **Accounting indirect compatibility** via request-state reconciliation and status-compatible messaging
- **Admin direct compatibility** via provisioning-status reads and admin action mutations

Also allow the prompt to patch any direct-client compatibility issues exposed by Prompt-03 when necessary, without turning Prompt-05 into a broad requester-surface implementation phase.

## Prompt-06 — Final Reconciliation and Readiness Report

**Keep, but require explicit statement of the adopted status model.**

The final report should explicitly say whether Phase 4 ended with:

- per-run durable rows + latest-run project view
- or a different deliberate model

and why.

---

## Revised Source-of-Truth Set for Phase 4

At minimum, the revised package should point to:

### Backend
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/signalr/index.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`

### Shared package / models
- `packages/models/src/provisioning/IProvisioning.ts`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`
- `packages/provisioning/README.md`

### App consumers
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `apps/admin/src/test/ProvisioningOversightPage.test.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
- `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts`

### Current docs to reconcile
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/estimating-requester-surface.md`
- `docs/reference/models/provisioning.md`
- `docs/explanation/provisioning-architecture.md`
- `docs/how-to/developer/spfx-signalr-auth.md`
- `docs/reference/provisioning/*`
- `docs/maintenance/*`

---

## Final Assessment

The uploaded Phase 4 package is **worth preserving**, but it needed revision before execution.

### Overall grade

- **Objective quality:** Strong
- **Phase order:** Strong
- **Scope discipline:** Good
- **Repo-truth alignment:** Moderate
- **Status-model precision:** Moderate to weak
- **Direct/indirect surface-consumer precision:** Weak
- **Failure/retry/admin-mutation coverage:** Moderate
- **Execution safety for local code agent:** Moderate

### Final recommendation

Use the revised package, not the uploaded one, for Phase 4 execution.

The revised version preserves the good stage order and hardening intent while correcting the key repo-truth mismatches:

- per-run status persistence vs latest-run read model
- direct vs indirect consumer boundaries
- real SignalR/polling/client seams
- admin mutation drift risk
- more precise verification expectations
