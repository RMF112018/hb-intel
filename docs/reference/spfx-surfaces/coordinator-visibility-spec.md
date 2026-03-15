<!-- Tier 1 — Living Reference (Diátaxis) -->

# Estimating Coordinator Visibility & Limited Retry — Reference

**Traceability:** W0-G4-T02
**Document Class:** Living Reference (Diátaxis)
**Surface:** Estimating App — Project Setup pages

---

## 1. Coordinator Queue (ProjectSetupPage)

The coordinator queue is visible at `/project-setup` for users at **standard** complexity tier and above. Essential-tier users (requesters) see the existing simple list.

### Columns

| Column | Source | Display |
|--------|--------|---------|
| Project Name | `request.projectName` | Link to `/project-setup/$requestId` |
| Department | `request.department` | `DEPARTMENT_DISPLAY_LABELS[dept]` |
| State | `request.state` | `HbcStatusBadge` with `getStateBadgeVariant()` |
| Current Owner | BIC resolution via `resolveFullBicState()` | Owner display name or "System" |
| Submitted | `request.submittedAt` | Date string |
| Actions | Contextual | See §1.1 |

### 1.1 Row Actions

| Request State | Condition | Action |
|---------------|-----------|--------|
| `Failed` | `canCoordinatorRetry(status) === true` | "Retry" button → `retryProvisioning(projectId)` |
| `Failed` | Not retryable + `failureClass` defined | "Escalate" button → `escalateProvisioning(projectId, escalatedBy)` |
| `NeedsClarification` | — | "Awaiting Response" text |

### 1.2 Table Configuration

- `enableSorting`: true
- `enablePagination`: true
- `pageSize`: 25
- `height`: 600px

---

## 2. Detail Page Coordinator Sections (RequestDetailPage)

### 2.1 Failure Detail Card

Visible at **standard** tier when `request.state === 'Failed'` and `provisioningStatus` is available.

Displays:
- Failed step name and number (from `getFailedStep()`)
- Failure classification badge (`HbcStatusBadge`) — or "Pending" when `failureClass` is undefined
- Human-readable error message (`step.errorMessage`)
- Retry count (`status.retryCount`)
- Last retry timestamp (`status.lastRetryAt`)

At **expert** tier: raw step metadata as monospace text.

### 2.2 Retry / Escalation Section

Visible at **standard** tier. Three rendering paths:

1. **`canCoordinatorRetry(status) === true`**: Primary "Retry Provisioning" button
2. **Not retryable + `failureClass` defined**: Warning banner + "Open Admin Recovery" button
3. **`failureClass === undefined`**: Renders nothing (spec R1)

### 2.3 Detailed Provisioning Checklist

Standard+ tier receives `detailLevel="detailed"` which adds:
- Step duration (computed from `startedAt` → `completedAt`)
- Start timestamp for in-progress steps
- Metadata notes for steps with populated `metadata`

Essential tier receives `detailLevel="summary"` (existing behavior).

---

## 3. Failure Classification Display Rules

`failureClass` is **always** assigned by the backend. The frontend never infers failure class from error strings (spec §8.2).

| Failure Class | Badge Variant | Coordinator Retryable | Description |
|---------------|---------------|----------------------|-------------|
| `transient` | `warning` | Yes (max 2) | Temporary issue; coordinator retry may resolve |
| `structural` | `error` | No | Configuration issue requiring Admin intervention |
| `permissions` | `error` | No | Missing permissions; Admin must grant access |
| `repeated` | `info` | No | Multiple occurrences; Admin review required |
| `admin-class` | `error` | No | Requires Admin-level recovery |

---

## 4. Retry Eligibility (5-Condition Check)

`canCoordinatorRetry(status)` returns `true` only when ALL conditions are met:

1. `status.overallStatus === 'Failed'`
2. `status.failureClass !== undefined` (spec R1)
3. `status.failureClass === 'transient'`
4. `status.retryCount < 2` (bounded limit)
5. `status.escalatedBy == null` (not already escalated)

---

## 5. Complexity Gating Assignments

| Surface | Essential (Requester) | Standard (Coordinator) | Expert |
|---------|-----------------------|------------------------|--------|
| Queue list | Simple `<ul>` list | `HbcDataTable` with columns/actions | Same as standard |
| BIC ownership | `HbcBicBadge` (compact) | `HbcBicDetail` (expanded with chain) | Same as standard |
| Provisioning checklist | Summary detail | Detailed (duration, timestamps, metadata) | Same as standard |
| Failure detail card | Hidden | Visible | + raw metadata |
| Retry/escalation | Hidden | Visible | Same as standard |

---

## 6. BIC Component Rendering Tiers

- **Essential:** `HbcBicBadge<IProjectSetupRequest>` with `PROJECT_SETUP_BIC_CONFIG` — compact owner display
- **Standard+:** `HbcBicDetail<IProjectSetupRequest>` with `PROJECT_SETUP_BIC_CONFIG` and `showChain` — expanded ownership with due date, blocked banner, ownership chain

---

## 7. Out-of-Bounds Failure Routing

When a failure cannot be retried by the coordinator (structural, permissions, repeated, admin-class, or transient with exhausted retries), the UI shows:
- `HbcBanner variant="warning"` with headline "This failure requires Admin recovery"
- Body text from `FAILURE_CLASS_DESCRIPTIONS[failureClass]`
- "Open Admin Recovery" button that escalates the provisioning run

Admin console recovery (T03/T04) is a separate scope.
