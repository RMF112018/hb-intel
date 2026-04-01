# Accounting Phase 3 — Functional Completion Report

**Phase:** Phase 3 — Accounting App Functional Completion  
**Prompts:** Prompt-01 through Prompt-06  
**Date:** 2026-04-01  
**Classification:** Final Readiness Report  
**Depends on:** Phase 1 workflow/boundary freeze, Phase 2 backend lifecycle hardening  
**Status:** PHASE COMPLETE

---

## Executive Summary

The Accounting SPFx controller surface is substantially mature. The live queue and detail pages implement state-based filtering, structured review, and controller actions for the core approval workflow. Approval correctly captures a `projectNumber` in `##-###-##` format and advances the request to `ReadyToProvision`, where the backend auto-triggers provisioning. Post-approval lifecycle banners, BIC ownership display, complexity-gated history, expert-gated audit trail, and degraded-path Admin routing are all present and functional.

**One critical dead-end** exists: `AwaitingExternalSetup` has no forward action in the UI despite backend support for `AwaitingExternalSetup -> ReadyToProvision`. This is the highest-priority gap for Phase 3.

**One minor doc drift** exists: `controller-review-surface.md` line 49 names `HbcEmptyState` where the queue page uses `HbcSmartEmptyState`. The projectNumber requirement and auto-trigger semantics are correctly documented.

No boundary violations were found. Admin recovery behavior is properly separated from Accounting.

---

## 1. Canonical Package Confirmation

- **Package location:** `docs/architecture/plans/MASTER/spfx/accounting/phase-3/`
- **Duplicate check:** No duplicate Prompt-01 files found outside the canonical location. The file `Accounting_Phase3_Prompt_Audit_Report.md` in the same directory is a prior package-level audit — a separate artifact.
- **Status:** Package is committed in the workspace and was audited at this location.
- **Classification:** confirmed repo fact

---

## 2. Route and Page Inventory

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `OverviewPage` | Accounting workspace landing |
| `/budgets` | `BudgetsPage` | Budget management (placeholder scope) |
| `/invoices` | `InvoicesPage` | Invoice management (placeholder scope) |
| `/project-review` | `ProjectReviewQueuePage` | Controller project setup review queue |
| `/project-review/$requestId` | `ProjectReviewDetailPage` | Structured review and controller actions |

- **Evidence:** `apps/accounting/src/router/routes.ts` lines 5–40
- **Classification:** confirmed repo fact
- **Note:** `OverviewPage`, `BudgetsPage`, and `InvoicesPage` are outside Phase 3 scope. Only the `/project-review` routes are relevant.

---

## 3. Queue Page Audit

### 3.1 Filter Tabs

| Tab ID | Label | State Filter |
|--------|-------|-------------|
| `pending` | Pending Review | `UnderReview` |
| `clarification` | Awaiting Re-Submission | `NeedsClarification` |
| `external` | Awaiting External Setup | `AwaitingExternalSetup` |
| `failed` | Failed / Needs Routing | `Failed` |

- Default tab: `pending`
- Sort: oldest-first by `submittedAt` (ascending)
- **Evidence:** `ProjectReviewQueuePage.tsx` lines 30–42, 92–98
- **Classification:** confirmed repo fact

### 3.2 Queue Columns

| Column | Source | Notes |
|--------|--------|-------|
| Project Name | `projectName` | Renders as link to detail route |
| Project # | `projectNumber` | Displays `—` when null |
| Department | `department` | Uses `DEPARTMENT_DISPLAY_LABELS` mapping |
| State | `state` | `HbcStatusBadge` with variant from `getStateBadgeVariant()` |
| Submitted By | `submittedBy` | Plain text |
| Submitted | `submittedAt` | Formatted as `toLocaleDateString()` |
| Current Owner | BIC-derived | Uses `resolveFullBicState()` with `PROJECT_SETUP_BIC_CONFIG` |
| Actions | — | "Open" button navigates to detail |

- **Evidence:** `ProjectReviewQueuePage.tsx` lines 117–190
- **Classification:** confirmed repo fact

### 3.3 Empty State Handling

The queue uses `HbcSmartEmptyState` (imported from `@hbc/smart-empty-state`) with context-aware messaging:
- **Filter-empty:** "No requests match this filter. Try a different tab." with "Show Pending Review" clear action
- **Truly-empty:** "Requests will appear here once submitted for review."
- **Coaching tip:** "Submitted project setup requests are routed here for controller review."

- **Evidence:** `ProjectReviewQueuePage.tsx` lines 15–16 (import), 44–58 (config), 221–228 (render)
- **Doc drift:** `controller-review-surface.md` line 49 says `HbcEmptyState`. Code uses `HbcSmartEmptyState`.
- **Classification:** confirmed repo fact (code) / confirmed doc drift (living ref)

### 3.4 Complexity Gating

- **Essential tier:** Simple `<ul>` list fallback with project name and state label as links
- **Standard+ tier:** Full `HbcDataTable` with sorting, pagination (25 per page), 600px height
- **Evidence:** `ProjectReviewQueuePage.tsx` lines 230–252
- **Classification:** confirmed repo fact

### 3.5 Session and Error Handling

- **Session guard:** Returns loading shell when `session` is null (lines 193–199)
- **Load error:** Returns error shell with retry action when API fails and no cached data (lines 202–214)
- **Classification:** confirmed repo fact

---

## 4. Detail Page Audit

### 4.1 Core Summary (Always Visible)

- Project name as `heading2`
- `HbcStatusBadge` with state-derived variant and label
- State context text from `getStateContextText()` (full 8-state coverage)
- BIC ownership detail (`HbcBicDetail`, standard-gated)
- Project type, stage, department (with display label mapping)
- Submitted by, submitted date

- **Evidence:** `ProjectReviewDetailPage.tsx` lines 232–251
- **Classification:** confirmed repo fact

### 4.2 Request Detail Section (Standard-Gated)

Renders in `HbcCard` with conditional display:
- Team members, group leaders, project manager
- Contract type, estimated value, client name, start date
- Add-ons
- Clarification items (read-only with status and response notes)

- **Evidence:** `ProjectReviewDetailPage.tsx` lines 253–297
- **Classification:** confirmed repo fact

### 4.3 Operational Detail (Standard-Gated)

- Internal request ID
- Last-updated timestamp (uses `completedAt`, which may be misleading for non-completed requests — see gap inventory)

- **Evidence:** `ProjectReviewDetailPage.tsx` lines 299–308
- **Classification:** confirmed repo fact / inferred implementation recommendation (timestamp label)

### 4.4 History and Audit Sections

- **Timeline (`HbcStatusTimeline`):** Standard-gated. Renders entries for Submitted, Clarification Requested, individual clarification items, and Completed events.
  - **Gap:** Does not include UnderReview, AwaitingExternalSetup, ReadyToProvision, or Provisioning transitions. Timeline is incomplete for the full lifecycle.
  - **Evidence:** `ProjectReviewDetailPage.tsx` lines 138–159, 311–313
  - **Classification:** confirmed repo fact (what exists) / inferred implementation recommendation (timeline completeness)

- **Audit trail (`HbcAuditTrailPanel`):** Expert-gated. Renders by request ID.
  - **Evidence:** `ProjectReviewDetailPage.tsx` lines 316–318
  - **Classification:** confirmed repo fact

### 4.5 Post-Approval Lifecycle Banners

| State | Banner Variant | Message |
|-------|---------------|---------|
| `ReadyToProvision` | info | "Approved with project number {projectNumber}. Provisioning is starting automatically." |
| `Provisioning` | info | "Project site provisioning is in progress for {projectNumber or projectName}." |
| `Completed` | success | "Project site provisioned successfully." with site URL link when available |

- **Wording alignment:** The `ReadyToProvision` banner correctly says "Provisioning is starting automatically", which matches the backend's fire-and-forget auto-trigger behavior.
- **Evidence:** `ProjectReviewDetailPage.tsx` lines 339–358
- **Classification:** confirmed repo fact, correctly aligned with backend contract

### 4.6 Session, Error, and Not-Found Handling

- **Session guard:** Loading shell when `session` is null (lines 162–168)
- **Load error:** Error shell with retry action and breadcrumbs (lines 171–187)
- **Not found:** Empty shell with "Back to Review Queue" action and breadcrumbs (lines 190–207)
- **Action error:** Dismissible `HbcBanner variant="error"` (lines 225–229)

- **Evidence:** `ProjectReviewDetailPage.tsx` lines 162–229
- **Classification:** confirmed repo fact

---

## 5. Controller Actions by Request State

### 5.1 Action Matrix

| Action | Button Label | Visible When | Transition | Confirmation UI | Extras |
|--------|-------------|-------------|-----------|----------------|--------|
| Approve | "Approve Request" (primary) | `UnderReview` | -> `ReadyToProvision` | `HbcModal` | `projectNumber` (`##-###-##` format, client-validated) |
| Request Clarification | "Request Clarification" (secondary) | `UnderReview` | -> `NeedsClarification` | `HbcModal` | `clarificationNote` (required, trimmed) |
| Place on Hold | "Place on Hold" (secondary) | `UnderReview` | -> `AwaitingExternalSetup` | `HbcConfirmDialog` (warning) | none |
| Send to Admin | "Send to Admin" (secondary) | `Failed` | navigation only | none | Opens `{adminUrl}/provisioning-oversight?projectId={projectId}` |

- **Evidence:** `ProjectReviewDetailPage.tsx` lines 321–378 (action panel), 381–452 (modals/dialogs)
- **Classification:** confirmed repo fact

### 5.2 Missing Actions (Gap Inventory)

**CRITICAL — AwaitingExternalSetup has no forward action:**

The action panel at lines 321–336 renders only when `isUnderReview` is true (`request.state === 'UnderReview'`, line 209). When a request is in `AwaitingExternalSetup`, no action panel is rendered. The controller cannot advance this request from the UI.

The backend supports `AwaitingExternalSetup -> ReadyToProvision` with `projectNumber` (confirmed in `state-machine.md` and `backend/functions/src/functions/projectRequests/index.ts`). This is a **live UI dead-end** for a **valid backend transition**.

- **Classification:** confirmed repo fact (live UI gap)
- **Priority:** P1 — blocks controller workflow completion

**No action for NeedsClarification state:**

When a request is in `NeedsClarification`, the controller has no UI action. This is correct behavior — the requester (coordinator) must respond to clarification. The backend supports `NeedsClarification -> UnderReview` as a controller transition, but the intent is that clarification response triggers the return. No gap here.

- **Classification:** confirmed repo-doc intent (correct behavior)

---

## 6. Backend Transition Map for Controller Surface

| From | To | Actor | Type | UI Affordance |
|------|-----|-------|------|--------------|
| `Submitted` | `UnderReview` | Controller | valid backend transition | **No live UI action** — implicit on first review |
| `UnderReview` | `ReadyToProvision` | Controller | valid backend transition | **Live UI action** — Approve with projectNumber |
| `UnderReview` | `NeedsClarification` | Controller | valid backend transition | **Live UI action** — Request Clarification |
| `UnderReview` | `AwaitingExternalSetup` | Controller | valid backend transition | **Live UI action** — Place on Hold |
| `NeedsClarification` | `UnderReview` | Controller | valid backend transition | **No live UI action** — triggered by requester response |
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller | valid backend transition | **No live UI action — DEAD-END** |
| `ReadyToProvision` | `Provisioning` | System | system-owned progression | N/A — auto-triggered by saga |
| `Provisioning` | `Completed` | System | system-owned progression | N/A — saga completion |
| `Provisioning` | `Failed` | System | system-owned progression | N/A — saga failure |
| `Failed` | `UnderReview` | Admin/Controller | valid backend transition | **No live UI action** — Admin recovery surface |

- **Evidence:** `docs/reference/provisioning/state-machine.md`, `backend/functions/src/functions/projectRequests/index.ts`
- **Classification:** confirmed repo fact

---

## 7. Status and Display Helpers

### 7.1 stateDisplayHelpers.ts

- **`STATE_CONTEXT_TEXT`:** Full 8-state coverage with human-readable context strings
- **`getStateBadgeVariant()`:** Delegates to `@hbc/provisioning`'s `getStateBadgeVariant()`, narrowed to `StatusVariant` at the consumer boundary
- **`STATE_BADGE_MAP`:** Re-exported from `@hbc/provisioning` with type narrowing
- **Evidence:** `apps/accounting/src/utils/stateDisplayHelpers.ts` lines 1–27
- **Classification:** confirmed repo fact, complete coverage

### 7.2 ReadyToProvision Wording Alignment

The detail page (line 341) says: "Provisioning is starting automatically." The approve handler (line 121) toast says: "Request approved — provisioning started."

Both correctly reflect the backend's auto-trigger behavior where `SagaOrchestrator.execute()` fires immediately on `ReadyToProvision` transition.

- **Classification:** confirmed repo fact, correctly aligned

### 7.3 AwaitingExternalSetup Context Text

`stateDisplayHelpers.ts` line 17: "This request is on hold pending external IT or security setup."

This text is descriptive but provides no forward-action guidance. When the UI adds a forward action from this state, the context text should include next-step language.

- **Classification:** confirmed repo fact / inferred implementation recommendation

---

## 8. Cross-App Routing and Admin Boundary

### 8.1 getAdminAppUrl()

- Reads `VITE_ADMIN_APP_URL` environment variable
- Validates as a proper URL via `new URL(raw)` constructor
- Returns null when missing, empty, or invalid
- Strips trailing slashes
- **Evidence:** `apps/accounting/src/utils/crossAppUrls.ts` lines 1–14
- **Classification:** confirmed repo fact

### 8.2 Failed-State Admin Routing

- Opens `{adminUrl}/provisioning-oversight?projectId={request.projectId}` in new tab
- When `adminUrl` is null: renders warning banner "Admin navigation is not configured in this environment. Contact your system administrator."
- **Evidence:** `ProjectReviewDetailPage.tsx` lines 360–378
- **Classification:** confirmed repo fact, properly degraded

### 8.3 Boundary Compliance

Accounting contains:
- No retry action
- No archive action
- No escalation acknowledgment
- No state override
- No Admin recovery controls of any kind

The only Admin interaction is a navigation link for `Failed` state. Ownership boundary is intact.

- **Classification:** confirmed repo fact, no boundary violations

---

## 9. Dead-End States

### 9.1 AwaitingExternalSetup — RESOLVED (P3-03)

**Previous state:** Dead-end — no action panel rendered for `AwaitingExternalSetup`. Controller had no way to advance.

**Resolution (2026-04-01):**
- Added "Resolve Hold" action button visible when `request.state === 'AwaitingExternalSetup'`
- "Resolve Hold" opens a modal with `projectNumber` capture (same `##-###-##` format and validation as approval)
- Calls `advanceState('ReadyToProvision', { projectNumber })` — identical backend contract as approval from `UnderReview`
- Toast confirms "External setup complete — provisioning started." — aligned with auto-trigger semantics
- Post-action: data refresh via `listRequests()` and navigation to queue
- Updated `AwaitingExternalSetup` context text to include next-step guidance: "Resolve the hold when prerequisites are complete."
- 3 new tests (P3-03-001, P3-03-002, P3-03-003) covering visibility, modal behavior, and API call
- **Classification:** confirmed repo fact (gap closed), implementation applied

---

## 10. Documentation Drift Findings

### 10.1 HbcEmptyState vs HbcSmartEmptyState

- **Doc:** `controller-review-surface.md` line 49 says `HbcEmptyState`
- **Code:** `ProjectReviewQueuePage.tsx` line 15 imports `HbcSmartEmptyState` from `@hbc/smart-empty-state`
- **Impact:** Minor naming drift. The living ref should say `HbcSmartEmptyState`.
- **Classification:** confirmed doc drift
- **Target prompt:** Prompt-06

### 10.2 projectNumber on Approval — No Drift

- **Doc:** `controller-review-surface.md` lines 90, 103 correctly document the `projectNumber` requirement
- **Code:** `ProjectReviewDetailPage.tsx` lines 72–76 (pattern), 118–123 (handler), 382–414 (modal)
- **Classification:** confirmed repo-doc alignment (no drift)

### 10.3 Auto-Trigger Wording — No Drift

- The current UI wording says "provisioning started" and "provisioning is starting automatically"
- No residual "launch action" or separate controller-side launch model language exists in the live codebase
- **Classification:** confirmed repo fact (no drift)

---

## 11. Stale Authority Classification

### 11.1 Authoritative Sources for Prompts 02–06

| Source | Authority Status | Governs |
|--------|-----------------|---------|
| Live Accounting code (`apps/accounting/src/`) | **Primary** | All implementation decisions |
| `docs/architecture/blueprint/current-state-map.md` | **Primary** | What exists and where |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | **Authoritative in family, minor drift** | Controller queue/review spec |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | **Authoritative** | Admin boundary spec |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | **Authoritative** | Coordinator surface spec |
| `docs/reference/spfx-surfaces/responsive-failure-catalog.md` | **Authoritative** | Failure mode catalog |
| `docs/reference/provisioning/state-machine.md` | **Authoritative** | State transitions and launch contract |
| `docs/reference/provisioning/saga-steps.md` | **Authoritative** | Saga step reference |
| `docs/reference/developer/project-setup-connected-service-posture.md` | **Authoritative** | Service identity and config |
| `packages/provisioning/src/bic-config.ts` | **Primary** | Ownership and action mapping |
| `backend/functions/src/functions/projectRequests/index.ts` | **Primary** | Backend transition enforcement |

### 11.2 Partially Stale Sources

| Source | Status | What Is Stale |
|--------|--------|--------------|
| `controller-review-surface.md` line 49 | Partially stale | Names `HbcEmptyState` instead of `HbcSmartEmptyState` |
| `Accounting_Phase3_Prompt_Audit_Report.md` | Partially stale | Flagged projectNumber doc drift that has since been corrected in living ref |

### 11.3 Historical-Only Sources

PH6 and earlier MVP planning documents are drift evidence only. They should not be treated as implementation authority for Phase 3. Specific plan files under `docs/architecture/plans/MVP/G4/` remain useful for traceability references but do not override current-state code or living reference docs.

---

## 12. Boundary Compliance Audit

| Concern | Status | Evidence |
|---------|--------|---------|
| No Admin recovery actions in Accounting | PASS | No retry, archive, escalation ack, or override controls found |
| No requester responsibilities in Accounting | PASS | No clarification response UI; controller only reads clarification items |
| No coordinator responsibilities in Accounting | PASS | No coordinator retry or escalation UI found |
| Cross-app routing uses proper helper | PASS | `getAdminAppUrl()` with env-var sourcing and null degradation |
| No separate provisioning launch model | PASS | Approval fires `advanceState('ReadyToProvision')`, backend auto-triggers |

- **Classification:** confirmed repo fact

---

## 13. Prioritized Implementation Inventory

### Priority 1 — AwaitingExternalSetup Forward Action (Prompt-03) — COMPLETE

- **Status:** COMPLETE (2026-04-01)
- **Implementation:** Added "Resolve Hold" action with projectNumber capture modal for `AwaitingExternalSetup` state. Calls `advanceState('ReadyToProvision', { projectNumber })`. Updated context text with next-step guidance. 3 new tests.
- **Dead-end eliminated:** Controller can now advance from `AwaitingExternalSetup → ReadyToProvision` with projectNumber, triggering auto-provisioning.
- **No boundary violations:** No Admin/coordinator responsibilities added. No separate launch model created.

### Priority 2 — Queue and Detail Workflow Completion (Prompt-02) — COMPLETE

- **Status:** COMPLETE (2026-04-01)
- **Findings:**
  - `Submitted` requests were invisible in the queue — the "Pending Review" tab only filtered for `UnderReview`, but newly submitted requests arrive as `Submitted`. BIC config confirms `Submitted` is controller-owned. **Fixed:** tab now includes both `Submitted` and `UnderReview`.
  - Detail page had no action for `Submitted` state — controller could not begin review. Backend supports `Submitted → UnderReview` as a valid controller transition. **Fixed:** added "Begin Review" action button for `Submitted` state.
  - Queue navigation continuity after actions: confirmed working — `performAction` refreshes via `listRequests()` and navigates to `/project-review`.
  - Column completeness: confirmed — 8 columns covering project name, project #, department, state badge, submitted by, submitted date, current owner (BIC), and actions.
  - Sort behavior: confirmed — oldest-first by `submittedAt` across all tabs.
  - Data refresh after state transitions: confirmed — `performAction` calls `listRequests()` after `advanceState()`.
- **Tests added:** 3 new tests (P3-02-001, P3-02-002, P3-02-003) covering Submitted visibility in queue and Begin Review action in detail page.
- **Classification:** confirmed repo fact (gap), implementation recommendation (fix applied)

### Priority 3 — Status/Audit/UX Hardening (Prompt-04) — COMPLETE

- **Status:** COMPLETE (2026-04-01)
- **Findings and implementation:**
  - Timeline: mid-lifecycle timestamps (`reviewStartedAt`, `awaitingExternalSetupAt`, `approvedAt`) are not tracked on `IProjectSetupRequest`. Timeline entries are constrained to events with timestamps. Documented this data-model limitation in code comments. Approval info surfaced in Operational Detail instead.
  - Operational detail: Renamed misleading "Last Updated" label to "Completed" (since the field is `completedAt`). Added "Approved By" field showing `approvedBy` when present.
  - Added `NeedsClarification` warning banner: "Clarification has been requested. Waiting for the requester to respond before review can continue."
  - Added `AwaitingExternalSetup` warning banner: "This request is on hold pending external prerequisites. Use 'Resolve Hold' above when external setup is complete."
  - `AwaitingExternalSetup` context text next-step guidance already added in P3-03.
  - All existing banners (`ReadyToProvision`, `Provisioning`, `Completed`, `Failed`) verified aligned with lifecycle semantics.
  - 4 new tests (P3-04-001 through P3-04-004) covering NeedsClarification banner, AwaitingExternalSetup banner, Approved By in operational detail, and ReadyToProvision auto-trigger messaging.
- **Classification:** confirmed repo fact (data model constraint on timeline), implementation applied (banners, labels, tests)

### Priority 4 — Admin Routing Verification (Prompt-05) — COMPLETE

- **Status:** COMPLETE (2026-04-01)
- **Critical bug found and fixed:** Accounting was constructing the Admin URL with `/provisioning-oversight` but the Admin app's actual route is `/provisioning-failures`. Fixed to use correct path.
- **Verification results:**
  - Admin route at `/provisioning-failures` validates `projectId` query param via `validateSearch` and auto-selects the matching provisioning run
  - `getAdminAppUrl()` properly degrades: returns null when env var missing/invalid, detail page shows warning banner
  - No Admin recovery controls in Accounting: no retry, archive, escalation ack, or override actions
  - "Send to Admin" correctly opens `${adminUrl}/provisioning-failures?projectId=${projectId}` in new tab
  - 1 new test (P3-05-001) verifies correct URL construction with `window.open` spy
- **Out-of-scope note:** Estimating app (`apps/estimating/src/components/project-setup/RetrySection.tsx` line 88) has the same `/provisioning-oversight` bug — should be tracked for separate fix
- **Classification:** confirmed repo fact (routing bug), implementation applied (fix + test)

### Priority 5 — Documentation Reconciliation (Prompt-06) — COMPLETE

- **Status:** COMPLETE (2026-04-01)
- **Reconciled in `controller-review-surface.md`:**
  - Fixed `HbcEmptyState` → `HbcSmartEmptyState` with context-aware messaging description
  - Added `Submitted` to "Pending Review" tab filter
  - Added `Project #` column to queue columns table
  - Added "Begin Review" action for `Submitted` state
  - Added "Resolve Hold" action for `AwaitingExternalSetup` state with projectNumber capture
  - Fixed "Route to Admin" to show correct path `/provisioning-failures?projectId=`
  - Added `Begin Review` and `Resolve Hold` API method mapping
  - Added Lifecycle Banners section (NeedsClarification, AwaitingExternalSetup, ReadyToProvision, Provisioning, Completed)
  - Updated Operational Detail section (Approved By, Completed timestamp)
  - Added `@hbc/smart-empty-state` to dependencies table
  - Updated overview to include begin review and resolve holds
- **Final readiness report produced** (this document)
- **Classification:** confirmed doc drift (reconciled)

---

## 14. Blockers and Unresolved Items — Final Status

| Item | Status | Resolution |
|------|--------|-----------|
| AwaitingExternalSetup forward action | RESOLVED (P3-03) | "Resolve Hold" action added with projectNumber capture |
| Backend contract for AwaitingExternalSetup → ReadyToProvision | Already implemented | No backend changes needed |
| projectNumber uniqueness enforcement | Already implemented (P2-03) | Backend returns 409 on duplicate |
| Admin cross-app route path | FIXED (P3-05) | Changed `/provisioning-oversight` → `/provisioning-failures` |
| Timeline mid-lifecycle timestamps | DATA MODEL CONSTRAINT (P3-04) | `IProjectSetupRequest` lacks `reviewStartedAt`/`approvedAt`; approval info shown in Operational Detail instead |
| Estimating app same route bug | OUT OF SCOPE | `apps/estimating/src/components/project-setup/RetrySection.tsx` line 88 uses `/provisioning-oversight` — tracked for separate fix |

No blocking items remain for Phase 3.

---

## 15. Phase 3 Scope Classification

| Objective | Status | Evidence |
|-----------|--------|---------|
| Queue and detail flow complete for controller role | COMPLETE | Submitted visibility (P3-02), Begin Review (P3-02), full action matrix verified |
| AwaitingExternalSetup is no longer a dead-end | COMPLETE | Resolve Hold action with projectNumber capture (P3-03) |
| Controller wording aligned with backend handoff | COMPLETE | Auto-trigger messaging verified (P3-01), banners aligned (P3-04) |
| Controller-facing status and audit context credible | COMPLETE | Lifecycle banners (P3-04), BIC detail, timeline, audit trail all present |
| Failure cases route cleanly to Admin | COMPLETE | Route path fixed (P3-05), boundary verified, degradation tested |
| Docs updated to match repo truth | COMPLETE | controller-review-surface.md fully reconciled (P3-06) |
| Final readiness report exists | COMPLETE | This document |

---

## 16. Remaining Non-Phase-3 Items

| Item | Classification | Owner |
|------|---------------|-------|
| Estimating app `/provisioning-oversight` route bug | Separate bug fix | Estimating surface |
| Timeline enrichment with mid-lifecycle timestamps | Data model enhancement | Backend / models package |
| Host, tenant, deployment configuration | Infrastructure | DevOps |
| Admin recovery implementation hardening | Phase 4+ scope | Admin surface |
| Broad workspace validation | Release gate | CI/CD |

---

## 17. Final Readiness Assessment

**Is the controller workflow functionally complete end to end?** YES.

The Accounting controller surface now supports the full Project Setup review lifecycle:

1. **Submitted** → Controller sees the request in "Pending Review" tab and can "Begin Review"
2. **UnderReview** → Controller can Approve (with projectNumber), Request Clarification, or Place on Hold
3. **NeedsClarification** → Warning banner explains the requester must respond; controller waits
4. **AwaitingExternalSetup** → Warning banner with guidance; controller can "Resolve Hold" (with projectNumber) when prerequisites are complete
5. **ReadyToProvision** → Info banner confirms provisioning is starting automatically (backend auto-trigger)
6. **Provisioning** → Info banner shows provisioning in progress
7. **Completed** → Success banner with site URL link
8. **Failed** → "Send to Admin" routes to `/provisioning-failures?projectId=` with graceful degradation when admin URL is not configured

**Are there any remaining dead-end states?** NO. All controller-owned states have forward actions.

**Is boundary discipline intact?** YES. No Admin recovery, coordinator retry, or requester response actions exist in Accounting.

**Go-forward recommendation:** The Accounting controller surface is functionally ready for later hardening phases. No Phase 3 scope items remain open.

---

## 18. Evidence Paths

### Accounting Surface Files
- `apps/accounting/src/router/routes.ts` — route definitions (5 routes)
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` — queue page (257 lines)
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` — detail page (455 lines)
- `apps/accounting/src/utils/crossAppUrls.ts` — Admin URL helper (14 lines)
- `apps/accounting/src/utils/stateDisplayHelpers.ts` — state display mapping (27 lines)
- `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` — queue tests
- `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` — detail tests
- `apps/accounting/package.json` — app manifest (version 00.000.016)

### Backend and Shared Lifecycle Files
- `backend/functions/src/functions/projectRequests/index.ts` — request lifecycle handler
- `packages/provisioning/src/bic-config.ts` — BIC ownership and action mapping

### Living Reference Docs
- `docs/reference/spfx-surfaces/controller-review-surface.md` — controller queue/review spec (reconciled in P3-06)
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md` — Admin boundary spec
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` — coordinator visibility spec
- `docs/reference/spfx-surfaces/responsive-failure-catalog.md` — failure mode catalog
- `docs/reference/provisioning/state-machine.md` — state machine reference
- `docs/reference/provisioning/saga-steps.md` — saga step reference
- `docs/reference/developer/project-setup-connected-service-posture.md` — service posture

### Phase 3 Package
- `docs/architecture/plans/MASTER/spfx/accounting/phase-3/` — canonical Phase 3 package location
- `docs/architecture/plans/MASTER/spfx/accounting/phase-3/Accounting_Phase3_Prompt_Audit_Report.md` — prior package audit (partially stale)
