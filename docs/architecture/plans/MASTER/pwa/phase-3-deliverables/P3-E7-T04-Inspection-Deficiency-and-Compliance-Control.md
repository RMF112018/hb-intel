# P3-E7-T04 — Inspection, Deficiency, and Compliance Control

**Doc ID:** P3-E7-T04
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 4 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Required Inspection Checkpoint Template Library

### 1.1 Purpose

Each `PermitType` has a governed set of required inspection checkpoints that jurisdiction mandates before permit closeout. The template library defines the canonical checkpoint list per permit type. When a permit of a given type is activated, the system may auto-generate `RequiredInspectionCheckpoint` records from the template.

### 1.2 Template Library Record

```typescript
interface ICheckpointTemplate {
  templateId: string;               // UUID; immutable
  permitType: PermitType;           // Which permit type this template applies to
  checkpointName: string;           // Canonical name (e.g., "Building Footer & ISO pads")
  codeReference?: string;           // Applicable code section
  sequence: number;                 // Default display order
  isBlockingCloseout: boolean;      // Whether passing this checkpoint gates permit closeout
  blockedByCheckpointNames: string[]; // Predecessor checkpoint names in this template
  jurisdictionName?: string;        // If template is jurisdiction-specific; null = universal
  notes?: string;                   // Guidance notes for project team
  isActive: boolean;                // Whether template entry is currently active
  createdAt: string;
  updatedAt: string;
}
```

### 1.3 Known Template Examples (Master Building Permit)

The following are representative checkpoints for `MASTER_BUILDING` permit type, derived from the existing `10b_20260220_RequiredInspectionsList.xlsx` template:

| Sequence | Checkpoint Name | Code Reference | Blocks Closeout |
|---|---|---|---|
| 1 | Building Footer & ISO pads | IBC §1809 | Yes |
| 2 | Soil bearing test | IBC §1803 | Yes |
| 3 | Pre-slab inspection | IBC §1907 | Yes |
| 4 | Underground plumbing rough-in | IPC §312 | Yes |
| 5 | Structural steel | IBC §1705 | Yes |
| 6 | Fire preliminary | NFPA 13 §7 | Yes |
| 7 | Framing rough-in | IBC §2308 | Yes |
| 8 | Electrical rough-in | NEC §230 | Yes |
| 9 | Insulation | IECC §C402 | No |
| 10 | Final — Building | IBC §111 | Yes |
| 11 | Final — Electrical | NEC §230 | Yes |
| 12 | Final — Plumbing | IPC §107 | Yes |
| 13 | Final — Mechanical | IMC §106 | Yes |
| 14 | Certificate of Occupancy | IBC §111.1 | Yes |

### 1.4 Auto-Generation Rule

When `IssuedPermit` is created with `currentStatus = ACTIVE`:
1. Retrieve all active `ICheckpointTemplate` records for the `permitType`
2. For each template entry, create an `IRequiredInspectionCheckpoint` with:
   - `issuedPermitId` = new permit ID
   - `templateCheckpointId` = source template entry ID
   - `checkpointName`, `codeReference`, `sequence`, `isBlockingCloseout` copied from template
   - `status = NOT_SCHEDULED`
   - `currentResult = PENDING`
   - `verifiedOnline = false`
3. Emit activity spine event `REQUIRED_INSPECTIONS_GENERATED`

The project team may add additional non-templated checkpoints manually. Removing a blocking checkpoint requires PM-level authorization.

---

## 2. Inspection Visit Workflow

### 2.1 Scheduling and Logging Flow

```
RequiredInspectionCheckpoint (NOT_SCHEDULED)
  │
  ├── PM/Supervisor calls in inspection → checkpoint.status = CALLED_IN
  │                                      checkpoint.dateCalledIn set
  │
  ├── Date confirmed with jurisdiction → checkpoint.status = SCHEDULED
  │                                      checkpoint.scheduledDate set
  │                                      InspectionVisit created (result = PENDING)
  │
  ├── Inspection occurs → InspectionVisit.result recorded
  │                      InspectionVisit.completedDate set
  │                      InspectionVisit.inspectorNotes set
  │
  ├── If PASSED → checkpoint.currentResult = PASS
  │               checkpoint.status = PASSED
  │               PermitLifecycleAction(INSPECTION_PASSED) created
  │
  └── If FAILED → checkpoint.currentResult = FAIL
                  checkpoint.status = FAILED
                  InspectionDeficiency records created (one per finding)
                  InspectionVisit.followUpRequired = true
                  PermitLifecycleAction(INSPECTION_FAILED) created
                  Work queue item: re-inspection required
```

### 2.2 Multiple Visits per Checkpoint

A single `RequiredInspectionCheckpoint` may have multiple `InspectionVisit` records (e.g., initial failure followed by re-inspection). The checkpoint's `currentResult` always reflects the outcome of the most recent completed visit.

```
checkpoint.linkedInspectionVisitIds = [visitId_1, visitId_2, visitId_3]
checkpoint.lastVisitId = visitId_3  // Most recent
checkpoint.currentResult = PASS     // From visitId_3
checkpoint.status = PASSED
```

The history of all visit outcomes is preserved via the `linkedInspectionVisitIds` array and the individual `InspectionVisit` records.

### 2.3 Validation Rules for InspectionVisit

1. `visitId` — UUID; auto-generated
2. `issuedPermitId` — must reference non-terminal `IssuedPermit`
3. `scheduledDate` — valid ISO 8601 datetime; required
4. `completedDate` — if set, must be ≥ `scheduledDate`
5. `result` — required enum value
6. If `result = PASSED_WITH_CONDITIONS` — `inspectorNotes` must be non-empty
7. If `followUpRequired = true` — `followUpDueDate` must be set
8. `durationMinutes` — if provided, must be integer ≥ 0
9. On result record: `resultRecordedByUserId` must be set

---

## 3. Deficiency Tracking

### 3.1 Deficiency Creation Rules

An `InspectionDeficiency` is created when:
- An `InspectionVisit` has `result = FAILED` or `PARTIAL_PASS`
- A `PermitLifecycleAction` of type `DEFICIENCY_OPENED` is created

One deficiency record is created per distinct finding. Multiple deficiencies may be created from a single inspection visit.

### 3.2 Deficiency Resolution Workflow

```
OPEN ──────────→ ACKNOWLEDGED ──────────→ REMEDIATION_IN_PROGRESS
  │                                                │
  │                                                ▼
  │                                             RESOLVED ──────────→ VERIFIED_RESOLVED
  │                                                                      (via re-inspection)
  ├──────────→ DISPUTED (in contention with jurisdiction)
  │
  └──────────→ WAIVED (jurisdiction waived finding)
```

**Resolution validation rules:**
1. Transition to `RESOLVED` requires `resolutionNotes` to be non-empty
2. Transition to `VERIFIED_RESOLVED` requires `reinspectionVisitId` to be set
3. Transition to `DISPUTED` requires notes (reason for dispute)
4. Transition to `WAIVED` requires `@hbc/acknowledgment` from Project Manager

### 3.3 Deficiency Severity Impact on Health

| Severity | ResolutionStatus | Health Tier Impact |
|---|---|---|
| `HIGH` | `OPEN` | `CRITICAL` |
| `HIGH` | `ACKNOWLEDGED` | `CRITICAL` |
| `HIGH` | `REMEDIATION_IN_PROGRESS` | `AT_RISK` |
| `HIGH` | `RESOLVED` or better | No impact |
| `MEDIUM` | `OPEN` | `AT_RISK` |
| `MEDIUM` | `ACKNOWLEDGED` | `AT_RISK` |
| `MEDIUM` | `REMEDIATION_IN_PROGRESS` or better | No impact |
| `LOW` | `OPEN` | No health impact until 7 days past `dueDate` |
| `LOW` | Overdue past `dueDate` | `AT_RISK` |

### 3.4 Work Queue Items from Deficiencies

| Deficiency State | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| HIGH severity + OPEN | "High-Severity Deficiency — Immediate Action Required" | HIGH | `assignedToPartyId` or permit `currentResponsiblePartyId` |
| MEDIUM severity + OPEN > 3 days | "Deficiency Unaddressed" | MEDIUM | `assignedToPartyId` |
| Any severity + past `dueDate` | "Deficiency Overdue" | HIGH | `escalationOwnerId` |
| `followUpRequired = true` on InspectionVisit | "Re-inspection Required" | HIGH | permit `currentResponsiblePartyId` |

---

## 4. Derived Compliance Health

### 4.1 Health Derivation Algorithm

Compliance health is computed from the following inputs. No stored numeric score exists.

```typescript
function derivePermitHealth(
  permit: IIssuedPermit,
  checkpoints: IRequiredInspectionCheckpoint[],
  deficiencies: IInspectionDeficiency[],
  lifecycleActions: IPermitLifecycleAction[]
): PermitHealthTier {

  // Terminal closed state
  if (permit.currentStatus === 'CLOSED') return 'CLOSED';

  // Critical conditions
  const isCritical =
    permit.currentStatus === 'EXPIRED' ||
    permit.currentStatus === 'REVOKED' ||
    permit.currentStatus === 'STOP_WORK' ||
    permit.expirationRiskTier === 'CRITICAL' ||
    deficiencies.some(d =>
      d.severity === 'HIGH' &&
      (d.resolutionStatus === 'OPEN' || d.resolutionStatus === 'ACKNOWLEDGED')
    ) ||
    checkpoints.some(c =>
      c.isBlockingCloseout &&
      c.currentResult === 'FAIL' &&
      !hasSubsequentPassForCheckpoint(c, checkpoints)
    );

  if (isCritical) return 'CRITICAL';

  // At-risk conditions
  const isAtRisk =
    permit.expirationRiskTier === 'HIGH' ||
    permit.currentStatus === 'VIOLATION_ISSUED' ||
    permit.currentStatus === 'SUSPENDED' ||
    deficiencies.some(d =>
      d.severity === 'MEDIUM' &&
      (d.resolutionStatus === 'OPEN' || d.resolutionStatus === 'ACKNOWLEDGED')
    ) ||
    deficiencies.some(d =>
      d.dueDate !== undefined &&
      new Date(d.dueDate) < new Date() &&
      d.resolutionStatus !== 'RESOLVED' &&
      d.resolutionStatus !== 'VERIFIED_RESOLVED' &&
      d.resolutionStatus !== 'WAIVED'
    );

  if (isAtRisk) return 'AT_RISK';

  return 'NORMAL';
}
```

### 4.2 Expiration Risk Tier Calculation

```typescript
function calcExpirationRiskTier(expirationDate: string): ExpirationRiskTier {
  const daysToExpiration = diffDays(expirationDate, today());
  if (daysToExpiration < 0)   return 'CRITICAL';
  if (daysToExpiration <= 30) return 'HIGH';
  if (daysToExpiration <= 90) return 'MEDIUM';
  return 'LOW';
}
```

`daysToExpiration` is derived at query time and not persisted. `expirationRiskTier` is recalculated on every permit read and during the daily expiration sweep.

### 4.3 Recalculation Triggers

Health tier is recalculated (and health spine is updated) when:

- Any `PermitLifecycleAction` is created
- Any `InspectionDeficiency.resolutionStatus` changes
- Any `RequiredInspectionCheckpoint.currentResult` changes
- Any `InspectionVisit.result` is recorded
- Daily expiration sweep runs (for expiration-proximity changes)

### 4.4 Thread-Level Health

Thread health is the worst health tier across all permits in the thread:

```typescript
function deriveThreadHealth(permits: IIssuedPermit[]): PermitHealthTier {
  if (permits.some(p => p.derivedHealthTier === 'CRITICAL')) return 'CRITICAL';
  if (permits.some(p => p.derivedHealthTier === 'AT_RISK'))  return 'AT_RISK';
  if (permits.some(p => p.derivedHealthTier === 'NORMAL'))   return 'NORMAL';
  return 'CLOSED'; // All permits in thread are closed
}
```

---

## 5. Inspection Template Import (xlsx)

### 5.1 Template File Format

Source file: `10b_20260220_RequiredInspectionsList.xlsx`

| Row | Content |
|---|---|
| 1 | Job name (informational display context) |
| 2 | Main permit number (FK reference; must match existing `IssuedPermit.permitNumber`) |
| 3 | Label row: "List of Inspections Required" |
| 4+ | Inspection checkpoint rows |

| Template Column | Header | Maps To | Type | Required |
|---|---|---|---|---|
| 1 | Inspection | `checkpointName` | string | Yes |
| 2 | Code | `codeReference` | string | No |
| 3 | Date Called In | `dateCalledIn` | ISO date | No |
| 4 | Result | `currentResult` | `RequiredInspectionResult` enum | Yes |
| 5 | Comment | (stored as note on checkpoint) | string | No |
| 6 | Verified Online | `verifiedOnline` | boolean | Yes |

### 5.2 Import Validation

1. Permit number (Row 2) must match exactly one `IssuedPermit.permitNumber` on the project
2. For each data row: `checkpointName` must be non-empty
3. `result` column must map to `PASS | FAIL | NOT_APPLICABLE | PENDING`
4. `verifiedOnline` must be parseable as boolean (checked = true, unchecked = false)
5. **All-or-nothing import**: if any row fails validation, the entire import is rejected with row-level error detail
6. Duplicate checkpoint names within same permit generate a warning but do not block import (project team to review)

### 5.3 Import Side Effects

1. One `IRequiredInspectionCheckpoint` record created per valid row
2. `sequence` assigned from row number (1-indexed from row 4)
3. `isBlockingCloseout` defaults to `true` unless checkpoint name matches a template entry with `isBlockingCloseout = false`
4. If checkpoints already exist for the permit (e.g., auto-generated from template library): import creates new records; deduplication is the project team's responsibility (flag surfaced in import review)
5. Activity spine event `REQUIRED_INSPECTIONS_IMPORTED` emitted with count

---

## 6. Compliance Close-out Gate

A permit may receive a `PermitLifecycleAction` of type `CLOSED` only when:

1. All `RequiredInspectionCheckpoint` records with `isBlockingCloseout = true` have `currentResult = PASS` or `currentResult = NOT_APPLICABLE`
2. No `InspectionDeficiency` records have `resolutionStatus = OPEN`, `ACKNOWLEDGED`, or `REMEDIATION_IN_PROGRESS`
3. `IssuedPermit.currentStatus` is `ACTIVE` or `UNDER_INSPECTION`
4. `IssuedPermit.expirationDate` has not passed (or a renewal has been approved)

The API enforces this gate; the system rejects a `CLOSED` lifecycle action if any condition is unmet, returning a structured error listing which conditions failed.

---

*[← T03](P3-E7-T03-Lifecycle-State-Actions-and-Governance.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T05 →](P3-E7-T05-Workflow-Publication-and-Downstream-Surfaces.md)*
