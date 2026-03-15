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

Accepts `?projectId=` query parameter for cross-app pre-selection from Estimating (coordinator "Open Admin Recovery") and Accounting (controller "Send to Admin").

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

## Admin-Exclusive Actions

All actions use `createProvisioningApiClient` — no bespoke fetch calls.

| Action | Button | Visible When | API Method | Confirmation |
|--------|--------|-------------|------------|-------------|
| Force Retry | Primary "Force Retry" | `overallStatus === 'Failed'` | `retryProvisioning(projectId)` | `HbcConfirmDialog` (danger) with idempotency warning |
| Archive Failure | Secondary "Archive" | `overallStatus === 'Failed'` | `archiveFailure(projectId)` | `HbcConfirmDialog` (warning) |
| Acknowledge Escalation | Secondary "Ack Escalation" | `escalatedBy` is set | `acknowledgeEscalation(projectId)` | None (immediate) |
| Manual State Override | Primary "Override State" | Expert-tier + stuck in transitional state | `forceStateTransition(projectId, targetState)` | `HbcConfirmDialog` (danger) with data inconsistency warning |

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

## Role Boundary

| Excluded Behavior | Reason | Correct Surface |
|-------------------|--------|----------------|
| Request intake form | Requester function | Estimating (T01) |
| Approval / clarification | Controller function | Accounting (T03) |
| Bounded transient retry | Coordinator function | Estimating (T02) |
| Requester status view | Requester's view | Estimating (T01) |
| Project Hub handoff | Completion function | T05 |

Admin owns: full oversight, escalation acknowledgment, force-retry (regardless of failure class), archival, and expert-tier diagnostic recovery detail.

## API Method Gaps

The following methods were added to `IProvisioningApiClient` for T04:
- `listProvisioningRuns(status?)` — lists all runs with optional status filter
- `archiveFailure(projectId)` — archives a failed run
- `acknowledgeEscalation(projectId)` — acknowledges an escalated run
- `forceStateTransition(projectId, targetState)` — forces a state override

Backend implementation of these endpoints is deferred to G2 backend hardening.

## Missing Diagnostic Fields

The following expert-tier diagnostic fields from the spec (§7.1) are not yet on `IProvisioningStatus`:
- `errorDetails` (raw error stack) — use `steps[].errorMessage` as partial substitute
- `stepContext` (step input/output context) — use `steps[].metadata` as partial substitute
- Graph API call sequence — not available; document gap for future backend amendment

These sections render conditionally — only when data is present on the model.

## Dependencies

| Package | Usage |
|---------|-------|
| `@hbc/provisioning` | API client, store |
| `@hbc/complexity` | `HbcComplexityGate` for tier gating |
| `@hbc/ui-kit` | All visual components, toast, layout |
| `@hbc/auth` | `useCurrentSession` for token resolution, admin access gating |
| `@hbc/models` | `IProvisioningStatus`, `ISagaStepResult`, type definitions |
