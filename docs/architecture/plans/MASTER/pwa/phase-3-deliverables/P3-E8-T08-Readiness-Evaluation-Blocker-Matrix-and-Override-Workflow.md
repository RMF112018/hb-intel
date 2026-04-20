# P3-E8-T08 — Readiness Evaluation, Blocker Matrix, and Override Workflow

**Doc ID:** P3-E8-T08
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 8 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Readiness Model Overview

### 1.1 Design Decisions

| Decision | Detail |
|---|---|
| Decision 22 | Safety compliance publishes a governed readiness decision: Ready / Ready with Exception / Not Ready |
| Decision 23 | Readiness is not a hard technical stop in v1 but is a formal governed decision surface |
| Decision 24 | Readiness evaluated at project, subcontractor, and activity/work-package levels |
| Decision 25 | Readiness rules use governed blocker-and-exception matrix, not a weighted score |
| Decision 26 | Readiness exceptions/overrides use governed joint workflow |

### 1.2 What Readiness Is

Readiness is the Safety Module's formal answer to the question: **"Is this project / subcontractor / activity safe to proceed?"**

It is not a safety score. It is not a percentage. It is one of three governed decisions:

| Decision | Meaning |
|---|---|
| `READY` | All required safety conditions are satisfied for this scope |
| `READY_WITH_EXCEPTION` | One or more conditions are not fully satisfied, but exceptions have been formally accepted and documented |
| `NOT_READY` | One or more blocking conditions are unresolved; exceptions have not been accepted |

### 1.3 Readiness Is Not a Hard Stop (v1)

Per Decision 23: in Phase 3 v1, readiness is a formal governed decision surface but not a hard technical block. A `NOT_READY` decision does not prevent schedule actions, cost actions, or project progression in the platform. It is a visible, formal, governed signal that the Safety Manager and leadership can act on.

This is a deliberate v1 design choice. Future phases may introduce hard gates that prevent specific schedule activities from being marked in-progress when a `NOT_READY` safety decision exists. For now, the readiness decision drives work queue items, Project Hub indicators, and escalation — not technical enforcement.

---

## 2. Readiness Levels

Readiness is evaluated at three levels:

| Level | What It Covers |
|---|---|
| Project | Overall project safety readiness: Is the project's safety governance foundation in place? |
| Subcontractor | Subcontractor-specific safety compliance: Is this subcontractor cleared to work on this project? |
| Activity / Work Package | Activity-level readiness: Is it safe to start this specific scope of work today? |

These three levels are independent evaluations. A project can be READY at the project level but have a specific subcontractor that is NOT_READY.

---

## 3. Readiness Record

```typescript
interface ISafetyReadinessDecision {
  id: string;
  projectId: string;
  schemaVersion: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;

  evaluationLevel: ReadinessEvaluationLevel;  // PROJECT | SUBCONTRACTOR | ACTIVITY
  subjectId: string | null;                    // subcontractorId for SUBCONTRACTOR; activityId for ACTIVITY; null for PROJECT
  subjectDescription: string;                  // Human-readable subject name

  // Decision
  decision: ReadinessDecision;                 // READY | READY_WITH_EXCEPTION | NOT_READY
  decisionComputedAt: string;
  decidedById: string;                         // Safety Manager who formally set/affirmed the decision

  // Blocker evaluation
  activeBlockers: IReadinessBlocker[];
  resolvedBlockers: IReadinessBlocker[];        // Historical — blockers resolved in prior evaluations

  // Exceptions
  acceptedExceptions: IReadinessException[];

  // Override
  activeOverride: IReadinessOverride | null;

  notes: string | null;
}
```

---

## 4. Project-Level Readiness: Blocker Matrix

Project-level readiness is governed by whether the foundational safety governance layer is in place for the project. These are the project-level blocker conditions.

| Blocker ID | Condition | Blocker Type | Excepable? |
|---|---|---|---|
| BLK-PRJ-01 | No approved SSSP base plan exists | HARD | No |
| BLK-PRJ-02 | SSSP base plan in PENDING_APPROVAL for > 14 days (no approval) | SOFT | Yes |
| BLK-PRJ-03 | No ACTIVE inspection checklist template configured | HARD | No |
| BLK-PRJ-04 | No weekly inspection completed in last 14 calendar days (after project mobilization) | SOFT | Yes |
| BLK-PRJ-05 | CRITICAL severity corrective action OPEN for > 1 business day | HARD | No |
| BLK-PRJ-06 | CRITICAL severity corrective action OPEN for > 24 hours | HARD | No (escalates BLK-PRJ-05) |
| BLK-PRJ-07 | Inspection score < 70 for most recent completed inspection | SOFT | Yes |
| BLK-PRJ-08 | 3 or more MAJOR CAs overdue | SOFT | Yes |

**HARD blockers:** Cannot be excepted. Must be resolved. Project readiness cannot be `READY` or `READY_WITH_EXCEPTION` while a HARD blocker is active.

**SOFT blockers:** Can be formally excepted with Safety Manager sign-off and documented rationale. Exception converts the readiness decision to `READY_WITH_EXCEPTION`.

---

## 5. Subcontractor-Level Readiness: Blocker Matrix

Subcontractor readiness evaluates whether a specific subcontractor is cleared to work on the project.

| Blocker ID | Condition | Blocker Type | Excepable? |
|---|---|---|---|
| BLK-SUB-01 | No `COMPANY_SAFETY_PLAN` submission in APPROVED state | HARD | No |
| BLK-SUB-02 | No `PROJECT_SPECIFIC_APP` submission in APPROVED state | HARD | No |
| BLK-SUB-03 | `PROJECT_SPECIFIC_APP` submission in REVISION_REQUESTED for > 7 days | SOFT | Yes |
| BLK-SUB-04 | Workers on site with no orientation record | HARD | No |
| BLK-SUB-05 | Active scope requires competent person; no ACTIVE designation for required area | HARD | No |
| BLK-SUB-06 | Competent-person designation with EXPIRED backing certification | HARD | No |
| BLK-SUB-07 | Chemical products on site with no SDS record | SOFT | Yes (emergency supply only) |
| BLK-SUB-08 | Open CRITICAL corrective action assigned to this subcontractor | HARD | No |
| BLK-SUB-09 | `COMPANY_SAFETY_PLAN` submission in PENDING_REVIEW for > 5 business days | SOFT | Yes |

---

## 6. Activity-Level Readiness: Blocker Matrix

Activity / work-package readiness evaluates whether a specific scope of work is safe to begin.

| Blocker ID | Condition | Blocker Type | Excepable? |
|---|---|---|---|
| BLK-ACT-01 | No APPROVED JHA for this activity exists | HARD | No |
| BLK-ACT-02 | Activity requires competent person; no ACTIVE designation for required area | HARD | No |
| BLK-ACT-03 | JHA references expired or revoked competent-person designation | HARD | No |
| BLK-ACT-04 | No Daily Pre-Task Plan completed for this activity today | SOFT | Yes (for non-high-risk activities) |
| BLK-ACT-04-HR | No Daily Pre-Task Plan completed for this OSHA high-risk activity today | HARD | No |
| BLK-ACT-05 | Open CRITICAL corrective action exists for this activity scope | HARD | No |
| BLK-ACT-06 | Required PPE identified in JHA not available on site (as noted by Safety Manager) | SOFT | Yes |
| BLK-ACT-07 | Toolbox talk for this activity scope not completed (when governed prompt was issued) | SOFT | Yes |

---

## 7. Exception Model

An exception is a formal Safety Manager acknowledgment that a SOFT blocker exists but work can proceed with documented conditions.

```typescript
interface IReadinessException {
  id: string;
  blockerId: string;                   // Blocker ID (e.g., BLK-PRJ-07)
  blockerDescription: string;

  // Exception record
  exceptionGrantedById: string;        // Safety Manager (required)
  exceptionGrantedAt: string;
  exceptionRationale: string;          // Required; non-trivial

  // Conditions on the exception
  conditionsOfException: string | null;
  exceptionExpiresAt: string | null;   // Optional expiration; when set, exception auto-lapses

  // Status
  status: ExceptionStatus;             // ACTIVE | LAPSED | REVOKED
  lapsedAt: string | null;
  revokedAt: string | null;
  revokedById: string | null;
  revocationNotes: string | null;
}
```

**Exception rules:**
- Only the Safety Manager can grant exceptions
- Exceptions require documented rationale (minimum 20 characters; validated at API layer)
- An exception converts a SOFT blocker to an accepted condition; the readiness decision becomes `READY_WITH_EXCEPTION` instead of `NOT_READY`
- An exception never resolves a HARD blocker; HARD blockers must be fully resolved
- Exceptions may have an expiration date; once lapsed, the blocker reactivates and readiness re-evaluates
- PM and Superintendent may see exception records; they cannot grant or revoke them

---

## 8. Override Workflow

Per Decision 26: readiness exceptions/overrides use a governed joint workflow.

### 8.1 What an Override Is

An override is a higher-level governance action: it documents that leadership has acknowledged a `NOT_READY` or `READY_WITH_EXCEPTION` decision and has made a deliberate decision to proceed despite outstanding conditions.

An override does NOT change the readiness decision. The readiness decision remains `NOT_READY` or `READY_WITH_EXCEPTION`. The override is a separate governance record that says "we are aware and we are proceeding."

```typescript
interface IReadinessOverride {
  id: string;
  readinessDecisionId: string;

  // Override initiator
  requestedById: string;               // PM or Safety Manager
  requestedAt: string;
  requestRationale: string;            // Required

  // Override approvals (joint governance)
  safetyManagerAcknowledgment: IOverrideSignature | null;   // Required
  pmAcknowledgment: IOverrideSignature | null;               // Required
  superintendentAcknowledgment: IOverrideSignature | null;  // Required when activity-level

  status: OverrideStatus;              // PENDING | ACKNOWLEDGED | LAPSED | REVOKED
  acknowledgedAt: string | null;       // All required approvals collected
  expiresAt: string | null;            // Overrides should have short expiration windows (typically 24–72h)
  notes: string | null;
}

interface IOverrideSignature {
  userId: string;
  userName: string;
  role: string;
  acknowledgedAt: string;
  comments: string | null;
}
```

### 8.2 Override Joint Approval Requirements

| Override Level | Required Acknowledgers |
|---|---|
| Project-level override | Safety Manager + PM |
| Subcontractor-level override | Safety Manager + PM |
| Activity-level override | Safety Manager + PM + Superintendent |

An override is effective when all required acknowledgers have signed. It automatically lapses when `expiresAt` is reached.

---

## 9. Readiness Evaluation Engine

### 9.1 Evaluation Trigger

Readiness is re-evaluated when any of the following events occur:
- A relevant safety record changes state (SSSP approved, inspection completed, CA closed, orientation completed, submission approved, designation activated/expired, etc.)
- A blocker condition's time threshold is crossed (e.g., daily sweep for overdue CAs, inspection frequency checks)
- A Safety Manager manually requests re-evaluation
- An exception lapses or is revoked

### 9.2 Evaluation Algorithm

```typescript
function evaluateReadiness(
  level: ReadinessEvaluationLevel,
  subjectId: string | null,
  projectId: string,
  blockerMatrix: IReadinessBlockerDefinition[],
  projectState: IProjectSafetyState,
  activeExceptions: IReadinessException[]
): ReadinessDecision {

  const activeBlockers: IReadinessBlocker[] = [];

  for (const blocker of blockerMatrix) {
    if (blocker.evaluationLevel !== level) continue;

    const conditionMet = evaluateBlockerCondition(blocker, subjectId, projectState);

    if (conditionMet) {
      const hasActiveException = blocker.excepable &&
        activeExceptions.some(e => e.blockerId === blocker.id && e.status === 'ACTIVE');

      if (!hasActiveException) {
        activeBlockers.push({
          blockerId: blocker.id,
          blockerType: blocker.blockerType,
          description: blocker.description,
          isExcepted: false
        });
      }
    }
  }

  const hardBlockers = activeBlockers.filter(b => b.blockerType === 'HARD');
  const softBlockers = activeBlockers.filter(b => b.blockerType === 'SOFT');

  if (hardBlockers.length > 0) return 'NOT_READY';
  if (softBlockers.length > 0) return 'READY_WITH_EXCEPTION'; // (after exceptions accepted)
  return 'READY';
}
```

### 9.3 Readiness Summary Published to Project Hub

The composite safety scorecard (T09) receives a readiness summary:

```typescript
interface IReadinessSummaryProjection {
  projectId: string;
  computedAt: string;

  projectReadiness: ReadinessDecision;
  activeProjectBlockers: number;
  activeProjectExceptions: number;

  subcontractorsTotal: number;
  subcontractorsReady: number;
  subcontractorsReadyWithException: number;
  subcontractorsNotReady: number;

  activitiesWithOpenBlockers: number;   // Count of activities with HARD blockers
}
```

---

## 10. Work Queue Items from Readiness

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| Project NOT_READY (HARD blocker) | Resolve safety readiness blocker | CRITICAL | Safety Manager |
| Project READY_WITH_EXCEPTION (first occurrence or new exception) | Review safety exceptions for project | HIGH | Safety Manager + PM |
| Subcontractor NOT_READY with workers on site | Subcontractor safety clearance required | CRITICAL | Safety Manager |
| Activity-level HARD blocker (work scheduled to start) | Activity blocked: resolve safety condition | CRITICAL | Safety Manager + PM |
| Override approaching expiration (< 4 hours) | Safety override expiring — review status | HIGH | Safety Manager + PM |

---

## 11. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 22 — Readiness decision: Ready / Ready with Exception / Not Ready | §1.2 |
| 23 — Readiness is not a hard technical stop in v1 | §1.3 |
| 24 — Readiness at project, subcontractor, activity levels | §2 |
| 25 — Readiness uses governed blocker-and-exception matrix, not weighted score | §3–§6 |
| 26 — Readiness exceptions/overrides use governed joint workflow | §7, §8 |

---

*[← T07](P3-E8-T07-Orientation-Subcontractor-Qualifications-SDS-CompetentPerson.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T09 →](P3-E8-T09-Publication-Contracts-Project-Hub-PER-and-Reports.md)*
