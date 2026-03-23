# P3-E7-T03 — Lifecycle State, Actions, and Governance

**Doc ID:** P3-E7-T03
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 3 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Lifecycle Architecture Principle

All `IssuedPermit` status changes flow exclusively through `PermitLifecycleAction` records. Direct mutation of `IssuedPermit.currentStatus` is rejected at the API layer. This ensures a complete, tamper-proof, sequenced lifecycle audit trail.

`PermitApplication` manages its own separate status lifecycle (pre-issuance). When an application is approved, the system creates the first `IssuedPermit` record and the first `PermitLifecycleAction` with `actionType = ISSUED`.

---

## 2. PermitApplication Lifecycle

### 2.1 State Diagram

```
DRAFT ──────────────────────────────────────────────→ WITHDRAWN
  │
  ▼
SUBMITTED ──────────────────────────────────────────→ WITHDRAWN
  │
  ▼
UNDER_REVIEW ────────────────────────────────────────→ WITHDRAWN
  │                    │
  ▼                    ▼
ADDITIONAL_INFO   ─→ UNDER_REVIEW
_REQUIRED
  │
  ├──────────→ APPROVED  ──────────→ (creates IssuedPermit)
  │
  └──────────→ REJECTED  (terminal)
```

### 2.2 Transition Rules

| From | To | Trigger | Required Fields |
|---|---|---|---|
| `DRAFT` | `SUBMITTED` | User action: submit application | `submittedById`, `applicationDate` |
| `SUBMITTED` | `UNDER_REVIEW` | System or manual: jurisdiction acknowledged | — |
| `UNDER_REVIEW` | `ADDITIONAL_INFO_REQUIRED` | Manual: jurisdiction requests info | Notes required |
| `ADDITIONAL_INFO_REQUIRED` | `UNDER_REVIEW` | Manual: additional info provided | — |
| `UNDER_REVIEW` | `APPROVED` | Manual: jurisdiction approved | `jurisdictionResponseDate` |
| `UNDER_REVIEW` | `REJECTED` | Manual: jurisdiction denied | `rejectionReason` required |
| Any non-terminal | `WITHDRAWN` | User action: withdraw application | Notes required |

### 2.3 Approval Side Effect

When `applicationStatus` transitions to `APPROVED`:
1. System creates `IIssuedPermit` record with `currentStatus = ACTIVE`
2. System creates first `IPermitLifecycleAction` with `actionType = ISSUED`, linking back to the application
3. `PermitApplication.issuedPermitId` is set to the new permit's ID
4. Work queue item "New Permit Activated" is published (see T05 §3)

---

## 3. IssuedPermit Lifecycle

### 3.1 State Diagram

```
                          ISSUED (created)
                               │
                               ▼
                            ACTIVE ◄──────────────────────────────────────┐
                           /   │   \                                       │
                          /    │    \                                      │
                         ▼     ▼     ▼                                     │
              UNDER_    ACTIVE_ RENEWAL_IN_                                │
             INSPECTION EXPIRING PROGRESS ─────────→ RENEWED ─────────────┘
                  │                │
                  │                └──────────→ EXPIRED (terminal unless renewed)
                  │
                  ├──────────────────────────→ SUSPENSION_ISSUED
                  │                                    │
                  │                            SUSPENSION_LIFTED → ACTIVE
                  │
                  ├──────────────────────────→ STOP_WORK
                  │                                    │
                  │                           STOP_WORK_LIFTED → ACTIVE
                  │
                  ├──────────────────────────→ VIOLATION_ISSUED
                  │                                    │
                  │                          VIOLATION_RESOLVED → ACTIVE
                  │
                  ▼
                CLOSED (terminal — success)
                REVOKED (terminal — failure)
```

### 3.2 PermitLifecycleAction Transition Table

| actionType | previousStatus | newStatus | Notes Required | Ack Required |
|---|---|---|---|---|
| `ISSUED` | — (creation) | `ACTIVE` | No | No |
| `ACTIVATED` | `ACTIVE` | `ACTIVE` | No | No |
| `INSPECTION_PASSED` | Any active | Same | No | No |
| `INSPECTION_FAILED` | Any active | Same | Yes | No |
| `DEFICIENCY_OPENED` | Any active | Same | Yes | No |
| `DEFICIENCY_RESOLVED` | Any active | Same | Yes | Yes |
| `STOP_WORK_ISSUED` | Any active | `STOP_WORK` | Yes (reason) | Yes |
| `STOP_WORK_LIFTED` | `STOP_WORK` | `ACTIVE` | Yes | Yes |
| `VIOLATION_ISSUED` | Any active | `VIOLATION_ISSUED` | Yes | Yes |
| `VIOLATION_RESOLVED` | `VIOLATION_ISSUED` | `ACTIVE` | Yes | No |
| `SUSPENSION_ISSUED` | Any active | `SUSPENDED` | Yes (reason) | Yes |
| `SUSPENSION_LIFTED` | `SUSPENDED` | `ACTIVE` | Yes | No |
| `RENEWAL_INITIATED` | `ACTIVE` or `ACTIVE_EXPIRING` | `RENEWAL_IN_PROGRESS` | No | No |
| `RENEWAL_APPROVED` | `RENEWAL_IN_PROGRESS` | `RENEWED` | No | No |
| `RENEWAL_DENIED` | `RENEWAL_IN_PROGRESS` | `EXPIRED` | Yes (reason) | No |
| `EXPIRED` | Any active or `RENEWAL_IN_PROGRESS` | `EXPIRED` | No | No |
| `REVOKED` | Any non-terminal | `REVOKED` | Yes | Yes |
| `CLOSED` | `ACTIVE` | `CLOSED` | No | No |
| `CORRECTION_ISSUED` | Any active | Same | Yes | No |
| `EXPIRATION_WARNING` | Any active | `ACTIVE_EXPIRING` | No | No |

### 3.3 System-Driven Transitions

The following transitions are triggered by the system rather than manual user action:

| Trigger | actionType | Condition |
|---|---|---|
| Daily expiration sweep | `EXPIRATION_WARNING` | `daysToExpiration ≤ 30` and `currentStatus = ACTIVE` |
| Daily expiration sweep | `EXPIRED` | `expirationDate < today` and `currentStatus ≠ CLOSED | REVOKED | EXPIRED` |
| All required checkpoints pass | `CLOSED` | All `isBlockingCloseout = true` checkpoints have `currentResult = PASS` |

### 3.4 Terminal States

| Status | Description | Recovery Path |
|---|---|---|
| `EXPIRED` | Permit expired without renewal | None; new PermitApplication required |
| `REVOKED` | Jurisdiction revoked | None; new PermitApplication required |
| `CLOSED` | Successfully closed out | None; record is archived |
| `REJECTED` (Application) | Application denied | New application may be submitted |

---

## 4. Governance Constraints

### 4.1 Status Immutability Rule

Once `IssuedPermit.currentStatus` enters a terminal state (`EXPIRED`, `REVOKED`, `CLOSED`), no further `PermitLifecycleAction` records may be created for that permit. Attempts are rejected with a validation error.

### 4.2 Required Action for Status Change

The API endpoint for creating a `PermitLifecycleAction` enforces:

1. `issuedPermitId` must reference an existing, non-terminal `IssuedPermit`
2. `previousStatus` in the action must match the current `IssuedPermit.currentStatus`
3. The `previousStatus → newStatus` combination must appear in the transition table above
4. Notes are validated as non-empty when `notesRequired = true` for that action type
5. On success: `IssuedPermit.currentStatus` is updated to `newStatus` and `currentStatusSetByActionId` is set

### 4.3 Acknowledgment Workflow

When `requiresAcknowledgment = true` on a `PermitLifecycleAction`:

1. Action record is created with `acknowledgedAt = null`
2. A work queue item "Permit Action Requires Acknowledgment" is published to `nextActionOwnerId`
3. The responsible party uses `@hbc/acknowledgment` to confirm
4. On acknowledgment: `acknowledgedAt` and `acknowledgedByUserId` are set on the action record
5. The work queue item is resolved

### 4.4 Stop-Work and Violation Blocking

When `currentStatus = STOP_WORK` or `VIOLATION_ISSUED`:

- `IssuedPermit.blockedByPartyId` is set to the jurisdiction party ID
- All linked `RequiredInspectionCheckpoint` records are flagged `isBlockingCloseout = true` (if not already)
- Health spine publishes `CRITICAL` health tier immediately
- A high-priority work queue item is generated for the permit owner

### 4.5 Renewal Lifecycle

```
ACTIVE_EXPIRING ──→ RENEWAL_INITIATED ──→ RENEWAL_IN_PROGRESS
                                              │          │
                                         RENEWAL_    RENEWAL_
                                         APPROVED    DENIED
                                              │          │
                                         RENEWED     EXPIRED
                                              │
                                     (new expirationDate set;
                                      renewalDate set;
                                      health tier recalculated)
```

When `RENEWAL_APPROVED`:
- `IssuedPermit.renewalDate` = today
- `IssuedPermit.expirationDate` = new expiration from jurisdiction
- `expirationRiskTier` is recalculated
- `derivedHealthTier` is recalculated
- Previous expiration-related work queue items are resolved

---

## 5. PermitApplication Governance

### 5.1 Editing Rules

| Status | Who May Edit |
|---|---|
| `DRAFT` | Creator, Project Manager |
| `SUBMITTED` | Project Manager only (limited fields) |
| `UNDER_REVIEW` | Read-only except notes |
| `ADDITIONAL_INFO_REQUIRED` | Project Manager (to provide requested info) |
| `APPROVED` | Read-only (issuedPermitId set by system) |
| `REJECTED`, `WITHDRAWN` | Read-only |

### 5.2 Required Fields by Status

| Transition to Status | Additional Required Fields |
|---|---|
| `SUBMITTED` | `submittedById`, `applicationDate`, `permitType`, `jurisdictionName`, `jurisdictionContact.contactName` |
| `APPROVED` | `jurisdictionResponseDate` |
| `REJECTED` | `jurisdictionResponseDate`, `rejectionReason` |

---

## 6. Lifecycle Action Creation API Contract

```typescript
// POST /api/permits/{issuedPermitId}/lifecycle-actions
interface ICreatePermitLifecycleActionRequest {
  actionType: PermitLifecycleActionType;
  effectiveDate?: string;
  notes?: string;
  evidenceRecordIds?: string[];
  jurisdictionReferenceNumber?: string;
}

interface ICreatePermitLifecycleActionResponse {
  action: IPermitLifecycleAction;
  updatedPermit: IIssuedPermit;
  workQueueItemsCreated: string[];    // IDs of any new work queue items
  resolvedWorkQueueItemIds: string[]; // IDs of work queue items resolved by this action
}
```

---

*[← T02](P3-E7-T02-Record-Architecture-and-Identity-Model.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T04 →](P3-E7-T04-Inspection-Deficiency-and-Compliance-Control.md)*
