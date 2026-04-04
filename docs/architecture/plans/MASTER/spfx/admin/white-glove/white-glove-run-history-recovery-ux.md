# White-Glove Run History, Evidence, and Recovery UX

## Purpose

Document the SPFx operator console pages for white-glove package run history, device run detail, evidence browsing, and guided recovery.

## Pages

### Run History (`/white-glove/history`)

Paginated list of package run summaries:
- Status filter buttons (All, Running, AwaitingCheckpoint, Completed, PartiallyCompleted, Failed, Cancelled)
- Each run shows: employee name, package family, status badge, launched timestamp, device count summary
- Click-through to detail page
- Pagination (Previous/Next)
- Empty state with coaching tip and launch link

**Data source:** `GET /api/admin/white-glove/runs?page=&pageSize=&status=`

### Run Detail (`/white-glove/history/$runId`)

Full package run detail with device drill-down:

**Header card:**
- Package family, overall status badge
- Employee name and UPN
- Template version, launched/completed timestamps
- Device progress summary (completed/total, failed count)

**Device run cards (per device):**
- Platform, serial number, asset tag, hostname
- Device status badge with progress indicator
- Failure banner (failure class, message, retry count, eligibility)
- Checkpoint history (type, label, status badge per checkpoint)
- Evidence summary (label, adapter source, timestamp — inline summary, not full payload)
- Per-device retry button (permission-gated, only for retryable failures)

**Recovery actions (permission-gated):**
- Retry Failed Devices — creates new package run for failed devices
- Cancel Package Run — cancels parent and all non-terminal children
- Refresh — reloads current state

**Audit trail:**
- Recent audit events with timestamp, event type, and summary

**Data source:** `GET /api/admin/white-glove/runs/{runId}`

## Routing

| Lane ID | Path | Label | Order |
|---------|------|-------|-------|
| `white-glove-history` | `/white-glove/history` | WG History | 13 |
| — (sub-route) | `/white-glove/history/$runId` | (detail) | — |

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWhiteGloveRunHistory` | `apps/admin/src/hooks/useWhiteGloveRunHistory.ts` | Paginated run list with status filter |
| `useWhiteGloveRunDetail` | `apps/admin/src/hooks/useWhiteGloveRunDetail.ts` | Single run detail + retry/cancel actions |

## Recovery UX

| Action | Permission | Backend endpoint | Condition |
|--------|-----------|-----------------|-----------|
| Retry package | `admin:access-control:view` | `POST /runs/{runId}/retry` | Failed or PartiallyCompleted |
| Retry device | `admin:access-control:view` | `POST /devices/{deviceRunId}/retry` | Device failed + retryEligible |
| Cancel package | `admin:access-control:view` | `POST /runs/{runId}/cancel` | Not in terminal status |

All recovery actions are permission-gated via `PermissionGate` and use only backend-provided data. No unsafe recovery logic in SPFx.

## Evidence display

Evidence is shown as inline summaries per device:
- Evidence label, adapter source, captured timestamp
- Full evidence payload is NOT displayed inline — it remains in backend storage
- Evidence ID available for future deep-link or download feature

## Cross-references

- [Launch/checkpoint UX](white-glove-launch-checkpoint-ux.md)
- [Connections/readiness UX](white-glove-connections-readiness-ux.md)
- [Run spine](../../../../../reference/white-glove/white-glove-run-spine.md)
