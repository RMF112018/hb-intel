# P3-E11-T08 — Spine Publication, Reports, Executive Review, and Cross-Module Consumption

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T08 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Activity Spine Publication

Project Startup publishes the following events to the Activity Spine (P3-D1). All publications are write-once from Startup — the spine receives events; it does not write back.

### 1.1 Program Lifecycle Events

| Trigger | Activity event type | Key payload fields |
|---|---|---|
| `StartupProgram` created at project creation | `StartupProgramCreated` | `programId`, `projectId`, `createdAt`, `createdBy` |
| `StartupProgram` state transitions | `StartupStateTransitioned` | `fromState`, `toState`, `transitionedBy`, `transitionedAt`, `programId` |
| `ReadinessCertification` submitted (any sub-surface) | `ReadinessCertificationSubmitted` | `certId`, `subSurface`, `submittedBy`, `certVersion` |
| `ReadinessCertification` accepted by PE | `ReadinessCertificationAccepted` | `certId`, `subSurface`, `reviewedBy`, `reviewedAt` |
| `ReadinessCertification` returned by PE | `ReadinessCertificationReturned` | `certId`, `subSurface`, `reviewedBy`, `returnReason` |
| `ReadinessGateRecord` evaluated | `ReadinessGateEvaluated` | `gateId`, `subSurface`, `evaluatedBy`, `passCount`, `failCount` |
| `ProgramBlocker` created | `ProgramBlockerCreated` | `blockerId`, `scope`, `severity`, `description`, `createdBy` |
| `ProgramBlocker` resolved or waived | `ProgramBlockerResolved` | `blockerId`, `resolution`, `resolvedBy` |
| `PEMobilizationAuthorization` created | `StartupMobilizationAuthorized` | `authId`, `authorizedBy`, `stabilizationWindowDays`, `programId` |
| `StartupBaseline` created (at BASELINE_LOCKED) | `StartupBaselineLocked` | `snapshotId`, `lockedBy`, `lockedAt`, `programId` |
| `ExceptionWaiverRecord` created | `StartupWaiverCreated` | `waiverId`, `subSurface`, `waivedBy`, `waiverNote` |

### 1.2 Task Library Events

| Trigger | Activity event type | Key payload fields |
|---|---|---|
| First `StartupTaskInstance` result set | `StartupTaskLibraryActivated` | `programId`, `activatedBy`, `activatedAt` |
| `StartupTaskInstance` result changed | `StartupTaskInstanceUpdated` | `taskNumber`, `taskTitle`, `result`, `changedBy`, `activeDuringStabilization` |
| `TaskBlocker` created | `TaskBlockerCreated` | `blockerId`, `taskInstanceId`, `blockerType`, `createdBy` |
| `TaskBlocker` resolved or waived | `TaskBlockerResolved` | `blockerId`, `taskInstanceId`, `resolvedBy` |

### 1.3 Sub-Surface Events

| Trigger | Activity event type | Key payload fields |
|---|---|---|
| Safety readiness item result set or changed | `SafetyReadinessItemUpdated` | `itemNumber`, `description`, `result`, `changedBy` |
| `SafetyRemediationRecord` created | `SafetyRemediationCreated` | `remediationId`, `itemNumber`, `description` |
| `SafetyRemediationRecord` escalated | `SafetyRemediationEscalated` | `remediationId`, `escalationLevel`, `escalatedBy` |
| `SafetyRemediationRecord` resolved | `SafetyRemediationResolved` | `remediationId`, `resolvedBy`, `resolvedAt` |
| `ContractObligation` added | `ContractObligationAdded` | `obligationId`, `category`, `flagForMonitoring` |
| `ContractObligation` status changed | `ContractObligationStatusChanged` | `obligationId`, `oldStatus`, `newStatus`, `changedBy` |
| `ResponsibilityAssignment` changed (named person) | `ResponsibilityAssignmentUpdated` | `roleCode`, `taskCategory`, `sheet`, `assignedPersonName`, `effectiveFrom` |
| `ResponsibilityAssignment` acknowledged | `ResponsibilityAssignmentAcknowledged` | `roleCode`, `taskCategory`, `sheet`, `acknowledgedBy`, `acknowledgedAt` |
| `ProjectExecutionBaseline` status changes to `Submitted` | `PMPlanSubmitted` | `baselineId`, `submittedBy`, `submittedAt` |
| `ProjectExecutionBaseline` status changes to `Approved` | `PMPlanApproved` | `baselineId`, `approvedBy`, `approvedAt` |
| `ExecutionAssumption` added | `ExecutionAssumptionAdded` | `assumptionId`, `category`, `isSuccessCriterion`, `riskLevel` |
| `PermitVerificationDetail` `physicalEvidenceAttachmentIds` populated | `PermitPostingVerified` | `taskInstanceId`, `permitType`, `verifiedBy`, `verifiedAt` |

---

## 2. Health Spine Publication

Project Startup publishes the following metrics to the Health Spine (P3-D2). These are `IHealthMetric` contributions via the Phase 3 Health Spine publication contract consumed by Project Health Pulse surfaces in `@hbc/features-project-hub`. Startup publishes under the `Startup` dimension (or the office-level dimension used by the Health Spine per P3-D2 §11).

| Metric key | Calculation | Update trigger |
|---|---|---|
| `startupReadinessState` | Ordinal of `StartupProgram.currentStateCode`: DRAFT=1, ACTIVE_PLANNING=2, READINESS_REVIEW=3, READY_FOR_MOBILIZATION=4, MOBILIZED=5, STABILIZING=6, BASELINE_LOCKED=7, ARCHIVED=8 | Any state transition |
| `startupTaskCompletionRate` | Count of `StartupTaskInstance` records with `result ≠ null` / total task count × 100 | Any task result change |
| `startupOpenTaskBlockerCount` | Count of `TaskBlocker` records with `blockerStatus = OPEN` | Any `TaskBlocker` creation or resolution |
| `startupOpenProgramBlockerCount` | Count of `ProgramBlocker` records with `status = OPEN` | Any `ProgramBlocker` creation or resolution |
| `startupCertificationProgress` | Count of `ReadinessCertification` records with `certStatus = ACCEPTED` / 6 total sub-surfaces | Any certification status change |
| `safetyReadinessOpenRemediations` | `JobsiteSafetyChecklist.openRemediationCount` | Any safety item result or remediation status change |
| `safetyReadinessEscalatedRemediations` | `JobsiteSafetyChecklist.escalatedRemediationCount` | Any remediation escalation change |
| `contractObligationsFlagged` | `ContractObligationsRegister.flaggedObligationCount` (status ∉ {SATISFIED, NOT_APPLICABLE, WAIVED}) | Any obligation flag or status change |
| `contractObligationsOverdue` | `ContractObligationsRegister.overdueObligationCount` | Any obligation due-date or status change |
| `responsibilityMatrixReadiness` | Boolean: `true` if all critical task categories on both sheets have a named `Primary` assignee and `acknowledgedAt` populated | Any assignment or acknowledgment change |
| `pmPlanStatus` | Ordinal of `ProjectExecutionBaseline.status`: Draft=1, Submitted=2, Approved=3 | PM Plan status change |

**Early health signals:** Before the program reaches `READY_FOR_MOBILIZATION`, a low `startupTaskCompletionRate` or non-zero `startupOpenProgramBlockerCount` surfaces as a compound risk signal in the Health spine (per P3-D2 §9.3). The Health spine consumer determines compound risk presentation; Startup publishes the raw metrics only.

---

## 3. Work Queue Publication

Project Startup raises Work Queue items via `@hbc/my-work-feed` (`StartupWorkAdapter`). All items are project-scoped. Items clear automatically when the triggering condition resolves unless noted otherwise.

### 3.1 Program-Level Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| Program in `ACTIVE_PLANNING` for > 14 days and `startupTaskCompletionRate < 10%` | `StartupProgramNotStarted` | PM | First task result saved |
| `ReadinessCertification` in `SUBMITTED` or `UNDER_REVIEW` for > 5 days | `CertificationPendingReview` | PX | Certification accepted or returned |
| `ProgramBlocker` with `status = OPEN` | `ProgramBlockerOpen` | `responsibleRoleCode` from blocker (PM if null) | Blocker resolved or waived |
| `ProgramBlocker` escalated to `PX` | `ProgramBlockerEscalated` | PX | Blocker resolved or waived |

### 3.2 Task Library Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| `TaskBlocker` with `blockerStatus = OPEN` | `TaskBlockerOpen` | `responsibleRoleCode` from blocker | Blocker resolved or waived |
| `StartupTaskInstance` CRITICAL severity with `result = null` after 7 days in `ACTIVE_PLANNING` | `CriticalTaskUnstarted` | `assignedUserId` (PM if null) | Task result saved |

### 3.3 Safety Readiness Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| `SafetyRemediationRecord` auto-created on `Fail` result | `SafetyRemediationPending` | PM | Remediation `remediationNote` and `assignedPersonName` populated |
| `SafetyRemediationRecord` unassigned after 2 business days | `SafetyRemediationUnassigned` | PM | `assignedPersonName` populated |
| `SafetyRemediationRecord` overdue (`dueDate < today`) | `SafetyRemediationOverdue` | `assignedUserId` AND `accountableRoleCode` | Remediation resolved or waived |
| `SafetyRemediationRecord` escalated to PX | `SafetyRemediationEscalatedPX` | PX | Blocker resolved or remediation resolved |

### 3.4 Contract Obligation Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| Obligation `flagForMonitoring = true` AND `obligationStatus = OPEN` | `ObligationOpenFlagged` | `responsibleRoleCode` (PM if null) | Status transitions to terminal state |
| Obligation IN_PROGRESS with no `evidenceAttachmentIds` after 30 days | `ObligationNoEvidence` | `responsibleRoleCode` (PM if null) | Evidence attached or satisfied |
| Obligation `dueDate` within lead days per `monitoringPriority` | `ObligationDueSoon` | `responsibleRoleCode` (PM if null) | Status transitions to terminal state |
| Obligation overdue (`dueDate < today`) | `ObligationOverdue` | `responsibleRoleCode` AND `accountableRoleCode` | Status transitions to terminal state |
| Recurring obligation cycle due | `ObligationRecurringDue` | `responsibleRoleCode` (PM if null) | PM advances due date to next cycle |

### 3.5 Responsibility Matrix Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| PM sheet task category has no named `Primary` assignee | `MatrixUnassignedCategory` | PM | Named `Primary` assignee added |
| Field sheet task category has no named `Primary` assignee | `MatrixUnassignedCategory` | PM | Named `Primary` assignee added |
| Critical category `Primary` missing `acknowledgedAt` after 3 days | `MatrixAcknowledgmentPending` | Named assignee (PM if no `assignedUserId`) | `acknowledgedAt` populated |

### 3.6 PM Plan Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| `ProjectExecutionBaseline.status = Draft` and project > 14 days old | `PMPlanNotSubmitted` | PM | Status advances to `Submitted` |
| `ProjectExecutionBaseline.status = Submitted` and > 7 days since submission | `PMPlanPendingApproval` | PX | Status advances to `Approved` |

### 3.7 Permit Posting Items

| Condition | Item type key | Assigned to | Clears when |
|---|---|---|---|
| Section 4 task instance `result = No` | `PermitNotPosted` | PM | Task result updated to `Yes` or `NA` with documentation |

---

## 4. Related Items Spine

Project Startup registers the following cross-module record relationships with the Related Items spine (P3-D4) via `@hbc/related-items`:

| Startup record | Related module | Related record type | Relationship type |
|---|---|---|---|
| Section 4 `StartupTaskInstance` | P3-E7 Permits | Matching permit type record | `startup-permit-posting-references-permit-record` |
| `PermitVerificationDetail.permitModuleRecordRef` (when set) | P3-E7 Permits | Specific `IssuedPermit` record | `startup-permit-verification-links-issued-permit` |
| `JobsiteSafetyChecklist` | P3-E8 Safety | Safety module inspection log | `startup-safety-readiness-references-safety-module` |
| `ProjectExecutionBaseline` Section X | P3-E10 Closeout | Closeout module record | `pm-plan-references-closeout-module` |
| `ProjectExecutionBaseline` Section V | P3-E4 Financial | Financial module record | `pm-plan-references-financial-module` |
| `ProjectExecutionBaseline` Section VI | P3-E5 Schedule | Schedule module record | `pm-plan-references-schedule-module` |
| `StartupBaseline` | P3-E10 Closeout | `AutopsyRecord` (when created) | `startup-baseline-feeds-autopsy` |
| `ContractObligation` category `SCHEDULE_MILESTONES` | P3-E5 Schedule | Matching schedule milestone | `obligation-references-schedule-milestone` |
| `ContractObligation` category `LIQUIDATED_DAMAGES` | P3-E4 Financial | Financial module LD tracking | `obligation-references-financial-ld` |

Related Items links from Startup are read-only navigation aids. They do not confer write authority over the linked module's records.

---

## 5. Reports Integration — What Startup Publishes and Why Not Org Intelligence

### 5.1 Startup Does Not Publish to Reports

Project Startup does not provide a snapshot API for P3-E9 Reports assembly. Startup data is not a source for any governed report family (PX Review, Owner Report) in Phase 3.

**Rationale:** Reports assembles financial, schedule, safety, and project health data for external presentation. Startup data is pre-execution baseline material — a readiness certification program, not a recurring project status surface appropriate for PX Review or Owner Report inclusion. Including startup readiness state in a monthly PX Review would be misleading after the stabilization window closes and the module enters `BASELINE_LOCKED`.

### 5.2 Startup Does Not Publish Org Intelligence

Unlike Project Closeout (which publishes `LessonsIntelligenceIndex`, `SubIntelligenceIndex`, and `LearningLegacyFeed` to org-wide derived read models on archive), Project Startup intentionally publishes **no org-level intelligence indexes**.

**Why not:**

| Reason | Explanation |
|---|---|
| Startup data is project-launch context, not org learning | Checklist completion rates, obligation lists, and assignment matrices are project-specific operational artifacts — not patterns the org learns from across projects |
| Org intelligence requires PE-gated publication | Startup data has no approved org-intelligence publication workflow; adding one would introduce a new governance surface not in scope |
| Closeout owns the retrospective learning loop | Closeout consumes the `StartupBaseline` snapshot and uses it in Lessons Learned, Autopsy, and Scorecard. The learning derived from startup planning belongs in the Closeout module's Autopsy findings, not in a parallel Startup index |
| Health spine is sufficient for org-level awareness | The Health spine's startup metrics contribute to portfolio triage and cross-project health views. This is the correct level of org visibility for startup state |

If a future release requires org-level startup pattern analysis (e.g., which obligation categories are most commonly flagged across projects), that will be governed by a new `P3-E11` extension with its own PE-gated publication model.

### 5.3 Startup Summary and Mobilization Status

Startup publishes a **mobilization status summary** to the project canvas tile via `@hbc/project-canvas`. This is an internal summary surface — not a published external report.

**Canvas tile content (pre-`BASELINE_LOCKED`):**
- Current `StartupReadinessState.stateCode` with human-readable label
- Count of open `ProgramBlocker` records
- Count of `ReadinessCertification` records in `ACCEPTED` state (X of 6)
- Count of open `TaskBlocker` records
- Count of overdue obligations
- Link to Startup workspace

**Canvas tile content (post-`BASELINE_LOCKED`):**
- "Baseline Locked" status banner
- Baseline lock date
- Link to read-only `StartupBaseline` summary view
- Tile weight transitions to lightweight (informational)

---

## 6. Closeout Continuity Publication Rules

### 6.1 What Startup Publishes to Closeout

At `BASELINE_LOCKED`, Startup publishes exactly one thing to Closeout: the `StartupBaseline` snapshot. Publication is not event-driven — it is created atomically with the state transition. Closeout reads it via a governed read-only API:

```
GET /api/startup/{projectId}/baseline
→ Returns: StartupBaseline snapshot with all fields (T02 §7.2)
→ Auth: Closeout module service identity OR PX role
→ Mutability: HTTP 405 on any PATCH/PUT
```

### 6.2 What Startup Does Not Publish to Closeout

| Record | Reason not published |
|---|---|
| Live `StartupTaskInstance` records | Closeout reads the snapshot; task-level detail is not Closeout's concern |
| `ContractObligation` rows | Obligation monitoring is a Startup operational surface; Closeout reads counts from the snapshot only |
| `ResponsibilityMatrix` rows | Closeout reads `responsibilityMatrixRef` from the snapshot; full matrix accessed via Startup's own read API |
| `ProjectExecutionBaseline` section content | Closeout reads baseline field values from the snapshot; live plan records are not published |
| `SafetyRemediationRecord` detail | Not in Closeout scope; safety delta is a Safety module concern |

### 6.3 Startup Publication Boundary With Other Modules

| Module | Publication direction | Mechanism |
|---|---|---|
| P3-E10 Closeout | Startup → Closeout (read-only) | `GET /api/startup/{projectId}/baseline`; snapshot only |
| P3-D1 Activity | Startup → Spine | Activity event bus per §1 |
| P3-D2 Health | Startup → Spine | Health metric publication API per §2 |
| P3-D3 Work Queue | Startup → Spine | `StartupWorkAdapter` registration per §3 |
| P3-D4 Related Items | Startup → Spine | Related Items registration per §4 |
| P3-E7 Permits | Permits → Startup (read-only) | Startup reads permit status for Section 4 display context |
| P3-E8 Safety | Safety → Startup (read-only) | Startup reads Safety inspection log ID for Related Items registration |
| P3-E9 Reports | No publication | Per §5.1 |

---

## 7. Executive Review and Annotation

### 7.1 Annotation Model

Executive review annotations on Startup records use `@hbc/field-annotations` exclusively. Annotations:
- Are stored in the annotation layer — never in operational Startup records
- Do not advance any `ReadinessCertification` status
- Do not advance the `StartupReadinessState`
- Do not modify any field on any Startup record type
- Survive `BASELINE_LOCKED` — annotations may be added post-lock (read-only records still annotatable)

### 7.2 Formal Gate Actions vs. Annotation

The formal PE gate actions (certification review, mobilization authorization, baseline lock) are categorically distinct from annotation:

| Action | Type | Effect |
|---|---|---|
| Annotation via `@hbc/field-annotations` | Non-blocking observation | No status change; stored in annotation layer only |
| `ReadinessCertification` accept/return | Formal gate review | Advances or regresses readiness gate state |
| `ReadinessGateRecord` criterion evaluation | Formal gate evaluation | Records per-criterion PASS/FAIL/WAIVED/NOT_APPLICABLE |
| `PEMobilizationAuthorization` creation | Formal gate authorization | State → `MOBILIZED`; stabilization window begins |
| Baseline lock action | Formal gate action | Creates `StartupBaseline`; state → `BASELINE_LOCKED` |

### 7.3 Annotation Scope by Role

| Role | May annotate | Restrictions |
|---|---|---|
| PX (Project Executive) | All sub-surfaces | No restrictions; full annotation scope |
| PER (Project Executive Reviewer) | All sub-surfaces | Annotations stored in annotation layer; may not initiate any certification or gate action |
| PM / PA | May annotate | Annotations stored in annotation layer; subject to annotation visibility rules |

### 7.4 Safety Module Executive Review Exclusion Does Not Apply

The Safety module (P3-E8) operates executive review exclusion rules for its own inspection and incident surfaces. These exclusion rules apply within the Safety module only. The Startup Safety Readiness surface (owned by `@hbc/project-startup`) is subject to standard executive review annotation. PE and PER may annotate any safety readiness item or remediation record without restriction.

---

## 8. Cross-Module Consumption Summary

| Module | Consumes Startup data | How | Direction |
|---|---|---|---|
| P3-D1 Activity Spine | Activity events per §1 | Activity event bus | Startup → Spine |
| P3-D2 Health Spine | Metrics per §2 | P3-D2 Health Spine publication contract consumed by Project Health Pulse | Startup → Spine |
| P3-D3 Work Queue | Items per §3 | `@hbc/my-work-feed` `StartupWorkAdapter` | Startup → Spine |
| P3-D4 Related Items | Relationships per §4 | `@hbc/related-items` registration | Startup → Spine |
| P3-E10 Closeout | `StartupBaseline` snapshot | `GET /api/startup/{projectId}/baseline` | **Closeout reads; Startup does not push** |
| P3-E7 Permits | Permit status for Section 4 display | Permit query API (read-only) | Startup reads Permits |
| P3-E8 Safety | Inspection log ID for Related Items | Safety query API (read-only) | Startup reads Safety |
| `@hbc/project-canvas` | Canvas tile content | Canvas tile registration | Startup publishes to canvas |

---

*[← T07](P3-E11-T07-Startup-Safety-Readiness-and-Permit-Posting-Verification.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T09 →](P3-E11-T09-Permissions-Role-Matrix-Lane-Ownership-and-Shared-Package-Reuse.md)*
