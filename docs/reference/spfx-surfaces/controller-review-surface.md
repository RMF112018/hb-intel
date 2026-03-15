<!-- Tier 1 — Living Reference Document -->

# Controller Review Surface — Accounting SPFx App

**Document Class:** Living Reference (Diátaxis)
**Traceability:** W0-G4-T03 — Accounting Controller Queue and Structured Review Surface
**Spec:** `docs/architecture/plans/MVP/G4/W0-G4-T03-Accounting-Controller-Queue-and-Structured-Review-Surface.md`

---

## Overview

The controller review surface provides Accounting controllers with a queue-based review experience for project setup requests submitted by Estimating coordinators. Controllers can approve, request clarification, place on hold, or route failed requests to Admin.

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/project-review` | `ProjectReviewQueuePage` | Filtered queue table |
| `/project-review/$requestId` | `ProjectReviewDetailPage` | Structured review + actions |

## Queue Page

### Filter Tabs

| Tab ID | Label | State Filter |
|--------|-------|-------------|
| `pending` | Pending Review | `UnderReview` |
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
| Actions | — | "Open" button navigates to detail |

### Empty State

`HbcEmptyState` with title "No requests pending review."

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
- Last-updated timestamp

### History Section

- `HbcStatusTimeline` (standard-gated) — built from request state transitions
- `HbcAuditTrailPanel` (expert-gated) — full operational audit trail

### Action Panel

All state transitions use `advanceState()` via provisioning API client.

| Action | Button | Visible When | State Transition | Confirmation |
|--------|--------|-------------|-----------------|-------------|
| Approve | Primary "Approve Request" | `UnderReview` | → `ReadyToProvision` | `HbcConfirmDialog` |
| Request Clarification | Secondary "Request Clarification" | `UnderReview` | → `NeedsClarification` | `HbcModal` with `HbcTextArea` |
| Place on Hold | Secondary "Place on Hold" | `UnderReview` | → `AwaitingExternalSetup` | `HbcConfirmDialog` |
| Route to Admin | Secondary "Send to Admin" | `Failed` | Navigation only | None |

### API Method Mapping

No dedicated `approveRequest` / `requestClarification` / `holdRequest` methods. All transitions use:

```typescript
client.advanceState(requestId, newState, extras?)
```

- Approve: `advanceState(id, 'ReadyToProvision')`
- Clarification: `advanceState(id, 'NeedsClarification', { clarificationNote })`
- Hold: `advanceState(id, 'AwaitingExternalSetup')`

### Toast Notifications

Success actions show `toast.success()` and navigate back to queue.
Failures display `HbcBanner variant="error"`.

## Boundary: T03 vs T04

- **T03 (this surface):** Controller review, approve, clarify, hold, route-to-admin
- **T04 (Admin):** Admin retry, recovery, escalation handling — separate admin surface

## Dependencies

| Package | Usage |
|---------|-------|
| `@hbc/provisioning` | API client, store, BIC config, display labels |
| `@hbc/bic-next-move` | `HbcBicDetail`, `resolveFullBicState` |
| `@hbc/complexity` | `HbcComplexityGate` for tier gating |
| `@hbc/ui-kit` | All visual components, toast, layout |
| `@hbc/auth` | `useCurrentSession` for token resolution |
| `@hbc/models` | `IProjectSetupRequest`, type definitions |
