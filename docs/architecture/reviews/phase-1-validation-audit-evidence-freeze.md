# Phase 1 — Validation, Audit, and Evidence Contract Freeze

**Phase:** Phase 1 — Workflow Contract and Boundary Freeze
**Prompt:** Prompt-04
**Date:** 2026-04-01
**Classification:** Freeze Decision Record (contract-freeze artifact)
**Depends on:**
- `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`
- `docs/architecture/reviews/phase-1-application-boundary-freeze.md`

---

## 1. Executive Summary

The validation, audit, and evidence contracts for the Accounting-side Project Setup workflow are frozen against repo truth as of 2026-04-01. This freeze separates what is currently enforced, what is currently persisted, and what the frozen contract requires for later implementation.

The current repo enforces broad submission validation (14+ required fields, format and enum checks), mandatory `projectNumber` format validation on `ReadyToProvision` (both client-side and server-side), and claims-based role authorization for all state transitions. Clarification metadata is richly persisted (note, structured items with per-item UUID, raiser identity, and timestamps). Completion metadata captures actor identity via both UPN and OID. The provisioning saga writes three non-blocking audit records to SharePoint (start, completion, failure) with project identifiers, correlation ID, and triggering/submitting actor identity.

Key gaps: project-number uniqueness is **not enforced** (format only); no explicit audit record is persisted on controller state-advance actions (only logger output); saga audit writes are non-blocking and can fail silently; retry operations generate new correlation IDs, breaking traceability chains; and clarification items persistence is untested.

---

## 2. Frozen Frontend Assistive Validation Rules

These are client-side validations in the Accounting detail page. They are assistive (improve UX) but not authoritative — backend re-validates independently.

| Action | Field | Validation | UI Feedback | Evidence |
|--------|-------|-----------|-------------|----------|
| Approve | `projectNumber` | `/^\d{2}-\d{3}-\d{2}$/` | Inline message: "Project number must match format ##-###-## (e.g. 24-001-01)" | `ProjectReviewDetailPage.tsx` lines 75-76, 408-412 |
| Approve | `projectNumber` presence | Button disabled until valid | Approve button stays disabled | `ProjectReviewDetailPage.tsx` line 394 |
| Request Clarification | `clarificationNote` | Non-empty after trim | Submit button disabled while empty | `ProjectReviewDetailPage.tsx` lines 131, 439 |

**Not validated client-side:**
- Project-number uniqueness (no duplicate check)
- Unresolved clarification items (no block on approval)
- Any cross-field or dependent-field constraints

**Classification:** Confirmed repo fact.

---

## 3. Frozen Backend Authoritative Validation Rules

### Submission Validation (`validateSubmission()`)

| # | Field | Rule | Error Code | Evidence |
|---|-------|------|-----------|----------|
| 1 | `projectName` | Required, non-empty | VALIDATION_ERROR | `projectRequests/index.ts` line 40-42 |
| 2 | `projectLocation` | Required, non-empty | VALIDATION_ERROR | line 43-45 |
| 3 | `projectStreetAddress` | Required, non-empty | VALIDATION_ERROR | line 46-48 |
| 4 | `projectCity` | Required, non-empty | VALIDATION_ERROR | line 49-51 |
| 5 | `projectCounty` | Required, non-empty | VALIDATION_ERROR | line 52-54 |
| 6 | `projectState` | Required, non-empty | VALIDATION_ERROR | line 55-57 |
| 7 | `projectZip` | Required, non-empty | VALIDATION_ERROR | line 58-60 |
| 8 | `department` | Required, must be in `VALID_DEPARTMENTS` | VALIDATION_ERROR | line 61-63, 87-89 |
| 9 | `projectType` | Required, non-empty | VALIDATION_ERROR | line 64-66 |
| 10 | `projectExecutiveUpn` | Required, non-empty | VALIDATION_ERROR | line 67-69 |
| 11 | `leadEstimatorUpn` | Required, non-empty | VALIDATION_ERROR | line 70-72 |
| 12 | `timberscanApproverUpn` | Required, non-empty | VALIDATION_ERROR | line 73-75 |
| 13 | `groupMembers` | Required, non-empty array | VALIDATION_ERROR | line 76-78 |
| 14 | `estimatedValue` | Non-negative (if provided) | VALIDATION_ERROR | line 81-82 |
| 15 | `projectStage` | Must be in `VALID_PROJECT_STAGES` | VALIDATION_ERROR | line 84-86 |

**Valid departments:** `commercial`, `luxury-residential`
**Valid stages:** `Lead`, `Pursuit`, `Preconstruction`, `Construction`, `Closeout`, `Warranty`

### State-Advance Validation

| Check | When | Rule | HTTP Status | Evidence |
|-------|------|------|-------------|----------|
| Transition validity | Every advance | `isValidTransition(from, to)` | 400 | `index.ts` line 284-286 |
| Role authorization | Every advance | `isAuthorizedTransition(role, from, to)` | 403 | `index.ts` line 290-293 |
| ProjectNumber format | `→ ReadyToProvision` | `/^\d{2}-\d{3}-\d{2}$/`, non-null | 400 | `index.ts` lines 296-298 |
| ProjectNumber uniqueness | — | **NOT ENFORCED** | — | No check exists |
| Unresolved clarification items | — | **NOT ENFORCED** on approval | — | No block exists |

**Classification:** Confirmed repo fact.

---

## 4. Frozen Approval/Handoff Gate Checklist

What must be true before a request can reach `ReadyToProvision`:

| Requirement | Currently Enforced? | Enforced By | Evidence |
|-------------|-------------------|-------------|----------|
| Request exists in `UnderReview` or `AwaitingExternalSetup` | Yes | `isValidTransition()` | state-machine.ts transition map |
| Caller has controller or admin role | Yes | `isAuthorizedTransition()` | backend state-machine.ts lines 93-96 |
| `projectNumber` provided and matches `##-###-##` | Yes | Backend format check | index.ts lines 296-298 |
| `projectNumber` is unique across all requests | **No** | Not implemented | No duplicate check exists |
| All clarification items resolved | **No** | Not implemented | No blocking check on approval |
| All required submission fields present | Yes (at submission) | `validateSubmission()` | Already enforced before request exists |

**Classification:** Items 1-3 are confirmed repo fact (enforced). Items 4-5 are confirmed repo fact (not enforced) + inferred recommendation (should be required by frozen contract for later implementation).

---

## 5. Frozen Role/Auth Context Available at Action Time

For every state-advance action, the following identity and authorization context is available:

| Context Item | Source | Available? | Classification |
|-------------|--------|------------|----------------|
| Caller UPN | `auth.claims.upn` | Yes | Authorization-critical (role fallback) |
| Caller OID | `auth.claims.oid` | Yes | Authorization-critical (ownership check) |
| Caller app-roles | `auth.claims.roles[]` | Yes | Authorization-critical (primary role resolution) |
| Resolved role | `resolveRequestRole()` output | Yes | Authorization-critical |
| Token type (delegated/app-only) | `isAppOnlyToken()` | Yes | Authorization-critical |
| Delegated scope (`access_as_user`) | `claims.scp` | Yes (delegated tokens) | Authorization-critical |
| Request ownership | `checkOwnership(claims, resource)` | Yes | Authorization-critical |
| Break-glass status | `isBreakGlass(claims)` | Yes | Authorization-critical |
| Correlation ID | `extractOrGenerateRequestId()` | Yes | Notification-routing-only (log correlation) |

### Environment Variables and Their Classification

| Variable | Classification | Purpose |
|----------|---------------|---------|
| `AZURE_TENANT_ID` | Runtime-host-configuration-only | Token validation audience |
| `AZURE_CLIENT_ID` | Runtime-host-configuration-only | Managed Identity selection |
| `API_AUDIENCE` | Runtime-host-configuration-only | JWT audience validation |
| `CONTROLLER_UPNS` | Notification-routing-only | Notification recipient dispatch |
| `ADMIN_UPNS` | Notification-routing-only | Notification recipient dispatch |
| `OPEX_MANAGER_UPN` | Provisioning-prerequisite-only | Group leader assignment in saga |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | Provisioning-prerequisite-only | Human-verified permission gate |
| `SHAREPOINT_TENANT_URL` | Provisioning-prerequisite-only | Site/list operations |
| `SHAREPOINT_HUB_SITE_ID` | Provisioning-prerequisite-only | Hub site association |
| `HB_INTEL_SPFX_APP_ID` | Provisioning-prerequisite-only | App catalog deployment |

**Critical distinction:** `CONTROLLER_UPNS` and `ADMIN_UPNS` are used **only** for notification recipient routing. They are **not** used for authorization. Role-based authorization uses JWT app-role claims exclusively.

**Classification:** Confirmed repo fact.

---

## 6. Currently Persisted Evidence

### Per Controller Action

| Action | Actor Identity | Timestamp | Payload | Persistence | Classification |
|--------|---------------|-----------|---------|-------------|----------------|
| Approve (→ ReadyToProvision) | `auth.claims.upn` (logged only) | Implicit (upsert timestamp) | `projectNumber`, `year` | Request record updated; **no explicit audit record** | Partially persisted |
| Request Clarification (→ NeedsClarification) | `raisedBy: auth.claims.upn` (per item) | `clarificationRequestedAt`, `raisedAt` (per item) | `clarificationNote`, `clarificationItems[]` | Request record updated with structured items | Fully persisted |
| Place on Hold (→ AwaitingExternalSetup) | `auth.claims.upn` (logged only) | Implicit (upsert timestamp) | — | State change only; **no explicit audit record** | Minimally persisted |
| Route to Admin | — | — | — | **No state change** (navigation only) | Not persisted |
| Resubmit (→ UnderReview from NeedsClarification) | `auth.claims.upn` (logged only) | Implicit | `clarificationNote` (optional) | Request record updated | Partially persisted |

### Per System Action (Saga)

| Action | Actor Identity | Timestamp | Payload | Persistence | Classification |
|--------|---------------|-----------|---------|-------------|----------------|
| Provisioning start (→ Provisioning) | `triggeredBy` UPN | `startedAt` | `correlationId`, project metadata | Provisioning status + SharePoint audit record (non-blocking) | Fully persisted |
| Step execution | — | `startedAt`, `completedAt` per step | Step status, error message, metadata | Provisioning status steps array | Fully persisted |
| Provisioning completion (→ Completed) | `triggeredBy` UPN | `completedAt` | `siteUrl`, `correlationId` | Request record + provisioning status + audit record (non-blocking) | Fully persisted |
| Provisioning failure (→ Failed) | `triggeredBy` UPN | `failedAt` | `errorSummary`, `correlationId` | Request record + provisioning status + audit record (non-blocking) | Fully persisted |
| Retry | `triggeredBy` UPN | New `startedAt` | **New** `correlationId` | Status overwritten; original correlation lost | Partially persisted |

**Classification:** Confirmed repo fact.

---

## 7. Missing-but-Required Evidence for Later Implementation

The following evidence is not currently persisted but is required by the frozen contract for later phases:

| # | Evidence | Currently | Required By | Priority | Rationale |
|---|----------|-----------|-------------|----------|-----------|
| E-01 | Controller approval audit record | Logged only (`logger.info`) | Phase 2+ | High | Approval is the most consequential controller action; must be durably auditable |
| E-02 | Controller approval actor OID | Not persisted on approval (only `upn` logged) | Phase 2+ | High | OID is the stable identity; UPN can change |
| E-03 | Hold action audit record | Not persisted (state change only) | Phase 2+ | Medium | Hold decisions affect workflow timing |
| E-04 | Project-number uniqueness constraint | Not enforced | Phase 2 | High | Duplicate project numbers create downstream confusion |
| E-05 | Unresolved clarification items check before approval | Not enforced | Phase 3+ | Medium | Prevents approving requests with open clarification |
| E-06 | Retry correlation chain | New correlationId per retry; original lost | Phase 2 | Medium | Traceability across retry attempts requires chain or parent reference |
| E-07 | Route-to-Admin evidence | Not persisted (navigation only) | Phase 3+ | Low | Currently no state change; if formalized, should capture actor and timestamp |

**Classification:** Inferred recommendation (all items).

---

## 8. Frozen Audit Trail Expectations

### What Exists Today

| Event | Audit Target | Record Fields | Blocking? | Evidence |
|-------|-------------|---------------|-----------|----------|
| Provisioning started | SharePoint audit list | projectId, projectNumber, projectName, correlationId, event, triggeredBy, submittedBy, timestamp | Non-blocking | saga-orchestrator.ts lines 103-112 |
| Provisioning completed | SharePoint audit list | Same as above + siteUrl | Non-blocking | saga-orchestrator.ts lines 330-334 |
| Provisioning failed | SharePoint audit list | Same as above + errorSummary | Non-blocking | saga-orchestrator.ts lines 520-525 |
| State advance | Application Insights (logger) | requestId, from, to, by (UPN), role | Non-blocking | index.ts lines 343-349 |
| Auth success/failure | Application Insights (logger) | correlationId, reason, durationMs | Non-blocking | auth.ts lines 59-86 |
| Authorization decisions | Application Insights (logger) | action, outcome, role, method, isBreakGlass, callerOid, callerUpn | Non-blocking | authorization.ts lines 235-250 |

### Frozen Contract Expectations

1. **Saga audit records are non-blocking.** Per D-PH6-06, audit writes must not fail the saga. This is the frozen contract — later phases must not make audit writes saga-blocking without explicit architectural justification.

2. **Controller action audit records should be durable.** The frozen contract requires that later phases add persistent audit records for controller approval, clarification, and hold actions. These should capture actor OID (not just UPN), resolved role, timestamp, source state, destination state, and action-specific payload.

3. **Auth telemetry is log-based.** Bearer auth and authorization decisions emit structured telemetry events to Application Insights. This is sufficient for production support and security review but is not a durable audit trail. The frozen contract does not require migrating this to a persistent store.

**Classification:** Item 1 is confirmed repo fact. Items 2-3 are confirmed repo-doc intent.

---

## 9. Frozen Identifier and Correlation Requirements

### Currently Available Identifiers

| Identifier | Generated When | Scope | Available Where | Evidence |
|-----------|---------------|-------|----------------|----------|
| `requestId` | Submission | Request lifetime | Request record, API params | index.ts line 118-122 |
| `projectId` | Submission (= requestId) | Request lifetime | Request record, provisioning status, audit records | index.ts line 118-119 |
| `projectNumber` | Approval | Request lifetime (post-approval) | Request record, provisioning status, audit records | index.ts line 300 |
| `correlationId` (provisioning) | Saga start | Single provisioning run | Provisioning status, audit records, SignalR messages | saga-orchestrator.ts line 59 |
| `correlationId` (HTTP request) | Per HTTP call | Single API call | Auth telemetry, logger context | auth.ts line 54 |
| `clarificationId` | Per clarification item | Clarification item lifetime | Request record (clarificationItems[].clarificationId) | index.ts line 316 |

### Known Correlation Gaps

| Gap | Current Behavior | Impact | Resolution Path |
|-----|-----------------|--------|----------------|
| `requestId === projectId` | Both set to same UUID at submission | No independent correlation | Acceptable for current scope; separate only if needed |
| Retry generates new `correlationId` | `randomUUID()` on each retry | Original trigger correlation lost; multi-run traceability broken | Add `parentCorrelationId` or `correlationChain` field |
| No controller-action correlation | State-advance actions have no persistent action ID | Cannot link an approval event to its downstream saga trigger | Add `actionId` on state advance, carry into saga trigger |
| No cross-app navigation correlation | Accounting → Admin uses `?projectId=` query param | No trace of which controller routed which request | Add `routedBy` field if route-to-admin becomes a state change |

**Classification:** Available identifiers are confirmed repo fact. Correlation gaps are inferred recommendation.

---

## 10. Known Repo Gaps

| ID | Gap | Category | Current Status | Impact | Phase Target |
|----|-----|----------|---------------|--------|-------------|
| V-01 | Project-number uniqueness not enforced | Validation | Format check only; no duplicate detection | Duplicate project numbers possible | Phase 2 |
| V-02 | Unresolved clarification items do not block approval | Validation | No check exists | Controller can approve with open clarification items | Phase 3+ |
| V-03 | ProjectNumber format validation untested | Test coverage | Backend enforces but no test asserts format rejection | Regression risk | Phase 2 |
| V-04 | Clarification items array untested | Test coverage | Backend persists but no test validates item fields | Regression risk | Phase 2 |
| V-05 | Auto-trigger not tested in lifecycle tests | Test coverage | Saga handoff not covered in request-lifecycle.test.ts | Regression risk | Phase 2 |
| A-01 | No durable audit record on controller state advance | Audit | Only logger output; no persistent store | Approval not durably auditable | Phase 2 |
| A-02 | Saga audit writes non-blocking and can fail silently | Audit | `.catch()` swallows errors | Audit records may be missing with no alert | Phase 2+ |
| A-03 | Retry correlation chain broken | Audit | New correlationId per retry | Multi-run traceability lost | Phase 2 |
| E-01 | Approval does not persist actor OID | Evidence | UPN logged but OID not stored on request | Identity may be stale if UPN changes | Phase 2 |
| E-02 | Hold action has no audit evidence | Evidence | State change only; no actor, no timestamp, no reason | Unauditable workflow decision | Phase 2+ |

**Classification:** All items are confirmed repo fact (current status) + inferred recommendation (phase target).

---

## 11. Required Consequences for Later Implementation Phases

The following constraints are binding on all later phases:

1. **Backend is authoritative for validation.** Frontend assistive validation improves UX but is not a substitute for backend enforcement. Any new validation rule must be implemented server-side first, with optional client-side assist.

2. **Project-number uniqueness must be added.** Phase 2 backend hardening should add a uniqueness check (database constraint or pre-advance query) for `projectNumber` before allowing `ReadyToProvision` transition.

3. **Controller action audit records must be durable.** Later phases must add persistent audit records for approve, clarify, and hold actions. These records must include: actor OID, resolved role, timestamp (ISO), source state, destination state, and action-specific payload (projectNumber for approve, clarificationNote/items for clarify).

4. **Saga audit non-blocking contract is preserved.** Per D-PH6-06, saga audit writes must not block provisioning execution. If audit reliability needs improvement, use a separate reliability mechanism (retry queue, dead-letter) rather than making writes blocking.

5. **Correlation chain must be preserved across retries.** Later phases should add `parentCorrelationId` or equivalent to maintain traceability when retry operations generate new correlation IDs.

6. **Environment variables are not authorization.** `CONTROLLER_UPNS` and `ADMIN_UPNS` are notification-routing-only. No implementation should treat them as authorization inputs. Authorization uses JWT app-role claims exclusively via `resolveRequestRole()` → `isAuthorizedTransition()`.

7. **Test coverage gaps should be closed.** Phase 2 should add tests for: projectNumber format rejection, clarification items array persistence, and auto-trigger behavior on `ReadyToProvision` transition.

8. **Clarification item status tracking should be completed.** Items are created with `status: 'open'` but no current mechanism transitions them to resolved. Later phases should add resolution tracking if unresolved-items-block-approval is implemented.

**Classification:** Constraints 1, 4, 6 are confirmed repo-doc intent. Constraints 2, 3, 5, 7, 8 are inferred recommendation.

---

## Verification

### Files Reviewed

| File | Purpose |
|------|---------|
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Frontend validation (projectNumber, clarificationNote) |
| `backend/functions/src/functions/projectRequests/index.ts` | Submission validation, state-advance validation, evidence persistence, auto-trigger |
| `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts` | Test coverage for validation, role auth, clarification |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Audit records, notifications, correlation, provisioning status |
| `backend/functions/src/middleware/auth.ts` | Auth wrapper, bearer extraction, auth telemetry |
| `backend/functions/src/middleware/authorization.ts` | Role checks, ownership, scope, authz telemetry |
| `docs/reference/provisioning/verification-matrix.md` | Verification evidence baseline |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Accounting action mapping |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Admin action mapping |
| `docs/reference/developer/project-setup-connected-service-posture.md` | Connected-service posture, config tiers, permission gates |
| `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` | Lifecycle freeze (dependency) |
| `docs/architecture/reviews/phase-1-application-boundary-freeze.md` | Boundary freeze (dependency) |

### Files Updated

| File | Change |
|------|--------|
| `docs/architecture/reviews/phase-1-validation-audit-evidence-freeze.md` | Created (this document) |

### Per-Action Evidence Summary

For each major action, the frozen evidence status:

| Action | Actor (persisted?) | Role (persisted?) | Timestamp (persisted?) | Payload (persisted?) | Correlation (persisted?) | Audit Record (durable?) |
|--------|-------------------|-------------------|----------------------|---------------------|------------------------|----------------------|
| Submit request | submittedBy UPN + OID | Submitter (implicit) | submittedAt | All fields | requestId/projectId | No |
| Approve (→ ReadyToProvision) | UPN logged only | Role logged only | Implicit | projectNumber, year | No action ID | **No** |
| Clarify (→ NeedsClarification) | raisedBy UPN per item | No | clarificationRequestedAt, raisedAt | Note + structured items | clarificationId per item | No |
| Hold (→ AwaitingExternalSetup) | UPN logged only | Role logged only | Implicit | None | None | **No** |
| Route to Admin | Not tracked | Not tracked | Not tracked | Not tracked | projectId query param | **No** |
| Saga start (→ Provisioning) | triggeredBy UPN | System | startedAt | Project metadata | correlationId | **Yes** (non-blocking) |
| Saga complete (→ Completed) | triggeredBy UPN | System | completedAt | siteUrl | correlationId | **Yes** (non-blocking) |
| Saga failure (→ Failed) | triggeredBy UPN | System | failedAt | errorSummary | correlationId | **Yes** (non-blocking) |
| Retry | triggeredBy UPN | System | New startedAt | New correlationId | **New** (chain broken) | **Yes** (non-blocking) |

### Remaining Ambiguities

- Whether unresolved clarification items should block approval is a product decision, not a repo-truth fact. The frozen contract flags it as a gap but does not mandate the behavior.
- Whether `requestId === projectId` equality should be preserved or separated is deferred — current behavior is acceptable for the frozen scope.
