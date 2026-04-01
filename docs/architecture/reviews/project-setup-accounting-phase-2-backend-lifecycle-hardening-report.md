# Phase 2 — Backend Lifecycle Repo-Truth and Gap Audit

**Phase:** Phase 2 — Backend Lifecycle Hardening
**Prompt:** Prompt-01
**Date:** 2026-04-01
**Classification:** Audit Report
**Depends on:** Phase 1 freeze decisions (`phase-1-lifecycle-freeze-decision.md`, `phase-1-application-boundary-freeze.md`, `phase-1-validation-audit-evidence-freeze.md`, `phase-1-authoritative-doc-reconciliation.md`)

---

## Executive Summary

The Project Setup backend is substantially more mature than PH6-era documentation implies. The backend already implements: a well-separated request-state lifecycle and provisioning-run lifecycle, controller-triggered auto-launch with idempotency guards, a 7-step saga with per-step idempotency and compensation, durable provisioning status in Azure Table Storage, 10 admin/provisioning API endpoints, claims-based role authorization, end-to-end correlation tracking, and non-blocking audit/notification dispatch.

Phase 2 hardening should focus on closing specific gaps rather than rebuilding the lifecycle engine. The most material gaps are: project-number uniqueness is format-validated but not duplicate-checked, coordinator retry bounds are not enforced server-side, the `AwaitingExternalSetup → ReadyToProvision` transition has no UI affordance, retry operations generate new correlation IDs breaking traceability chains, and Step 6 Entra group deletion compensation is not implemented.

Verification: `@hbc/functions` check-types passes, 57 test files / 860 tests pass (3 skipped). `@hbc/provisioning` check-types passes.

---

## Confirmed Repo Facts

### Q1: Request-State Transitions Implemented Today

The request-state lifecycle is defined in `packages/provisioning/src/state-machine.ts` (lines 5-28) and mirrored in `backend/functions/src/state-machine.ts` (lines 10-19). Eight states with these transitions:

| From | To | Initiator |
|------|----|-----------|
| Submitted | UnderReview | Controller |
| UnderReview | NeedsClarification | Controller |
| UnderReview | AwaitingExternalSetup | Controller |
| UnderReview | ReadyToProvision | Controller (with projectNumber) |
| NeedsClarification | UnderReview | Submitter (resubmit) |
| AwaitingExternalSetup | ReadyToProvision | Controller (backend-authorized, no UI) |
| ReadyToProvision | Provisioning | System (saga reconciliation) |
| Provisioning | Completed | System (saga success) |
| Provisioning | Failed | System (saga compensation) |
| Failed | UnderReview | Admin/Controller (reopen) |

**Classification:** Confirmed repo fact.
**Evidence:** `packages/provisioning/src/state-machine.ts` lines 19-28, `backend/functions/src/state-machine.ts` lines 73-103.

### Q2: Provisioning Run/Status Transitions Implemented Today

The provisioning run lifecycle is a separate state plane tracked in `IProvisioningStatus` (Azure Table Storage, partition key: `projectId`, row key: `correlationId`):

| Overall Status | Meaning | Set By |
|---------------|---------|--------|
| `NotStarted` | Status initialized | Saga start |
| `InProgress` | Saga executing steps | Saga start (line 60 saga-orchestrator.ts) |
| `BaseComplete` | Steps 1-4 complete | Saga step completion |
| `WebPartsPending` | Step 5 deferred to timer | Step 5 timeout after 2 attempts |
| `Completed` | All steps succeeded | Saga terminal (line 283) |
| `Failed` | Saga compensation ran | Saga compensation (line 451) |

**Critical distinction:** Request state and provisioning run status are **not the same model**. A request can be in `Provisioning` while the run status transitions through `InProgress` → `BaseComplete` → `WebPartsPending` → `Completed`. The saga reconciles the request state to `Completed` or `Failed` only at terminal run status.

**Classification:** Confirmed repo fact.
**Evidence:** `saga-orchestrator.ts` lines 55-78 (status initialization), lines 281-293 (terminal determination).

### Q3: Backend Event Starting Provisioning Saga for Controller Workflow

The controller-facing trigger is in `backend/functions/src/functions/projectRequests/index.ts` lines 351-390:

1. Controller approves with `advanceState(requestId, 'ReadyToProvision', { projectNumber })`
2. Backend validates transition + projectNumber format (`##-###-##`)
3. Backend persists request state as `ReadyToProvision`
4. Backend checks `getProvisioningStatus(projectId)` — if null or `Failed`, constructs `IProvisionSiteRequest` and fires `SagaOrchestrator.execute()` fire-and-forget
5. Saga reconciles request to `Provisioning` (line 101)

**Classification:** Confirmed repo fact.

### Q4: Other Launch Entry Points Besides Controller Approval

| Entry Point | Endpoint | Route | Auth | Purpose |
|------------|---------|-------|------|---------|
| Direct API | `provisionProjectSite` | POST `provision-project-site` | Delegated scope | Service principal or direct trigger; validates projectId, projectNumber, projectName, triggeredBy |
| Admin retry | `retryProvisioning` | POST `provisioning-retry/{projectId}` | Admin + delegated | Re-executes saga from last successful step; generates new correlationId |
| Timer (Step 5) | `timerFullSpec` | Cron (1:00 AM EST) | System | Resumes deferred Step 5 web-part installations |
| Manual timer | `triggerTimerManually` | POST `admin/trigger-timer` | Admin + delegated | Dev/staging only (forbidden in production) |

**Classification:** Confirmed repo fact.
**Evidence:** `backend/functions/src/functions/provisioningSaga/index.ts` lines 20-389.

### Q5: ReadyToProvision vs Provisioning Distinction

Both are preserved as distinct states in the repo:

- **ReadyToProvision** is a short-lived handoff state. The backend auto-triggers the saga immediately upon reaching it. BIC owner is `null` (system-owned). In practice, requests spend very little time in this state.
- **Provisioning** is set by the saga via `reconcileRequestState(projectId, 'Provisioning')` (line 101). It persists while the 7-step saga executes, which can take minutes to hours (especially if Step 5 defers).

The distinction is meaningful: `ReadyToProvision` represents "approved and trigger fired" while `Provisioning` represents "saga actively executing." They are not collapsed.

**Classification:** Confirmed repo fact.

### Q6: Accounting Actions Relying on Backend Support

| Accounting Action | Backend Dependency | Endpoint |
|-------------------|-------------------|----------|
| Approve (→ ReadyToProvision) | `advanceRequestState` + auto-trigger | PATCH `project-setup-requests/{requestId}/state` |
| Request Clarification (→ NeedsClarification) | `advanceRequestState` | Same |
| Place on Hold (→ AwaitingExternalSetup) | `advanceRequestState` | Same |
| Route to Admin | Navigation only (no backend call) | N/A |
| Queue listing | `listRequests(state?)` | GET `project-setup-requests?state=` |

**Classification:** Confirmed repo fact.

### Q7: Where Backend Leaves Accounting UI in Dead End

| Scenario | Dead End | Impact |
|----------|----------|--------|
| `AwaitingExternalSetup` | No forward action in Accounting detail page | Controller cannot approve from hold state without workaround; backend supports the transition (`CONTROLLER_TRANSITIONS` line 78) but UI doesn't expose it |
| `Failed` | Only "Send to Admin" navigation | Controller cannot retry or recover; must route to Admin surface |
| `ReadyToProvision` / `Provisioning` | Not in Accounting queue tabs | System-owned states invisible to controller; no status visibility in Accounting |

**Classification:** Confirmed repo fact (G-01 from Phase 1 boundary freeze is the most material gap).

### Q8: Server-Side Validations Implemented Today

| Validation | Scope | Evidence |
|-----------|-------|----------|
| Submission: 14+ required fields | `validateSubmission()` | index.ts lines 40-89 |
| Submission: department enum | `VALID_DEPARTMENTS` | index.ts line 87-89 |
| Submission: projectStage enum | `VALID_PROJECT_STAGES` | index.ts line 84-86 |
| Submission: estimatedValue non-negative | Format check | index.ts line 81-82 |
| Transition: state machine validity | `isValidTransition(from, to)` | state-machine.ts line 33-34 |
| Transition: role authorization | `isAuthorizedTransition(role, from, to)` | state-machine.ts lines 88-103 |
| ReadyToProvision: projectNumber format | `/^\d{2}-\d{3}-\d{2}$/` | index.ts lines 296-298 |
| Provisioning: projectNumber format | Same pattern | provisioningSaga/index.ts lines 47-53 |
| Auth: Bearer token + JWT validation | `withAuth()` wrapper | auth.ts lines 49-94 |
| Auth: delegated scope | `requireDelegatedScope()` | authorization.ts lines 179-187 |
| Auth: admin role (provisioning endpoints) | `requireAdmin()` | authorization.ts lines 169-171 |
| Auth: break-glass telemetry | `emitAuthorizationTelemetry()` | authorization.ts lines 235-250 |

**Classification:** Confirmed repo fact.

### Q9: Validations Described in Docs but Missing/Partial/Overstated

| Validation | Doc Source | Repo Status | Classification |
|-----------|-----------|-------------|----------------|
| `projectNumber` uniqueness (server-side 409) | MVP-T03 (lines 95-99) | **Not implemented** — format-only validation | Contradiction |
| Max requester retry enforcement | MVP-T05 (lines 88-102) | **Not implemented** — no backend check | Contradiction |
| Retry-After header parsing | MVP-T05 (lines 120-128) | **Not implemented** — retry utility ignores header | Contradiction |
| Unresolved clarification items block approval | Phase 1 freeze (flagged as gap) | **Not implemented** — no blocking check | Confirmed gap |

**Classification:** Contradiction (items 1-3 are documented as requirements but not coded); Confirmed gap (item 4).

### Q10: Duplicate-Run Protections Today

| Protection | Layer | Mechanism | Evidence |
|-----------|-------|-----------|----------|
| Auto-trigger guard | Request handler | Checks `getProvisioningStatus(projectId)` — skips if exists and not `Failed` | index.ts lines 352-389 |
| Saga step idempotency | Orchestrator | `isStepAlreadyCompleted()` check before each step | saga-orchestrator.ts line 145 |
| Step 1: site existence | Per-step | `siteExists()` check before create | step1-create-site.ts line 20 |
| Step 2: library existence | Per-step | `documentLibraryExists()` per library | step2-document-library.ts line 30 |
| Step 4: list idempotency | Per-step | `createDataLists()` internal guard | step4-data-lists.ts line 36 |
| Step 6: group existence | Per-step | `getGroupByDisplayName()` before create | step6-permissions.ts line 56 |
| Step 7: hub check | Per-step | `isHubAssociated()` before join | step7-hub-association.ts line 29 |
| Table Storage upsert | Storage | Replace semantics on PartitionKey + RowKey | table-storage-service.ts line 54 |

**Missing:** No server-side `projectNumber` uniqueness check prevents two requests from being approved with the same project number.

**Classification:** Confirmed repo fact (protections) + Confirmed gap (uniqueness).

### Q11: Durable Request/Run/Status Correlation Today

| Identifier | Scope | Storage | Propagation |
|-----------|-------|---------|-------------|
| `requestId` / `projectId` | Request lifetime (equal at creation) | SharePoint Projects list | Request → provisioning trigger → saga → audit |
| `projectNumber` | Post-approval | SharePoint Projects list + Table Storage | Request → saga → audit → notifications |
| `correlationId` | Single provisioning run | Table Storage (row key) | Request trigger → saga → steps → audit → SignalR |
| `clarificationId` | Per clarification item | SharePoint Projects list | Request record only |

**Gap:** Retry generates a new `correlationId` (`randomUUID()` at saga-orchestrator.ts line 356). The original correlation is not preserved as a parent reference — multi-run traceability is broken.

**Classification:** Confirmed repo fact (identifiers) + Confirmed gap (retry chain).

### Q12: Documentation Materially Out of Sync

| Document | Drift | Severity |
|----------|-------|----------|
| `notification-event-matrix.md` | Recipient resolution section uses env-var model | Annotated (P1-02), low residual risk |
| `PH6.8-RequestLifecycle-StateEngine.md` | Trigger semantics imply manual launch | Annotated (P1-02), low residual risk |
| `PH6.11-Accounting-App.md` | Describes routes/components not yet matching current `routes.ts`; references `ProvisioningStatusBadge` not in current accounting app | Medium — could mislead Phase 3 |
| `MVP-Project-Setup-T03` | Describes projectNumber uniqueness enforcement as implemented | High — code does not enforce uniqueness |
| `MVP-Project-Setup-T05` | Describes max-requester-retry and Retry-After as implemented | High — neither is coded |

**Classification:** Confirmed repo fact (annotated drift) + Contradiction (T03, T05 claims).

---

## Confirmed Repo-Doc Intent

1. **Two state planes are intentional.** The request-state lifecycle and provisioning-run lifecycle are separate by design. The saga reconciles between them at start (`→ Provisioning`) and terminal (`→ Completed` / `→ Failed`).

2. **Auto-trigger from approval is the primary controller path.** The direct `provisionProjectSite` endpoint exists for service-principal and operational use, not as an alternative controller UX.

3. **Admin endpoints are the recovery surface.** Retry, archive, escalation acknowledgment, and force-state-override are admin-scoped. The coordinator retry in Estimating is bounded (5-condition check) and separate from admin force retry.

4. **Non-blocking audit is intentional.** Per D-PH6-06, saga audit writes use `.catch()` to prevent audit failures from blocking provisioning execution.

5. **Step 5 deferral is intentional.** Web-part installation is inherently slow and flaky; the timer-based overnight retry is by design, not a workaround.

---

## Request-State Model Versus Provisioning-Run Model

### Request-State Model

- **Storage:** SharePoint Projects list (via `IProjectRequestsRepository`)
- **States:** 8 (`Submitted`, `UnderReview`, `NeedsClarification`, `AwaitingExternalSetup`, `ReadyToProvision`, `Provisioning`, `Completed`, `Failed`)
- **Transitions:** Defined in `STATE_TRANSITIONS`, enforced by `isValidTransition()` + `isAuthorizedTransition()`
- **Mutated by:** `advanceRequestState` handler (user-facing) + `reconcileRequestState` (saga-internal)
- **Ownership:** BIC model in `bic-config.ts` assigns human or system owner per state

### Provisioning-Run Model

- **Storage:** Azure Table Storage `ProvisioningStatus` table (via `ITableStorageService`)
- **Statuses:** 6 (`NotStarted`, `InProgress`, `BaseComplete`, `WebPartsPending`, `Completed`, `Failed`)
- **Transitions:** Saga-internal; no external state machine
- **Mutated by:** `SagaOrchestrator` exclusively
- **Per-step tracking:** `steps[]` array with stepNumber, stepName, status, startedAt, completedAt, errorMessage, metadata

### Reconciliation Points

| Saga Event | Request State Change | Run Status Change |
|-----------|---------------------|-------------------|
| Saga start | → `Provisioning` | → `InProgress` |
| Steps 1-4 complete | — | → `BaseComplete` |
| Step 5 deferred | — | → `WebPartsPending` |
| All steps complete | → `Completed` (with siteUrl) | → `Completed` |
| Compensation complete | → `Failed` | → `Failed` |

---

## Lifecycle/Trigger Contradictions

| ID | Contradiction | Source vs Reality |
|----|--------------|-------------------|
| C-01 | T03 claims projectNumber uniqueness is server-side enforced (HTTP 409) | Code only validates format, not uniqueness |
| C-02 | T05 claims max-requester-retry is backend-enforced | No retry count check in saga or retry endpoint |
| C-03 | T05 claims Retry-After header parsing exists | `withRetry()` uses fixed exponential backoff, ignores response headers |
| C-04 | PH6.11 describes routes and components not matching current accounting app | `routes.ts` has 5 routes; PH6.11 describes different route structure |

---

## Backend Validation Inventory

See Q8 and Q9 above for the complete inventory. Summary:

- **Implemented:** 12 validation checks across submission, transition, authorization, and auth layers
- **Missing:** 3 validations documented as requirements but not coded (projectNumber uniqueness, max retry, Retry-After)
- **Gap:** 1 validation flagged in Phase 1 but not yet decided (unresolved clarification items)

---

## Idempotency/Duplicate-Run Inventory

See Q10 above. Summary:

- **8 idempotency mechanisms** across auto-trigger guard, saga orchestrator, 5 individual steps, and table storage
- **1 critical gap:** projectNumber uniqueness not enforced (two requests could be approved with the same number)
- **Coverage is strong** for preventing duplicate provisioning runs against the same project

---

## Accounting Compatibility Risks

| Risk | Severity | Impact | Remediation |
|------|----------|--------|-------------|
| No forward action from `AwaitingExternalSetup` | High | Controller dead end | Phase 3: add approve-from-hold action |
| No provisioning status visibility in Accounting | Medium | Controller has no post-approval visibility | Phase 3: add status column or redirect |
| `ReadyToProvision` / `Provisioning` not in queue | Low (by design) | System-owned states correctly excluded | None needed |
| Route-to-Admin is navigation only | Low | No state audit trail for routing | Phase 3: consider adding routing metadata |

---

## Stale Authority Paths and Why They Are Stale

| Document | Stale Aspect | Why Stale | Current Authority |
|----------|-------------|-----------|-------------------|
| `PH6.8-RequestLifecycle-StateEngine.md` | Trigger semantics | Backend auto-triggers; no manual launch | `phase-1-lifecycle-freeze-decision.md` (annotated P1-02) |
| `PH6.11-Accounting-App.md` | Route structure, component names | Current `routes.ts` differs materially | Live code + `controller-review-surface.md` |
| `MVP-Project-Setup-T03` | Uniqueness enforcement claim | Not implemented in code | Live code is authority; T03 is aspirational |
| `MVP-Project-Setup-T05` | Max-retry and Retry-After claims | Not implemented in code | Live code is authority; T05 is aspirational |
| `notification-event-matrix.md` | Recipient resolution method | Env-var model superseded by claims-based auth | `setup-notification-registrations.md` (annotated P1-02) |

---

## Recommended Phase 2 Remediation Order

| Priority | Item | Prompt | Rationale |
|----------|------|--------|-----------|
| 1 | ProjectNumber uniqueness enforcement (HTTP 409) | Prompt-02 | Prevents duplicate project numbers; highest-risk validation gap |
| 2 | Correlation chain preservation on retry | Prompt-04 | Breaks traceability; add `parentCorrelationId` |
| 3 | Controller approval audit record (durable) | Prompt-04 | Most consequential action lacks persistent audit |
| 4 | Max coordinator retry enforcement (server-side) | Prompt-03 | MVP-T05 requirement; bounded retry must be backend-enforced |
| 5 | Accounting compatibility verification | Prompt-05 | Ensure Accounting surface works correctly against hardened backend |
| 6 | Retry-After header awareness | Prompt-03 | Graph/SharePoint throttling resilience |
| 7 | Documentation reconciliation | Prompt-06 | Clean up T03/T05/PH6.11 contradictions |

---

## Explicit Unresolved Questions

1. **Should `AwaitingExternalSetup → ReadyToProvision` be added to Accounting UI in Phase 2 or Phase 3?** Backend supports it (line 78 backend state-machine.ts), but it's a UI decision. Phase 1 deferred to Phase 3.

2. **Should the direct `provisionProjectSite` endpoint be restricted to service principals only?** Currently requires delegated scope but not admin role. Any authenticated user with `access_as_user` scope can trigger provisioning directly.

3. **Should retry generate a child correlation or overwrite the existing status?** Currently overwrites the status record (same PartitionKey, new RowKey). A parent-child model would preserve history but requires schema change.

4. **Should Step 6 Entra group deletion be implemented as compensation?** Currently a documented gap (step6-permissions.ts). Group creation is idempotent but orphaned groups may accumulate on saga failure.

5. **Should `WebPartsPending` have a maximum deferral duration before auto-failing?** Currently defers indefinitely until the timer succeeds or admin intervenes.

---

## Verification Results

| Command | Result |
|---------|--------|
| `pnpm --filter @hbc/functions check-types` | Pass |
| `pnpm --filter @hbc/functions test` | 57 test files, 860 passed, 3 skipped |
| `pnpm --filter @hbc/provisioning check-types` | Pass |

No type errors. No test failures. 3 skipped tests are pre-existing (not introduced by this audit).

---

## Prompt-02 Addendum: Launch Contract Remediation

**Chosen Contract:** Path A — Reconcile Around Current Repo Truth

**Rationale:** The current auto-trigger from `ReadyToProvision` is the correct controller-facing launch contract. It is tested (860 tests pass), well-integrated with role authorization, and already the only controller-accessible path. Path B (lifecycle reversal) would require broad changes with no clear benefit.

**Changes Made:**
1. Added `requireAdmin` to `provisionProjectSite` endpoint — prevents non-admin users from triggering provisioning directly
2. Added contract classification comments to auto-trigger, direct endpoint, and CONTROLLER_TRANSITIONS
3. Fixed `state-machine.md`: corrected `Failed → Provisioning` to `Failed → UnderReview`; added missing `UnderReview → ReadyToProvision`; added Launch Contract section
4. Added launch semantics to `saga-steps.md`
5. Added tests: launch contract prerequisites (G1-G7) covering auto-trigger transition validity, role authorization, projectNumber format validation
6. Exported `PROJECT_NUMBER_PATTERN` from `projectRequests/index.ts` for test access

**Entry Point Classification:**

| Entry Point | Classification | Auth | Intended Use |
|------------|---------------|------|-------------|
| Auto-trigger via advanceRequestState | Primary (controller-facing) | Controller/Admin role | Normal workflow approval |
| POST provision-project-site | Secondary (operational) | Admin role (P2-02) | Admin recovery, automation |
| POST provisioning-retry/{projectId} | Secondary (recovery) | Admin role | Failed run re-execution |
| Timer (Step 5) | System (automated) | System | Deferred web-part retry |

**Compatibility Consequences:**
- Accounting: no change (already uses advanceState which triggers auto-launch)
- Estimating: no change (does not call provisioning directly)
- Admin: provisionProjectSite now requires admin role (already required for other admin endpoints)
- Direct API callers: must now have admin role to call provisionProjectSite

**Stale Docs Updated:**
- state-machine.md: Fixed incorrect `Failed → Provisioning` transition; added missing `UnderReview → ReadyToProvision`; added Launch Contract section
- saga-steps.md: Added launch semantics classification

---

## Prompt-03 Addendum: Validation, Idempotency, and Uniqueness Hardening

### Validation and Idempotency Hardening

**Implemented:**

1. **ProjectNumber uniqueness enforcement (P2-03):** Added `findByProjectNumber()` to `IProjectRequestsRepository` interface and both implementations (SharePoint adapter + mock). The `advanceRequestState` handler now queries the repository when transitioning to `ReadyToProvision` — if another request already holds the same projectNumber, returns HTTP 409 Conflict with machine-readable error code `CONFLICT` and human-readable message identifying the conflicting request.

2. **Duplicate-run prevention (existing, verified):** The auto-trigger guard in `advanceRequestState` checks `getProvisioningStatus(projectId)` before firing the saga. If a non-failed status exists, the trigger is skipped with structured logging. This prevents duplicate launches for the same project.

3. **Transition guards (existing, verified):** `isValidTransition()` and `isAuthorizedTransition()` enforce all lifecycle constraints server-side. Invalid transitions return 400; unauthorized transitions return 403. Both produce machine-readable error codes.

### Existing Enforcement Versus Remaining Gaps

| Control | Status | Layer | Evidence |
|---------|--------|-------|----------|
| ProjectNumber format (`##-###-##`) | Enforced | advanceRequestState | Returns 400 VALIDATION_ERROR |
| ProjectNumber uniqueness | **Enforced (P2-03)** | advanceRequestState → findByProjectNumber | Returns 409 CONFLICT |
| Transition validity | Enforced | isValidTransition() | Returns 400 VALIDATION_ERROR |
| Role authorization | Enforced | isAuthorizedTransition() | Returns 403 FORBIDDEN |
| Duplicate-run prevention | Enforced | Auto-trigger guard | Skips with structured log |
| Per-step saga idempotency | Enforced | isStepAlreadyCompleted() + per-step checks | idempotentSkip: true |
| Unresolved clarification items block | **Not enforced** | — | Gap: no blocking check on approval |
| Max coordinator retry | **Not enforced** | — | Gap: no server-side retry count limit |

### Open Exceptions / External Dependencies

1. **Unresolved clarification items:** The frozen contract flags this as a gap (P1-04 V-02). Whether unresolved items should block approval is a product decision deferred to Phase 3.

2. **Max coordinator retry enforcement:** MVP-T05 describes backend enforcement of bounded retry (max 2). This is not implemented. The coordinator UI enforces the 5-condition check client-side, but no server-side check exists. Deferred to Phase 2 Prompt-04 or later.

3. **ProjectNumber uniqueness scope:** The uniqueness check queries the SharePoint Projects list via the request repository. This covers all requests managed by the backend lifecycle. It does not cover project numbers assigned outside the HB Intel system. If external systems create projects with the same numbering scheme, the backend will not detect the conflict.

### Conflict Response Behavior

| Scenario | HTTP Status | Error Code | Message Shape | Logged? |
|----------|-------------|-----------|---------------|---------|
| Invalid projectNumber format | 400 | VALIDATION_ERROR | "Valid projectNumber (##-###-##) is required..." | Yes (implicit) |
| Duplicate projectNumber | 409 | CONFLICT | "projectNumber 'XX-XXX-XX' is already assigned to request 'req-id'" | Yes (warn) |
| Invalid transition | 400 | VALIDATION_ERROR | "Invalid state transition: {from} → {to}" | Yes (implicit) |
| Unauthorized transition | 403 | FORBIDDEN | "Role '{role}' is not authorized for transition {from} → {to}" | Yes (implicit) |
| Duplicate provisioning run | — | — | No error; auto-trigger silently skipped | Yes (info) |

### Test Evidence

8 new tests (H1-H8) added in `request-lifecycle.test.ts`:
- H1-H3: `findByProjectNumber` repository method — null on no match, correct match, no false positives on missing projectNumber
- H4-H5: Auto-trigger prerequisite validation — controller-authorized, system cannot bypass
- H6-H8: Transition guards — Failed→ReadyToProvision invalid, Provisioning→ReadyToProvision invalid, Completed→ReadyToProvision invalid
