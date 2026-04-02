<!-- Tier 1 — Living Reference Document -->

# Admin Recovery Boundary — Admin SPFx App

**Document Class:** Living Reference (Diátaxis)
**Traceability:** W0-G4-T04 — Admin Oversight, Escalation, and Recovery Surface Boundaries
**Spec:** `docs/architecture/plans/MVP/G4/W0-G4-T04-Admin-Oversight-Escalation-and-Recovery-Surface-Boundaries.md`

---

## Overview

The Admin provisioning oversight surface provides administrators with full visibility into all provisioning runs (active, failed, completed) and exclusive recovery actions. It is the authoritative admin-class recovery experience for provisioning execution.

## Route

| Route | Component | Purpose |
|-------|-----------|---------|
| `/provisioning-failures` | `ProvisioningOversightPage` | State-filtered oversight queue + detail modal |

Accepts `?projectId=` query parameter for cross-app pre-selection from Estimating (coordinator "Open Admin Recovery") and Accounting (controller "Send to Admin"). When multiple provisioning runs exist for the same project, the page selects the **latest run by `startedAt`** timestamp (P5-02). Query parameters are read via TanStack Router's validated search params (`useSearch`), not manual `URLSearchParams`.

## State Filter Tabs

| Tab ID | Label | Filter |
|--------|-------|--------|
| `active` | Active Runs | `overallStatus` in NotStarted, InProgress, BaseComplete, WebPartsPending |
| `failures` | Failures | `overallStatus === 'Failed'` |
| `completed` | Completed | `overallStatus === 'Completed'` (capped at 50 records, newest first) |
| `all` | All | No filter |

Default tab: `failures`.

## Queue Columns

| Column | Source | Display |
|--------|--------|---------|
| Project # | `projectNumber` | Text |
| Project Name | `projectName` | Text |
| Status | `overallStatus` + `escalatedBy` | `HbcStatusBadge` + "Escalated" warning badge if escalated |
| Failure Class | `failureClass` | `HbcStatusBadge` with `FAILURE_CLASS_BADGE_VARIANT` |
| Current Step | `steps[]` | Step number + name (failed or in-progress) |
| Triggered By | `triggeredBy` | Text |
| Started | `startedAt` | Formatted date |
| Actions | — | Details, Force Retry, Archive, Ack Escalation |

## Action Boundary Classification (P5-03)

All actions use `createProvisioningApiClient` — no bespoke fetch calls.

### Admin-Exclusive Actions (L2 + L3 Admin)

These actions are gated by both delegated scope and admin app-role at the backend. Only Admin-role users can invoke them.

| Action | Button | Visible When | API Method | Confirmation |
|--------|--------|-------------|------------|-------------|
| Archive Failure | Secondary "Archive" | `overallStatus === 'Failed'` | `archiveFailure(projectId)` | `HbcConfirmDialog` (warning) |
| Acknowledge Escalation | Secondary "Ack Escalation" | `escalatedBy` is set | `acknowledgeEscalation(projectId)` | None (immediate) |
| Manual State Override | Primary "Override State" | Expert-tier + stuck in transitional state | `forceStateTransition(projectId, targetState)` | `HbcConfirmDialog` (danger) with data inconsistency warning |

### Shared Exception Actions (L2 Delegated Scope)

These actions are accessible to any authenticated user with `access_as_user` scope. Both coordinators (Estimating) and admins (Admin) invoke them through the same backend endpoints. The backend enforces `overallStatus === 'Failed'` as a state guard (P5-03). Coordinator-tier business rules (transient-only, max 2, not escalated) are enforced at the frontend only.

| Action | Admin UI | Estimating UI | API Method | Backend State Guard |
|--------|----------|--------------|------------|-------------------|
| Force Retry | "Force Retry" button (no class restriction) | "Retry Provisioning" button (`canCoordinatorRetry()` gate) | `retryProvisioning(projectId)` | `overallStatus === 'Failed'` (P5-03) |
| Escalation | Not directly invoked from Admin | "Escalate to Admin" button | `escalateProvisioning(projectId, escalatedBy)` | `overallStatus === 'Failed'` (P5-03) |

## Detail Modal

Opened via row "Details" button or `?projectId=` query param.

### Essential Tier (always visible)
- Project number, name, status badge, escalation indicator
- Triggered by, submitted by, timestamps
- Retry count, last retry, escalation info
- Site URL (if provisioned)

### Standard Tier (`HbcComplexityGate minTier="standard"`)
- Full provisioning step log (`HbcDataTable<ISagaStepResult>`)
- Step number, name, status badge, start time, duration

### Expert Tier (`HbcComplexityGate minTier="expert"`)
- Step error messages (monospace pre-formatted)
- Step metadata (JSON formatted)
- Entra ID group IDs (leaders, team, viewers)
- Internal identifiers (project ID, correlation ID)
- Step 5 deferred-to-timer status
- Manual state override (select + confirm)

## Complexity Tier Assignment

Admin users (`HBC-Admin`, `HBIntelAdmin`) resolve to `expert` tier in `@hbc/complexity` role mapping. This enables full diagnostic visibility.

> **Phase 1 Boundary Freeze Reference:** The Admin recovery boundary, exclusive actions, and prohibited scope are frozen in `docs/architecture/reviews/phase-1-application-boundary-freeze.md`. Admin is the authoritative operational recovery surface — not an approval or review surface.

## Role Boundary

| Excluded Behavior | Reason | Correct Surface |
|-------------------|--------|----------------|
| Request intake form | Requester function | Estimating (T01) |
| Approval / clarification | Controller function | Accounting (T03) |
| Bounded transient retry | Coordinator function | Estimating (T02) |
| Requester status view | Requester's view | Estimating (T01) |
| Project Hub handoff | Completion function | T05 |

Admin owns: full oversight, escalation acknowledgment, force-retry (regardless of failure class), archival, and expert-tier diagnostic recovery detail.

## Phase 4 Mutation Reconciliation

Admin mutations interact with both provisioning status and the linked request record:

| Action | Status change | Request reconciliation | Run identity |
|--------|--------------|----------------------|-------------|
| Force Retry | New run (InProgress) | -> Provisioning (via saga execute) | New correlationId |
| Archive Failure | -> Completed | -> Completed (P4-04) | Edits latest run |
| Acknowledge Escalation | Clears markers | No change | Edits latest run |
| Force State Override | -> target state | -> target if terminal (P4-04) | Edits latest run |
| Escalation | Sets markers | No change | Edits latest run |

All request reconciliation is non-blocking — failure is logged but does not break the admin action.

## API Methods

The following methods are implemented on `IProvisioningApiClient` for T04:
- `listProvisioningRuns(status?)` — lists all runs with optional status filter
- `retryProvisioning(projectId)` — triggers a new saga run (new correlationId)
- `archiveFailure(projectId)` — archives a failed run, reconciles request to Completed
- `acknowledgeEscalation(projectId)` — clears escalation markers
- `forceStateTransition(projectId, targetState)` — forces state, reconciles request on terminal targets

## Diagnostic Fields

The following expert-tier diagnostic fields from the spec (§7.1) are not yet on `IProvisioningStatus`:
- `errorDetails` (raw error stack) — use `steps[].errorMessage` as partial substitute
- `stepContext` (step input/output context) — use `steps[].metadata` as partial substitute
- Graph API call sequence — not available; document gap for future backend amendment

The following fields are available after P4-02 persistence hardening:
- `failureClass` — backend-assigned failure classification (rendered in queue and detail)
- `escalatedBy` + `escalatedAt` — escalation markers (rendered as badge and in detail)
- `lastRetryAt` — most recent retry timestamp (rendered in detail)
- `entraGroups` — Entra ID group IDs from Step 6 (expert-tier detail)

These sections render conditionally — only when data is present on the model.

## Dependencies

| Package | Usage |
|---------|-------|
| `@hbc/provisioning` | API client, store |
| `@hbc/complexity` | `HbcComplexityGate` for tier gating |
| `@hbc/ui-kit` | All visual components, toast, layout |
| `@hbc/auth` | `useCurrentSession` for token resolution, admin access gating |
| `@hbc/models` | `IProvisioningStatus`, `ISagaStepResult`, type definitions |
