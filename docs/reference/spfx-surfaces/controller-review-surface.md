<!-- Tier 1 — Living Reference Document -->

# Controller Review Surface — Accounting SPFx App

**Document Class:** Living Reference (Diátaxis)
**Traceability:** W0-G4-T03 — Accounting Controller Queue and Structured Review Surface
**Spec:** `docs/architecture/plans/MVP/G4/W0-G4-T03-Accounting-Controller-Queue-and-Structured-Review-Surface.md`

---

## Overview

The controller review surface provides Accounting controllers with a queue-based review experience for project setup requests submitted by Estimating coordinators. Controllers can begin review, approve, request clarification, place on hold, resolve holds, or route failed requests to Admin.

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/project-review` | `ProjectReviewQueuePage` | Filtered queue table |
| `/project-review/$requestId` | `ProjectReviewDetailPage` | Structured review + actions |

## Queue Page

### Filter Tabs

| Tab ID | Label | State Filter |
|--------|-------|-------------|
| `pending` | Pending Review | `Submitted`, `UnderReview` |
| `clarification` | Awaiting Re-Submission | `NeedsClarification` |
| `external` | Awaiting External Setup | `AwaitingExternalSetup` |
| `failed` | Failed / Needs Routing | `Failed` |

Default tab: `pending`. Sort: oldest-first by `submittedAt`.

### Queue Columns

| Column | Source | Display |
|--------|--------|---------|
| Project Name | `projectName` | Link to detail route |
| Department | `department` | `DEPARTMENT_DISPLAY_LABELS` lookup |
| State | `state` | `HbcStatusBadge` |
| Submitted By | `submittedBy` | Text |
| Submitted | `submittedAt` | `toLocaleDateString()` |
| Current Owner | BIC via `resolveFullBicState()` | Display name or "System" |
| Project # | `projectNumber` | Text or "—" when null |
| Actions | — | "Open" button navigates to detail |

### Empty State

`HbcSmartEmptyState` with context-aware messaging:
- **Filter-empty:** "No requests match this filter. Try a different tab." with "Show Pending Review" clear action.
- **Truly-empty:** "Requests will appear here once submitted for review."

### Complexity Gating

- **Essential tier:** Simple `<ul>` list fallback
- **Standard+ tier:** Full `HbcDataTable` with sorting and pagination

## Review Detail Page

### Core Summary Section (always visible)

- Project name (`HbcTypography heading2`)
- Status badge (`HbcStatusBadge`)
- State context text
- BIC ownership detail (`HbcBicDetail`, standard-gated)
- Project type, stage, department
- Submitted by, submitted at

### Request Detail Section (`HbcCard`)

- Team members, group leaders, project lead
- Contract type, estimated value, client name, start date
- Add-ons
- Clarification items (read-only display with status)

### Operational Detail (standard-gated)

- Internal request ID
- Approved By (when approval has occurred)
- Completed timestamp (when request is completed)

### History Section

- `HbcStatusTimeline` (standard-gated) — built from request state transitions
- `HbcAuditTrailPanel` (expert-gated) — full operational audit trail

### Action Panel

All state transitions use `advanceState()` via provisioning API client.

| Action | Button | Visible When | State Transition | Confirmation |
|--------|--------|-------------|-----------------|-------------|
| Begin Review | Primary "Begin Review" | `Submitted` | → `UnderReview` | None |
| Approve | Primary "Approve Request" | `UnderReview` | → `ReadyToProvision` | `HbcModal` with `HbcTextField` for `projectNumber` (format: `##-###-##`, validated client-side) |
| Request Clarification | Secondary "Request Clarification" | `UnderReview` | → `NeedsClarification` | `HbcModal` with `HbcTextArea` |
| Place on Hold | Secondary "Place on Hold" | `UnderReview` | → `AwaitingExternalSetup` | `HbcConfirmDialog` |
| Resolve Hold | Primary "Resolve Hold" | `AwaitingExternalSetup` | → `ReadyToProvision` | `HbcModal` with `HbcTextField` for `projectNumber` (format: `##-###-##`, validated client-side) |
| Route to Admin | Secondary "Send to Admin" | `Failed` | Navigation to `/provisioning-failures?projectId=` | None |

### API Method Mapping

No dedicated `approveRequest` / `requestClarification` / `holdRequest` methods. All transitions use:

```typescript
client.advanceState(requestId, newState, extras?)
```

- Begin Review: `advanceState(id, 'UnderReview')`
- Approve: `advanceState(id, 'ReadyToProvision', { projectNumber })` — requires valid `##-###-##` format
- Clarification: `advanceState(id, 'NeedsClarification', { clarificationNote })`
- Hold: `advanceState(id, 'AwaitingExternalSetup')`
- Resolve Hold: `advanceState(id, 'ReadyToProvision', { projectNumber })` — same contract as Approve

> **Phase 1 Freeze Reference:** The exact approval action contract, including `projectNumber` capture, auto-trigger behavior, and system ownership of `ReadyToProvision`, is frozen in `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`.

### Toast Notifications

Success actions show `toast.success()` and navigate back to queue.
Failures display `HbcBanner variant="error"`.

### Lifecycle Banners

| State | Variant | Message |
|-------|---------|---------|
| `NeedsClarification` | warning | Waiting for the requester to respond before review can continue. |
| `AwaitingExternalSetup` | warning | On hold pending external prerequisites. Use "Resolve Hold" when complete. |
| `ReadyToProvision` | info | Approved with project number. Provisioning is starting automatically. |
| `Provisioning` | info | Project site provisioning is in progress. |
| `Completed` | success | Project site provisioned successfully (with site URL link when available). |

> **Phase 1 Boundary Freeze Reference:** The Accounting surface boundary, prohibited actions, and interaction with Estimating/Admin surfaces are frozen in `docs/architecture/reviews/phase-1-application-boundary-freeze.md`. Accounting is a review gate and approval-to-handoff gate — not a retry, recovery, or archive surface.

## Phase 4 Reconciliation Boundary

The controller surface operates exclusively on request-lifecycle state transitions (`IProjectSetupRequest`). The provisioning execution state (`IProvisioningStatus`) is owned by the Admin surface (T04). Request state reflects provisioning truth at terminal boundaries:

- **Provisioning** — set by saga start (request stays here until terminal)
- **Completed** — reconciled by saga completion, timer success, admin archive, or admin force-state
- **Failed** — reconciled by saga failure, timer ceiling, or admin force-state

The controller surface does not need to read or act on `IProvisioningStatus` directly. When provisioning fails, the controller sees request state `Failed` and can route to Admin via "Send to Admin."

## Boundary: T03 vs T04

- **T03 (this surface):** Controller review, approve, clarify, hold, route-to-admin
- **T04 (Admin):** Admin retry, recovery, escalation handling — separate admin surface

## Dependencies

| Package | Usage |
|---------|-------|
| `@hbc/provisioning` | API client, store, BIC config, display labels |
| `@hbc/bic-next-move` | `HbcBicDetail`, `resolveFullBicState` |
| `@hbc/complexity` | `HbcComplexityGate` for tier gating |
| `@hbc/smart-empty-state` | `HbcSmartEmptyState` for context-aware empty states |
| `@hbc/ui-kit` | All visual components, toast, layout |
| `@hbc/auth` | `useCurrentSession` for token resolution |
| `@hbc/models` | `IProjectSetupRequest`, type definitions |
